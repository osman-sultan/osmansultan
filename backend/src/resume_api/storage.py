"""The resume and its history, kept in one versioned S3 object.

Every upload or restore writes a new version of the same key. S3 keeps the
old ones, with their ids, dates and sizes, so the bucket is the history and
there is nothing else to keep in step with it. What S3 does not know (the
original file name, the note) rides along as object metadata.
"""

import hashlib
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache
from typing import TYPE_CHECKING, Annotated
from urllib.parse import quote, unquote

import boto3
from botocore.exceptions import ClientError
from fastapi import Depends

from resume_api.config import Settings, get_settings
from resume_api.models import ResumeVersion

if TYPE_CHECKING:
    from mypy_boto3_s3 import S3Client

RESUME_KEY = "resume.pdf"
# The name a visitor gets when they save the file.
DOWNLOAD_NAME = "Osman Sultan - Resume.pdf"
# Browsers and the CDN must ask before reusing a copy, so a new upload is
# what the next visitor sees.
CACHE_CONTROL = "public, max-age=0, must-revalidate"
CONTENT_TYPE = "application/pdf"
CONTENT_DISPOSITION = f"inline; filename*=UTF-8''{quote(DOWNLOAD_NAME)}"

_MISSING_CODES = {"NoSuchVersion", "NoSuchKey", "404", "InvalidArgument", "MethodNotAllowed"}


class VersionNotFoundError(Exception):
    pass


class UnchangedError(Exception):
    """The requested write would repeat what is already the current version."""


class ResumeStore:
    def __init__(self, client: S3Client, bucket: str) -> None:
        self._s3 = client
        self._bucket = bucket

    def list_versions(self) -> list[ResumeVersion]:
        """Every version, newest first."""
        entries = []
        pages = self._s3.get_paginator("list_object_versions").paginate(
            Bucket=self._bucket, Prefix=RESUME_KEY
        )
        for page in pages:
            entries += [v for v in page.get("Versions", []) if v["Key"] == RESUME_KEY]
        entries.sort(key=lambda v: v["LastModified"], reverse=True)
        if not entries:
            return []

        # The listing has no metadata; fetch it per version, in parallel.
        with ThreadPoolExecutor(max_workers=16) as pool:
            metadata = list(pool.map(lambda v: self._metadata(v["VersionId"]), entries))

        total = len(entries)
        return [
            ResumeVersion(
                id=entry["VersionId"],
                number=total - index,
                uploaded_at=entry["LastModified"],
                size=entry["Size"],
                is_current=entry["IsLatest"],
                filename=meta.get("filename"),
                note=meta.get("note"),
                sha256=meta.get("sha256"),
                restored_from=meta.get("restored-from"),
            )
            for index, (entry, meta) in enumerate(zip(entries, metadata, strict=True))
        ]

    def upload(self, data: bytes, filename: str | None, note: str | None) -> ResumeVersion:
        digest = hashlib.sha256(data).hexdigest()
        if self._current_metadata().get("sha256") == digest:
            raise UnchangedError
        self._s3.put_object(
            Bucket=self._bucket,
            Key=RESUME_KEY,
            Body=data,
            Metadata=_encode({"filename": filename, "note": note, "sha256": digest}),
            ContentType=CONTENT_TYPE,
            CacheControl=CACHE_CONTROL,
            ContentDisposition=CONTENT_DISPOSITION,
        )
        return self.list_versions()[0]

    def restore(self, version_id: str) -> ResumeVersion:
        """Make an old version current again, as a new version on top."""
        versions = self.list_versions()
        source = next((v for v in versions if v.id == version_id), None)
        if source is None:
            raise VersionNotFoundError(version_id)
        if source.is_current:
            raise UnchangedError
        self._s3.copy_object(
            Bucket=self._bucket,
            Key=RESUME_KEY,
            CopySource={"Bucket": self._bucket, "Key": RESUME_KEY, "VersionId": version_id},
            MetadataDirective="REPLACE",
            Metadata=_encode(
                {
                    "filename": source.filename,
                    "note": source.note,
                    "sha256": source.sha256,
                    "restored-from": version_id,
                }
            ),
            ContentType=CONTENT_TYPE,
            CacheControl=CACHE_CONTROL,
            ContentDisposition=CONTENT_DISPOSITION,
        )
        return self.list_versions()[0]

    def read(self, version_id: str | None = None) -> bytes:
        """The PDF bytes of one version, or of the current one."""
        try:
            if version_id is None:
                response = self._s3.get_object(Bucket=self._bucket, Key=RESUME_KEY)
            else:
                response = self._s3.get_object(
                    Bucket=self._bucket, Key=RESUME_KEY, VersionId=version_id
                )
        except ClientError as error:
            if _is_missing(error):
                raise VersionNotFoundError(version_id) from error
            raise
        return response["Body"].read()

    def _metadata(self, version_id: str) -> dict[str, str]:
        head = self._s3.head_object(Bucket=self._bucket, Key=RESUME_KEY, VersionId=version_id)
        return _decode(head.get("Metadata", {}))

    def _current_metadata(self) -> dict[str, str]:
        try:
            head = self._s3.head_object(Bucket=self._bucket, Key=RESUME_KEY)
        except ClientError as error:
            if _is_missing(error):
                return {}
            raise
        return _decode(head.get("Metadata", {}))


def _is_missing(error: ClientError) -> bool:
    return error.response.get("Error", {}).get("Code") in _MISSING_CODES


def _encode(metadata: dict[str, str | None]) -> dict[str, str]:
    # S3 metadata travels in HTTP headers, so it has to be ASCII.
    return {key: quote(value, safe="") for key, value in metadata.items() if value}


def _decode(metadata: dict[str, str]) -> dict[str, str]:
    return {key: unquote(value) for key, value in metadata.items()}


@lru_cache
def _client() -> S3Client:
    return boto3.client("s3")


def get_store(settings: Annotated[Settings, Depends(get_settings)]) -> ResumeStore:
    return ResumeStore(_client(), settings.resume_bucket)
