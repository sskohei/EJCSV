import sqlite3

from app.services.parsing import normalize_word


def get_translation(conn: sqlite3.Connection, word: str) -> str | None:
    row = conn.execute(
        "SELECT translation FROM dictionary WHERE word = ?",
        (normalize_word(word),),
    ).fetchone()
    return row[0] if row else None
