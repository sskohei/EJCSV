import sqlite3

import pytest

from app.services.lookup_service import build_results


@pytest.fixture
def conn(tmp_path):
    db_path = tmp_path / "ejcsv.db"
    connection = sqlite3.connect(db_path)
    connection.execute("CREATE TABLE dictionary (word TEXT PRIMARY KEY, translation TEXT NOT NULL)")
    connection.execute("CREATE TABLE sentences (id INTEGER PRIMARY KEY, text TEXT NOT NULL)")
    connection.execute(
        "CREATE TABLE word_examples (word TEXT PRIMARY KEY, sentence_id INTEGER NOT NULL)"
    )
    connection.execute("INSERT INTO dictionary (word, translation) VALUES ('cat', '猫')")
    connection.execute("INSERT INTO sentences (id, text) VALUES (1, 'There is a cat.')")
    connection.execute("INSERT INTO word_examples (word, sentence_id) VALUES ('cat', 1)")
    connection.execute(
        "INSERT INTO dictionary (word, translation) VALUES ('give up', 'あきらめる')"
    )
    connection.commit()
    yield connection
    connection.close()


def test_build_results_marks_found_flags(conn):
    results = build_results(conn, ["cat", "give up", "xenodochial"])

    assert results[0].word == "cat"
    assert results[0].translation == "猫"
    assert results[0].example == "There is a cat."
    assert results[0].sentence_id == 1
    assert results[0].translation_found is True
    assert results[0].example_found is True

    assert results[1].word == "give up"
    assert results[1].translation == "あきらめる"
    assert results[1].example is None
    assert results[1].sentence_id is None
    assert results[1].translation_found is True
    assert results[1].example_found is False

    assert results[2].word == "xenodochial"
    assert results[2].translation is None
    assert results[2].example is None
    assert results[2].sentence_id is None
    assert results[2].translation_found is False
    assert results[2].example_found is False


def test_build_results_preserves_duplicate_rows(conn):
    results = build_results(conn, ["cat", "cat"])
    assert len(results) == 2
    assert [r.word for r in results] == ["cat", "cat"]


def test_build_results_returns_empty_list_for_empty_input(conn):
    assert build_results(conn, []) == []
