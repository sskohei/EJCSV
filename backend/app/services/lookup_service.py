import sqlite3

from app.models.schemas import WordResult
from app.services.dictionary_service import get_translation
from app.services.sentence_service import get_example


def build_results(conn: sqlite3.Connection, words: list[str]) -> list[WordResult]:
    results = []
    for word in words:
        translation = get_translation(conn, word)
        example = get_example(conn, word)
        results.append(
            WordResult(
                word=word,
                translation=translation,
                example=example,
                translation_found=translation is not None,
                example_found=example is not None,
            )
        )
    return results
