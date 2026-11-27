"""Sign in with GitHub, for exactly one GitHub account.

The standard OAuth authorization-code flow, run by Authlib:

1. /auth/github sends the browser to GitHub with a random `state`, which
   Authlib also keeps in a short-lived signed cookie.
2. GitHub sends the browser back to /auth/github/callback with a code and
   that state. Authlib checks the state against the cookie (so the sign-in
   was started from this browser) and swaps the code for an access token.
3. The token is used once, to ask GitHub whose it is. If it is the admin's
   account, the session cookie is set. The token is then dropped.

No scope is requested: the account's public profile is enough to read its id.
"""

from functools import lru_cache
from typing import Annotated, Any

import httpx2
from authlib.integrations.starlette_client import OAuth, OAuthError
from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import RedirectResponse

from resume_api.auth import set_session_cookie
from resume_api.config import Settings, get_settings

# The cookie that carries the sign-in state between steps 1 and 2.
STATE_COOKIE = "signin"
STATE_COOKIE_SECONDS = 600

router = APIRouter(prefix="/auth/github", tags=["auth"])


def build_client(settings: Settings, transport: httpx2.AsyncBaseTransport | None = None) -> Any:
    """The Authlib client for GitHub. Tests pass a transport that fakes GitHub."""
    oauth = OAuth()
    return oauth.register(
        name="github",
        client_id=settings.github_client_id,
        client_secret=settings.github_client_secret.get_secret_value(),
        authorize_url="https://github.com/login/oauth/authorize",
        access_token_url="https://github.com/login/oauth/access_token",  # noqa: S106
        api_base_url="https://api.github.com/",
        client_kwargs={"transport": transport} if transport else {},
    )


@lru_cache
def _client() -> Any:
    return build_client(get_settings())


def get_github() -> Any:
    return _client()


GitHubDep = Annotated[Any, Depends(get_github)]
SettingsDep = Annotated[Settings, Depends(get_settings)]


def _back_to_admin(settings: Settings, error: str | None = None) -> RedirectResponse:
    url = settings.admin_url if error is None else f"{settings.admin_url}?error={error}"
    return RedirectResponse(url, status_code=303)


@router.get(
    "",
    summary="Start signing in with GitHub",
    status_code=302,
    response_class=RedirectResponse,
    responses={302: {"description": "To GitHub's authorization page."}},
)
async def github_sign_in(
    request: Request, github: GitHubDep, settings: SettingsDep
) -> RedirectResponse:
    """Open this in the browser (a link, not a fetch)."""
    return await github.authorize_redirect(request, settings.github_callback_url)


@router.get(
    "/callback",
    summary="Finish signing in with GitHub",
    status_code=303,
    response_class=RedirectResponse,
    responses={
        303: {
            "description": (
                "Back to the site's admin page. With the session cookie if the "
                "account is the admin's; otherwise with `?error=denied` (another "
                "account) or `?error=signin` (the sign-in did not complete)."
            )
        }
    },
)
async def github_callback(
    request: Request,
    github: GitHubDep,
    settings: SettingsDep,
    code: Annotated[str | None, Query(description="The one-time code from GitHub.")] = None,
    state: Annotated[str | None, Query(description="Echo of the state sent to GitHub.")] = None,
    error: Annotated[str | None, Query(description="Set by GitHub if it refused.")] = None,
) -> RedirectResponse:
    """Where GitHub sends the browser back to. Not called directly."""
    try:
        token = await github.authorize_access_token(request)
        profile = await github.get("user", token=token)
        profile.raise_for_status()
    except OAuthError, httpx2.HTTPError:
        # Cancelled at GitHub, a stale or forged state, or GitHub being down.
        return _back_to_admin(settings, "signin")
    finally:
        request.session.clear()

    if profile.json().get("id") != settings.github_user_id:
        return _back_to_admin(settings, "denied")

    response = _back_to_admin(settings)
    set_session_cookie(response, settings)
    return response
