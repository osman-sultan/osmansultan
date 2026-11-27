from functools import lru_cache

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration, read from the environment.

    In AWS the values are set on the Lambda by sst.config.ts. Locally they
    come from the shell or from backend/.env.
    """

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # The private, versioned bucket that holds the resume.
    resume_bucket: str

    # The GitHub OAuth app used for sign-in, and the one account let in.
    # The numeric id, not the login: a login can be renamed and re-registered
    # by someone else, the id cannot.
    github_client_id: str
    github_client_secret: SecretStr
    github_user_id: int

    # Signs the session cookie and the short-lived sign-in state cookie.
    session_secret: SecretStr = Field(min_length=32)
    session_days: int = 30

    # Where this API is reached; GitHub sends the browser back here.
    api_url: str = "https://api.osmansultan.xyz"
    # The site. The only origin allowed to call this API from a browser, and
    # where the browser lands after signing in.
    site_url: str = "https://osmansultan.xyz"

    # Off only for local http development.
    cookie_secure: bool = True
    # Interactive docs at /docs. Off in production.
    docs: bool = False

    @property
    def admin_url(self) -> str:
        return f"{self.site_url}/admin"

    @property
    def github_callback_url(self) -> str:
        return f"{self.api_url}/auth/github/callback"


@lru_cache
def get_settings() -> Settings:
    return Settings()
