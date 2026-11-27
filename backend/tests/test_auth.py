import time

import httpx2
import pytest
from fastapi.testclient import TestClient

from resume_api.auth import COOKIE_NAME, issue_token, token_is_valid
from resume_api.config import get_settings

from .conftest import SITE, FakeGitHub, sign_in


def test_sign_in_starts_at_github(client: TestClient) -> None:
    response = client.get("/auth/github")

    assert response.status_code == 302
    target = httpx2.URL(response.headers["location"])
    assert target.host == "github.com"
    assert target.path == "/login/oauth/authorize"
    assert target.params["client_id"] == "test-client-id"
    assert target.params["redirect_uri"] == "https://api.test/auth/github/callback"
    assert target.params["state"]
    # No scope: the public profile is all that is read.
    assert "scope" not in target.params


def test_the_admin_account_gets_a_locked_down_session(
    client: TestClient, fake_github: FakeGitHub
) -> None:
    response = sign_in(client)

    assert response.status_code == 303
    assert response.headers["location"] == f"{SITE}/admin"
    cookie = next(c for c in response.headers.get_list("set-cookie") if c.startswith(COOKIE_NAME))
    for attribute in ("HttpOnly", "Secure", "SameSite=strict", "Path=/"):
        assert attribute in cookie
    assert client.get("/auth/session").status_code == 204
    # The code was exchanged with the app's secret, and the profile was read.
    exchange, profile = fake_github.requests
    assert b"code=a-code" in exchange.content
    assert profile.headers["authorization"] == "Bearer gho_test"


def test_any_other_github_account_is_turned_away(
    client: TestClient, fake_github: FakeGitHub
) -> None:
    fake_github.user_id = 2002

    response = sign_in(client)

    assert response.headers["location"] == f"{SITE}/admin?error=denied"
    assert COOKIE_NAME not in client.cookies
    assert client.get("/auth/session").status_code == 401


def test_a_callback_with_the_wrong_state_is_refused(
    client: TestClient, fake_github: FakeGitHub
) -> None:
    client.get("/auth/github")

    response = client.get("/auth/github/callback", params={"code": "a-code", "state": "forged"})

    assert response.headers["location"] == f"{SITE}/admin?error=signin"
    assert client.get("/auth/session").status_code == 401
    # The code was never sent to GitHub.
    assert fake_github.requests == []


def test_a_callback_nobody_started_is_refused(client: TestClient) -> None:
    response = client.get("/auth/github/callback", params={"code": "a-code", "state": "x"})

    assert response.headers["location"] == f"{SITE}/admin?error=signin"
    assert client.get("/auth/session").status_code == 401


def test_cancelling_at_github_is_handled(client: TestClient) -> None:
    to_github = client.get("/auth/github")
    state = httpx2.URL(to_github.headers["location"]).params["state"]

    response = client.get(
        "/auth/github/callback", params={"error": "access_denied", "state": state}
    )

    assert response.headers["location"] == f"{SITE}/admin?error=signin"


def test_sign_out_ends_the_session(admin: TestClient) -> None:
    assert admin.post("/auth/logout").status_code == 204
    assert admin.get("/auth/session").status_code == 401


@pytest.mark.parametrize(
    ("method", "path"),
    [
        ("GET", "/resume/versions"),
        ("POST", "/resume/versions"),
        ("GET", "/resume/versions/abc"),
        ("POST", "/resume/versions/abc/restore"),
    ],
)
def test_resume_routes_need_a_session(client: TestClient, method: str, path: str) -> None:
    assert client.request(method, path).status_code == 401


def test_a_forged_or_expired_token_is_refused(client: TestClient) -> None:
    settings = get_settings()
    good = issue_token(settings)
    expiry, _, signature = good.partition(".")

    assert token_is_valid(good, settings)
    # Pushing the expiry out without re-signing does not work.
    assert not token_is_valid(f"{int(expiry) + 1}.{signature}", settings)
    assert not token_is_valid(good, settings, now=time.time() + 31 * 86400)
    for junk in ("", ".", "abc", f"{expiry}.", f".{signature}", "١٢٣.abc"):
        assert not token_is_valid(junk, settings)

    client.cookies.set(COOKIE_NAME, f"{int(expiry) + 1}.{signature}")
    assert client.get("/auth/session").status_code == 401


def test_writes_from_another_site_are_refused(admin: TestClient) -> None:
    response = admin.post("/auth/logout", headers={"Origin": "https://evil.example"})
    assert response.status_code == 403

    # Still signed in: the logout above did not run.
    assert admin.get("/auth/session").status_code == 204
    assert admin.post("/auth/logout", headers={"Origin": SITE}).status_code == 204


def test_cors_allows_only_the_site(client: TestClient) -> None:
    def preflight(origin: str) -> dict[str, str]:
        response = client.options(
            "/resume/versions",
            headers={"Origin": origin, "Access-Control-Request-Method": "POST"},
        )
        return dict(response.headers)

    allowed = preflight(SITE)
    assert allowed["access-control-allow-origin"] == SITE
    assert allowed["access-control-allow-credentials"] == "true"
    assert "access-control-allow-origin" not in preflight("https://evil.example")


def test_docs_are_off_by_default(client: TestClient) -> None:
    assert client.get("/docs").status_code == 404
    assert client.get("/openapi.json").status_code == 404


def test_only_the_public_resume_is_cacheable(admin: TestClient) -> None:
    from .conftest import pdf

    admin.post("/resume/versions", files={"file": ("resume.pdf", pdf(), "application/pdf")})

    assert admin.get("/resume/versions").headers["cache-control"] == "no-store"
    assert admin.get("/auth/session").headers["cache-control"] == "no-store"
    assert admin.get("/nope").headers["cache-control"] == "no-store"
    assert "max-age=0" in admin.get("/resume.pdf").headers["cache-control"]
