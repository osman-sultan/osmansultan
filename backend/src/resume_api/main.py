from importlib.metadata import version
from typing import Annotated, Any

from fastapi import (
    APIRouter,
    Depends,
    FastAPI,
    File,
    Form,
    HTTPException,
    Path,
    Request,
    Response,
    UploadFile,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from resume_api import github
from resume_api.auth import clear_session_cookie, require_admin, require_trusted_origin
from resume_api.config import Settings, get_settings
from resume_api.models import NOTE_MAX_LENGTH, Error, ResumeVersion
from resume_api.storage import (
    CACHE_CONTROL,
    ResumeStore,
    UnchangedError,
    VersionNotFoundError,
    get_store,
)

# A Lambda request tops out at 6 MB, and a binary body is base64 encoded on
# the way in, which leaves a little over 4 MB. A resume is a fraction of that.
MAX_PDF_BYTES = 4 * 1024 * 1024
PDF_MAGIC = b"%PDF-"

SettingsDep = Annotated[Settings, Depends(get_settings)]
StoreDep = Annotated[ResumeStore, Depends(get_store)]
VersionId = Annotated[str, Path(description="Id of a version, as listed by `/resume/versions`.")]

# ---- OpenAPI ----------------------------------------------------------------

DESCRIPTION = """
Keeps the resume shown on osmansultan.xyz, and every version of it.

The current resume is public at `/resume.pdf`. Everything under `/resume` is
for the site's admin page and needs the session cookie, which is obtained by
signing in with GitHub at `/auth/github`. Only one GitHub account is let in.

Errors are `{"detail": "..."}`.
"""

TAGS = [
    {"name": "public", "description": "Open to anyone."},
    {"name": "auth", "description": "Signing in and out."},
    {"name": "resume", "description": "The resume's history. Admin only."},
]

_ERRORS = {
    401: "Not signed in.",
    403: "A page on another site sent the request.",
    404: "No such version.",
    409: "Nothing would change: this is already the current resume.",
    413: "The file is too large.",
    415: "The file is not a PDF.",
}
_PDF: dict[str, Any] = {
    "content": {"application/pdf": {"schema": {"type": "string", "format": "binary"}}}
}


def errors(*codes: int) -> dict[int | str, dict[str, Any]]:
    """The documented error responses of a route."""
    return {code: {"model": Error, "description": _ERRORS[code]} for code in codes}


# ---- Routes -----------------------------------------------------------------

auth = APIRouter(prefix="/auth", tags=["auth"])
resume = APIRouter(prefix="/resume", tags=["resume"], dependencies=[Depends(require_admin)])
public = APIRouter(tags=["public"])


@auth.post(
    "/logout",
    summary="Sign out",
    status_code=status.HTTP_204_NO_CONTENT,
    responses=errors(403),
)
def sign_out(response: Response, settings: SettingsDep) -> None:
    """Clears the session cookie. Fine to call when not signed in."""
    clear_session_cookie(response, settings)


@auth.get(
    "/session",
    summary="Check the session",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
    responses=errors(401),
)
def check_session() -> None:
    """204 when signed in, 401 otherwise."""


@resume.get("/versions", summary="List every version", responses=errors(401))
def list_versions(store: StoreDep) -> list[ResumeVersion]:
    """Newest first. The first entry is the current resume."""
    return store.list_versions()


@resume.post(
    "/versions",
    summary="Upload a new resume",
    status_code=status.HTTP_201_CREATED,
    responses=errors(401, 403, 409, 413, 415),
)
def upload_version(
    store: StoreDep,
    file: Annotated[UploadFile, File(description="The PDF, at most 4 MB.")],
    note: Annotated[
        str | None,
        Form(max_length=NOTE_MAX_LENGTH, description="What changed, for the history."),
    ] = None,
) -> ResumeVersion:
    """The upload becomes the current resume at once. Older versions are kept."""
    # Read one byte past the limit so an oversized file is caught without
    # pulling all of it into memory.
    data = file.file.read(MAX_PDF_BYTES + 1)
    if len(data) > MAX_PDF_BYTES:
        raise HTTPException(
            status.HTTP_413_CONTENT_TOO_LARGE,
            f"The PDF is larger than {MAX_PDF_BYTES // (1024 * 1024)} MB.",
        )
    if not data.startswith(PDF_MAGIC):
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "That file is not a PDF.")
    try:
        return store.upload(data, filename=file.filename, note=(note or "").strip() or None)
    except UnchangedError:
        raise HTTPException(
            status.HTTP_409_CONFLICT, "That file is identical to the current resume."
        ) from None


@resume.get(
    "/versions/{version_id}",
    summary="Read one version",
    response_class=Response,
    responses={200: {"description": "The PDF of that version.", **_PDF}, **errors(401, 404)},
)
def read_version(version_id: VersionId, store: StoreDep) -> Response:
    try:
        data = store.read(version_id)
    except VersionNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No such version.") from None
    return Response(
        data,
        media_type="application/pdf",
        headers={"Cache-Control": "private, no-store", "Content-Disposition": "inline"},
    )


@resume.post(
    "/versions/{version_id}/restore",
    summary="Make an old version current again",
    status_code=status.HTTP_201_CREATED,
    responses=errors(401, 403, 404, 409),
)
def restore_version(version_id: VersionId, store: StoreDep) -> ResumeVersion:
    """Adds a new version with the old one's content. Nothing is removed."""
    try:
        return store.restore(version_id)
    except VersionNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No such version.") from None
    except UnchangedError:
        raise HTTPException(
            status.HTTP_409_CONFLICT, "That version is already the current resume."
        ) from None


@public.get(
    "/resume.pdf",
    summary="The current resume",
    response_class=Response,
    responses={
        200: {"description": "The PDF.", **_PDF},
        404: {"model": Error, "description": "No resume has been uploaded yet."},
    },
)
def current_resume(store: StoreDep) -> Response:
    """Public.

    In AWS the CDN answers this path straight from the bucket and the request
    never gets here. This is what serves it in local development.
    """
    try:
        data = store.read()
    except VersionNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No resume has been uploaded.") from None
    return Response(
        data,
        media_type="application/pdf",
        # A public file: any page may fetch it.
        headers={"Cache-Control": CACHE_CONTROL, "Access-Control-Allow-Origin": "*"},
    )


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Resume API",
        summary="Upload the resume for osmansultan.xyz and keep its history.",
        description=DESCRIPTION,
        version=version("resume-api"),
        openapi_tags=TAGS,
        servers=[{"url": settings.api_url}],
        # Operation ids are the function names: list_versions, not
        # list_versions_resume_versions_get.
        generate_unique_id_function=lambda route: route.name,
        docs_url="/docs" if settings.docs else None,
        redoc_url=None,
        openapi_url="/openapi.json" if settings.docs else None,
        dependencies=[Depends(require_trusted_origin)],
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.site_url],
        allow_credentials=True,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )
    # Holds the sign-in state while the browser is away at GitHub (github.py).
    # Lax, not strict: the browser has to send it when GitHub redirects back.
    app.add_middleware(
        SessionMiddleware,
        secret_key=settings.session_secret.get_secret_value(),
        session_cookie=github.STATE_COOKIE,
        max_age=github.STATE_COOKIE_SECONDS,
        same_site="lax",
        https_only=settings.cookie_secure,
    )

    @app.middleware("http")
    async def no_store_by_default(request: Request, call_next):
        """Keep the CDN and browsers from caching anything not meant to be.

        Responses differ by who is signed in, and the CDN does not look at the
        cookie. Only a route that sets Cache-Control itself (the public
        resume) is cacheable.
        """
        response = await call_next(request)
        response.headers.setdefault("Cache-Control", "no-store")
        return response

    app.include_router(auth)
    app.include_router(github.router)
    app.include_router(resume)
    app.include_router(public)
    return app


app = create_app()
