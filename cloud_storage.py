"""
PROMETHEUS — Cloud Storage Module
Google Cloud Storage backend for backups.
Credentials loaded from gcs_key.json (service account).
"""

import json
import logging
import os
from datetime import datetime
from pathlib import Path
from typing import Optional, Tuple

log = logging.getLogger("neon_genesis")

# Path to the service account key (relative to project root)
_DEFAULT_KEY_FILE = Path(__file__).parent / "gcs_key.json"


def _get_client(credentials_path: str):
    """Create and return a GCS client using the service account key."""
    from google.cloud import storage
    from google.oauth2 import service_account

    creds = service_account.Credentials.from_service_account_file(
        str(credentials_path),
        scopes=["https://www.googleapis.com/auth/cloud-platform"],
    )
    return storage.Client(credentials=creds, project=creds.project_id)


def upload_backup(
    local_zip_path: str,
    bucket_name: str,
    object_name: Optional[str] = None,
    credentials_path: Optional[str] = None,
) -> Tuple[bool, str]:
    """
    Upload a local zip file to GCS.

    Returns:
        (success: bool, gcs_uri_or_error_msg: str)
    """
    if credentials_path is None:
        credentials_path = str(_DEFAULT_KEY_FILE)

    if not Path(credentials_path).exists():
        return False, f"GCS credentials file not found: {credentials_path}"

    local_path = Path(local_zip_path)
    if not local_path.exists():
        return False, f"Local backup file not found: {local_zip_path}"

    if object_name is None:
        ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        object_name = f"prometheus-backups/{local_path.stem}_{ts}.zip"

    try:
        client = _get_client(credentials_path)
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(object_name)
        blob.upload_from_filename(str(local_path), content_type="application/zip")
        gcs_uri = f"gs://{bucket_name}/{object_name}"
        log.info(f"[GCS] Uploaded {local_path.name} → {gcs_uri}")
        return True, gcs_uri
    except Exception as e:
        err = str(e)
        log.error(f"[GCS] Upload failed: {err}")
        return False, err


def download_backup(
    object_name: str,
    dest_path: str,
    bucket_name: str,
    credentials_path: Optional[str] = None,
) -> Tuple[bool, str]:
    """
    Download a backup zip from GCS to a local path.

    Returns:
        (success: bool, local_path_or_error: str)
    """
    if credentials_path is None:
        credentials_path = str(_DEFAULT_KEY_FILE)

    if not Path(credentials_path).exists():
        return False, f"GCS credentials file not found: {credentials_path}"

    try:
        client = _get_client(credentials_path)
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(object_name)

        dest = Path(dest_path)
        dest.parent.mkdir(parents=True, exist_ok=True)
        blob.download_to_filename(str(dest))
        log.info(f"[GCS] Downloaded gs://{bucket_name}/{object_name} → {dest}")
        return True, str(dest)
    except Exception as e:
        err = str(e)
        log.error(f"[GCS] Download failed: {err}")
        return False, err


def list_cloud_backups(
    bucket_name: str,
    prefix: str = "prometheus-backups/",
    credentials_path: Optional[str] = None,
) -> Tuple[bool, list]:
    """
    List all backup objects in GCS bucket under the given prefix.

    Returns:
        (success: bool, list_of_dicts_or_error)
    """
    if credentials_path is None:
        credentials_path = str(_DEFAULT_KEY_FILE)

    if not Path(credentials_path).exists():
        return False, []

    try:
        client = _get_client(credentials_path)
        bucket = client.bucket(bucket_name)
        blobs = list(bucket.list_blobs(prefix=prefix))
        result = []
        for blob in blobs:
            size_bytes = blob.size or 0
            result.append({
                "object_name": blob.name,
                "name": Path(blob.name).stem,
                "size_bytes": size_bytes,
                "size_human": _fmt_size(size_bytes),
                "updated": blob.updated.isoformat() if blob.updated else "",
                "gcs_uri": f"gs://{bucket_name}/{blob.name}",
                "bucket": bucket_name,
            })
        result.sort(key=lambda x: x["updated"], reverse=True)
        return True, result
    except Exception as e:
        err = str(e)
        log.error(f"[GCS] List failed: {err}")
        return False, []


def delete_cloud_backup(
    object_name: str,
    bucket_name: str,
    credentials_path: Optional[str] = None,
) -> Tuple[bool, str]:
    """Delete a backup object from GCS."""
    if credentials_path is None:
        credentials_path = str(_DEFAULT_KEY_FILE)

    try:
        client = _get_client(credentials_path)
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(object_name)
        blob.delete()
        log.info(f"[GCS] Deleted gs://{bucket_name}/{object_name}")
        return True, f"Deleted gs://{bucket_name}/{object_name}"
    except Exception as e:
        err = str(e)
        log.error(f"[GCS] Delete failed: {err}")
        return False, err


def test_connection(
    bucket_name: str,
    credentials_path: Optional[str] = None,
) -> Tuple[bool, str]:
    """
    Test GCS connectivity by listing objects (needs only storage.objects.list).
    Does NOT call get_bucket() to avoid needing storage.buckets.get permission.
    """
    if credentials_path is None:
        credentials_path = str(_DEFAULT_KEY_FILE)

    if not Path(credentials_path).exists():
        return False, f"Key file missing: {credentials_path}"
    try:
        client = _get_client(credentials_path)
        bucket = client.bucket(bucket_name)
        # list_blobs only needs storage.objects.list — much lower permission
        blobs = list(bucket.list_blobs(max_results=1))
        count_label = "empty (ready for uploads)" if not blobs else f"{len(blobs)}+ object(s) found"
        return True, f"Connected to bucket '{bucket_name}' — {count_label}"
    except Exception as e:
        return False, str(e)


def _fmt_size(b: int) -> str:
    if b < 1024:
        return f"{b} B"
    elif b < 1024 ** 2:
        return f"{b / 1024:.1f} KB"
    elif b < 1024 ** 3:
        return f"{b / 1024**2:.2f} MB"
    return f"{b / 1024**3:.2f} GB"
