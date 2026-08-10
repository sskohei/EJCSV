"""テスト用の小さなfixture SQLite DBを構築する。

本番のejcsv.dbに依存せずpytestを完結させるために使う（docs/testing.md参照）。
docs/api.mdのJSON例と同じ語彙を採用し、統合テストの期待値をそのまま流用できるようにする。
"""

import sqlite3
from pathlib import Path

from scripts.build_data import create_schema

FIXTURE_DICTIONARY = [
    ("run", "走る / 経営する / ..."),
    ("give up", "あきらめる"),
    ("listen", "聞く"),
]

FIXTURE_SENTENCES = [
    (1, "She runs every morning."),
    (2, "Listen to me carefully."),
]

FIXTURE_WORD_EXAMPLES = [
    ("run", 1),
    ("listen", 2),
]


def build_test_db(out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.unlink(missing_ok=True)

    conn = sqlite3.connect(out_path)
    try:
        create_schema(conn)
        conn.executemany(
            "INSERT INTO dictionary (word, translation) VALUES (?, ?)",
            FIXTURE_DICTIONARY,
        )
        conn.executemany(
            "INSERT INTO sentences (id, text) VALUES (?, ?)",
            FIXTURE_SENTENCES,
        )
        conn.executemany(
            "INSERT INTO word_examples (word, sentence_id) VALUES (?, ?)",
            FIXTURE_WORD_EXAMPLES,
        )
        conn.commit()
    finally:
        conn.close()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    build_test_db(args.out)
