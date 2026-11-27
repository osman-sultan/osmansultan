"""The admin session: a signed cookie, issued after a GitHub sign-in.

The cookie value is `<expiry>.<signature>`, where the signature is an
HMAC-SHA256 over the expiry. Nothing is stored server side, and there is
only one admin, so the token carries no identity: holding a valid one is
the whole claim. How the sign-in itself works is in github.py.
"""

import hashlib
import hmac
import time
from typing import Annotated

from fastapi import Depends, HTTPException, Request, Response, status
from fastapi.security import APIKeyCookie

from resume_api.config import Settings, get_settings

COOKIE_NAME = "session"
_SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}

# Reads the cookie, and describes it in the OpenAPI docs. auto_error is off
# so a missing cookie and a bad one get the same 401 from require_admin.
session_cookie = APIKeyCookie(
    name=COOKIE_NAME,
    scheme_name="SessionCookie",
    description=(
        "Set by signing in through `/auth/github`. HttpOnly and SameSite=Strict, "
        "so only the site's own pages can send it."
    ),
    auto_error=False,
)


def _sign(expires_at: int, settings: Settings) -> str:
    key = settings.session_secret.get_secret_value().encode()
    message = f"session:{expires_at}".encode()
    return hmac.new(key, message, hashlib.sha256).hexdigest()


def issue_token(settings: Settings, now: float | None = None) -> str:
    current = time.time() if now is None else now
    expires_at = int(current) + settings.session_days * 86400
    return f"{expires_at}.{_sign(expires_at, settings)}"


def token_is_valid(token: str, settings: Settings, now: float | None = None) -> bool:
    expiry, _, signature = token.partition(".")
    if not expiry.isascii() or not expiry.isdigit() or not signature:
        return False
    expires_at = int(expiry)
    current = time.time() if now is None else now
    if expires_at <= current:
        return False
    return hmac.compare_digest(_sign(expires_at, settings), signature)


def set_session_cookie(response: Response, settings: Settings) -> None:
    response.set_cookie(
        COOKIE_NAME,
        issue_token(settings),
        max_age=settings.session_days * 86400,
        httponly=True,
        secure=settings.cookie_secure,
        # The site and this API share a registrable domain, so the browser
        # sends the cookie from the site but never from another site.
        samesite="strict",
        path="/",
    )


def clear_session_cookie(response: Response, settings: Settings) -> None:
    response.delete_cookie(
        COOKIE_NAME,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="strict",
        path="/",
    )


def require_trusted_origin(
    request: Request, settings: Annotated[Settings, Depends(get_settings)]
) -> None:
    """Refuse state-changing requests that a browser sent from another site.

    Browsers always send Origin on cross-origin and on non-GET requests.
    Clients that are not browsers send none, and have no cookie to abuse.
    """
    if request.method in _SAFE_METHODS:
        return
    origin = request.headers.get("origin")
    if origin is not None and origin != settings.site_url:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Origin not allowed.")


def require_admin(
    settings: Annotated[Settings, Depends(get_settings)],
    token: Annotated[str | None, Depends(session_cookie)],
) -> None:
    if token is None or not token_is_valid(token, settings):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not signed in.")
