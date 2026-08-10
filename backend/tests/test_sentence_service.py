import sqlite3

import pytest

from app.services.sentence_service import get_example


@pytest.fixture
def conn(tmp_path):
    db_path = tmp_path / "ejcsv.db"
    connection = sqlite3.connect(db_path)
    connection.execute("CREATE TABLE sentences (id INTEGER PRIMARY KEY, text TEXT NOT NULL)")
    connection.execute(
        "CREATE TABLE word_examples (word TEXT PRIMARY KEY, sentence_id INTEGER NOT NULL)"
    )
    connection.execute("INSERT INTO sentences (id, text) VALUES (1, 'There is a cat.')")
    connection.execute("INSERT INTO word_examples (word, sentence_id) VALUES ('cat', 1)")
    connection.commit()
    yield connection
    connection.close()


def test_get_example_returns_matching_sentence(conn):
    assert get_example(conn, "cat") == "There is a cat."


def test_get_example_is_case_insensitive(conn):
    assert get_example(conn, "CAT") == "There is a cat."


def test_get_example_returns_none_when_not_found(conn):
    assert get_example(conn, "dog") is None
