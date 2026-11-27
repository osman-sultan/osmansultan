from datetime import datetime

from pydantic import BaseModel, Field

NOTE_MAX_LENGTH = 200


class Error(BaseModel):
    """The body of an error response."""

    detail: str = Field(description="What went wrong, in a sentence.")


class ResumeVersion(BaseModel):
    """One entry in the resume's history."""

    id: str = Field(description="The S3 version id.")
    number: int = Field(description="1 for the oldest version, counting up.")
    uploaded_at: datetime
    size: int = Field(description="Size of the PDF in bytes.")
    is_current: bool = Field(description="Whether this is the version the site serves.")
    filename: str | None = Field(description="Name of the file as it was uploaded.")
    note: str | None
    sha256: str | None
    restored_from: str | None = Field(
        description="Id of the version this one was restored from, if it was a restore."
    )
