from fastapi.testclient import TestClient

from resume_api.main import MAX_PDF_BYTES

from .conftest import pdf


def upload(client: TestClient, body: str, note: str | None = None, name: str = "resume.pdf"):
    return client.post(
        "/resume/versions",
        files={"file": (name, pdf(body), "application/pdf")},
        data={"note": note} if note is not None else None,
    )


def test_history_starts_empty(admin: TestClient) -> None:
    assert admin.get("/resume/versions").json() == []
    assert admin.get("/resume.pdf").status_code == 404


def test_upload_becomes_the_current_resume(admin: TestClient) -> None:
    response = upload(admin, "one", note="  first cut  ", name="Résumé final.pdf")

    assert response.status_code == 201
    version = response.json()
    assert version["number"] == 1
    assert version["is_current"] is True
    assert version["filename"] == "Résumé final.pdf"
    assert version["note"] == "first cut"
    assert version["size"] == len(pdf("one"))
    assert version["restored_from"] is None

    public = admin.get("/resume.pdf")
    assert public.content == pdf("one")
    assert public.headers["content-type"] == "application/pdf"


def test_the_public_resume_needs_no_session(admin: TestClient, client: TestClient) -> None:
    upload(admin, "one")
    admin.post("/auth/logout")

    assert client.get("/resume.pdf").content == pdf("one")


def test_history_is_newest_first_and_keeps_every_version(admin: TestClient) -> None:
    upload(admin, "one", note="first")
    upload(admin, "two", note="second")
    upload(admin, "three")

    versions = admin.get("/resume/versions").json()

    assert [v["number"] for v in versions] == [3, 2, 1]
    assert [v["note"] for v in versions] == [None, "second", "first"]
    assert [v["is_current"] for v in versions] == [True, False, False]
    assert admin.get("/resume.pdf").content == pdf("three")
    # Old versions are still readable, byte for byte.
    assert admin.get(f"/resume/versions/{versions[2]['id']}").content == pdf("one")


def test_restore_puts_an_old_version_on_top(admin: TestClient) -> None:
    first = upload(admin, "one", note="first").json()
    upload(admin, "two")

    response = admin.post(f"/resume/versions/{first['id']}/restore")

    assert response.status_code == 201
    restored = response.json()
    assert restored["number"] == 3
    assert restored["is_current"] is True
    assert restored["restored_from"] == first["id"]
    assert restored["note"] == "first"
    assert restored["sha256"] == first["sha256"]
    assert admin.get("/resume.pdf").content == pdf("one")
    # Nothing was lost: all three are in the history.
    assert len(admin.get("/resume/versions").json()) == 3


def test_restoring_the_current_version_is_a_conflict(admin: TestClient) -> None:
    current = upload(admin, "one").json()

    assert admin.post(f"/resume/versions/{current['id']}/restore").status_code == 409
    assert len(admin.get("/resume/versions").json()) == 1


def test_uploading_the_same_file_twice_is_a_conflict(admin: TestClient) -> None:
    upload(admin, "one")

    assert upload(admin, "one").status_code == 409
    assert len(admin.get("/resume/versions").json()) == 1


def test_only_pdfs_are_accepted(admin: TestClient) -> None:
    response = admin.post(
        "/resume/versions", files={"file": ("resume.pdf", b"<html>", "application/pdf")}
    )

    assert response.status_code == 415
    assert admin.get("/resume/versions").json() == []


def test_oversized_files_are_refused(admin: TestClient) -> None:
    too_big = b"%PDF-" + b"0" * MAX_PDF_BYTES

    response = admin.post(
        "/resume/versions", files={"file": ("resume.pdf", too_big, "application/pdf")}
    )

    assert response.status_code == 413


def test_a_long_note_is_refused(admin: TestClient) -> None:
    assert upload(admin, "one", note="x" * 201).status_code == 422


def test_unknown_versions_are_not_found(admin: TestClient) -> None:
    upload(admin, "one")

    assert admin.get("/resume/versions/nope").status_code == 404
    assert admin.post("/resume/versions/nope/restore").status_code == 404
