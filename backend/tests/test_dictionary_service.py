import sqlite3

import pytest

from app.services.dictionary_service import get_translation


@pytest.fixture
def conn(tmp_path):
    db_path = tmp_path / "ejcsv.db"
    connection = sqlite3.connect(db_path)
    connection.execute("CREATE TABLE dictionary (word TEXT PRIMARY KEY, translation TEXT NOT NULL)")
    connection.executemany(
        "INSERT INTO dictionary (word, translation) VALUES (?, ?)",
        [("cat", "猫"), ("give up", "あきらめる")],
    )
    connection.commit()
    yield connection
    connection.close()


def test_get_translation_is_case_insensitive(conn):
    assert get_translation(conn, "CAT") == "猫"


def test_get_translation_supports_phrase_headwords(conn):
    assert get_translation(conn, "Give   Up") == "あきらめる"


def test_get_translation_returns_none_when_not_found(conn):
    assert get_translation(conn, "dog") is None
