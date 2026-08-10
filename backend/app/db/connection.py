import sqlite3
from collections.abc import Iterator
from pathlib import Path

from fastapi import Request

from app.core.config import Settings, get_settings


class DatabaseNotFoundError(RuntimeError):
    pass


def get_db_path(settings: Settings | None = None) -> Path:
    return Path((settings or get_settings()).DB_PATH)


def ensure_db_exists(settings: Settings | None = None) -> None:
    db_path = get_db_path(settings)
    if not db_path.exists():
        raise DatabaseNotFoundError(
            f"DB_PATH '{db_path}' が見つかりません。"
            "scripts/build_data.py で ejcsv.db をビルドしてから起動してください。"
        )


def open_connection(settings: Settings | None = None) -> sqlite3.Connection:
    db_path = get_db_path(settings)
    conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def get_db(request: Request) -> Iterator[sqlite3.Connection]:
    yield request.app.state.db_connection
