from fastapi.testclient import TestClient

from resume_api.main import app

METHODS = {"get", "post", "put", "patch", "delete"}


def operations() -> dict[str, dict]:
    spec = app.openapi()
    return {
        operation["operationId"]: operation
        for path in spec["paths"].values()
        for method, operation in path.items()
        if method in METHODS
    }


def test_every_operation_is_named_and_described() -> None:
    assert set(operations()) == {
        "github_sign_in",
        "github_callback",
        "sign_out",
        "check_session",
        "list_versions",
        "upload_version",
        "read_version",
        "restore_version",
        "current_resume",
    }
    for name, operation in operations().items():
        assert operation["summary"], name
        assert operation["tags"], name
        for code, response in operation["responses"].items():
            assert response["description"], (name, code)


def test_admin_routes_declare_the_session_cookie_and_401() -> None:
    spec = app.openapi()
    assert spec["components"]["securitySchemes"]["SessionCookie"] == {
        "type": "apiKey",
        "in": "cookie",
        "name": "session",
        "description": spec["components"]["securitySchemes"]["SessionCookie"]["description"],
    }
    admin_only = {"check_session", "list_versions", "upload_version", "read_version"}
    admin_only.add("restore_version")
    for name, operation in operations().items():
        secured = operation.get("security") == [{"SessionCookie": []}]
        assert secured == (name in admin_only), name
        assert ("401" in operation["responses"]) == (name in admin_only), name


def test_documented_responses_match_what_the_routes_send() -> None:
    ops = operations()
    error = {"$ref": "#/components/schemas/Error"}

    assert set(ops["upload_version"]["responses"]) == {
        "201",
        "401",
        "403",
        "409",
        "413",
        "415",
        "422",
    }
    assert set(ops["restore_version"]["responses"]) == {"201", "401", "403", "404", "409", "422"}
    for code in ("401", "403", "409", "413", "415"):
        assert (
            ops["upload_version"]["responses"][code]["content"]["application/json"]["schema"]
            == error
        )
    # PDFs are documented as PDFs, not as JSON.
    for name in ("read_version", "current_resume"):
        assert list(ops[name]["responses"]["200"]["content"]) == ["application/pdf"]
    # Redirects are documented as redirects, with no body.
    assert set(ops["github_sign_in"]["responses"]) == {"302"}
    assert set(ops["github_callback"]["responses"]) == {"303", "422"}
    for code in ("204",):
        assert "content" not in ops["sign_out"]["responses"][code]


def test_the_spec_is_served_only_when_docs_are_on(client: TestClient) -> None:
    assert app.openapi()["info"]["title"] == "Resume API"
    assert app.openapi()["servers"] == [{"url": "https://api.test"}]
    assert client.get("/openapi.json").status_code == 404
