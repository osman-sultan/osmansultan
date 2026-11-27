import os
from collections.abc import Iterator

import boto3
import httpx2
import pytest
from fastapi.testclient import TestClient
from moto import mock_aws

BUCKET = "resume-test"
SITE = "https://osmansultan.xyz"
ADMIN_GITHUB_ID = 1001

# Set before the app is imported: it reads its settings on import. The AWS
# values are fakes for moto, so a test can never reach a real account.
os.environ.update(
    RESUME_BUCKET=BUCKET,
    GITHUB_CLIENT_ID="test-client-id",
    GITHUB_CLIENT_SECRET="test-client-secret",
    GITHUB_USER_ID=str(ADMIN_GITHUB_ID),
    SESSION_SECRET="0123456789abcdef0123456789abcdef",
    API_URL="https://api.test",
    SITE_URL=SITE,
    AWS_ACCESS_KEY_ID="testing",
    AWS_SECRET_ACCESS_KEY="testing",
    AWS_DEFAULT_REGION="us-east-1",
)
os.environ.pop("AWS_PROFILE", None)


def pdf(body: str = "one") -> bytes:
    return f"%PDF-1.7\n{body}\n%%EOF".encode()


class FakeGitHub:
    """Stands in for github.com: answers the token exchange and /user."""

    def __init__(self) -> None:
        # The account that "signs in" at GitHub.
        self.user_id = ADMIN_GITHUB_ID
        self.requests: list[httpx2.Request] = []

    def __call__(self, request: httpx2.Request) -> httpx2.Response:
        self.requests.append(request)
        if request.url.path == "/login/oauth/access_token":
            return httpx2.Response(200, json={"access_token": "gho_test", "token_type": "bearer"})
        if request.url.host == "api.github.com" and request.url.path == "/user":
            return httpx2.Response(200, json={"id": self.user_id, "login": "someone"})
        return httpx2.Response(404)


@pytest.fixture
def fake_github() -> FakeGitHub:
    return FakeGitHub()


@pytest.fixture
def client(fake_github: FakeGitHub) -> Iterator[TestClient]:
    """A signed-out client against an empty, versioned bucket."""
    from resume_api.config import get_settings
    from resume_api.github import build_client, get_github
    from resume_api.main import app
    from resume_api.storage import _client

    github = build_client(get_settings(), transport=httpx2.MockTransport(fake_github))
    app.dependency_overrides[get_github] = lambda: github

    with mock_aws():
        _client.cache_clear()
        s3 = boto3.client("s3")
        s3.create_bucket(Bucket=BUCKET)
        s3.put_bucket_versioning(Bucket=BUCKET, VersioningConfiguration={"Status": "Enabled"})
        # https, so the client keeps the Secure cookies. Redirects are not
        # followed: they lead to GitHub and to the site.
        with TestClient(app, base_url="https://api.test", follow_redirects=False) as test_client:
            yield test_client
    _client.cache_clear()
    app.dependency_overrides.clear()


def sign_in(client: TestClient) -> httpx2.Response:
    """Walk the whole GitHub flow and return the callback's response."""
    to_github = client.get("/auth/github")
    assert to_github.status_code == 302
    state = httpx2.URL(to_github.headers["location"]).params["state"]
    return client.get("/auth/github/callback", params={"code": "a-code", "state": state})


@pytest.fixture
def admin(client: TestClient) -> TestClient:
    """The same client, signed in."""
    assert sign_in(client).headers["location"] == f"{SITE}/admin"
    assert client.get("/auth/session").status_code == 204
    return client
