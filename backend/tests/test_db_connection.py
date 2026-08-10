import sqlite3

import pytest

from app.core.config import Settings
from app.db.connection import DatabaseNotFoundError, ensure_db_exists, open_connection


def test_ensure_db_exists_raises_when_missing(tmp_path):
    settings = Settings(DB_PATH=str(tmp_path / "missing.db"))
    with pytest.raises(DatabaseNotFoundError):
        ensure_db_exists(settings)


def test_ensure_db_exists_passes_when_present(tmp_path):
    db_path = tmp_path / "ejcsv.db"
    db_path.touch()
    settings = Settings(DB_PATH=str(db_path))
    ensure_db_exists(settings)  # should not raise


def test_open_connection_is_read_only(tmp_path):
    db_path = tmp_path / "ejcsv.db"
    setup_conn = sqlite3.connect(db_path)
    setup_conn.execute("CREATE TABLE dictionary (word TEXT PRIMARY KEY, translation TEXT)")
    setup_conn.execute("INSERT INTO dictionary VALUES ('cat', '猫')")
    setup_conn.commit()
    setup_conn.close()

    settings = Settings(DB_PATH=str(db_path))
    conn = open_connection(settings)
    try:
        row = conn.execute("SELECT word, translation FROM dictionary WHERE word = 'cat'").fetchone()
        assert row["word"] == "cat"
        assert row["translation"] == "猫"

        with pytest.raises(sqlite3.OperationalError):
            conn.execute("INSERT INTO dictionary VALUES ('dog', 'イヌ')")
    finally:
        conn.close()
