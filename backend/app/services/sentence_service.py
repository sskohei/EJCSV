import sqlite3

from app.services.parsing import normalize_word


def get_example(conn: sqlite3.Connection, word: str) -> tuple[str, int] | None:
    row = conn.execute(
        """
        SELECT s.text, s.id
        FROM word_examples we
        JOIN sentences s ON we.sentence_id = s.id
        WHERE we.word = ?
        """,
        (normalize_word(word),),
    ).fetchone()
    return (row[0], row[1]) if row else None
