"""EJDict/TatoebaからEJCSV用SQLite (ejcsv.db) をオフラインビルドする。

実行方法・仕様の一次情報源は docs/data-pipeline.md を参照。
"""

from __future__ import annotations

import argparse
import logging
import re
import sqlite3
import sys
from collections.abc import Iterator, Mapping, Sequence
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

TOKEN_RE = re.compile(r"[A-Za-z']+")
DEFAULT_MIN_SENTENCE_WORDS = 4
DEFAULT_MAX_SENTENCE_WORDS = 25
LOG_EVERY_SENTENCES = 200_000
LOG_EVERY_WORDS = 20_000

logger = logging.getLogger("build_data")


@dataclass(frozen=True, slots=True)
class SentenceMeta:
    text: str
    word_count: int


@dataclass
class EjdictStats:
    lines_read: int = 0
    skipped_lines: int = 0
    headwords: int = 0


@dataclass
class TatoebaStats:
    lines_read: int = 0
    skipped_lines: int = 0
    eng_count: int = 0
    duplicate_ids: int = 0


# --- 正規化・トークナイズ ---


def normalize_word(raw: str) -> str:
    return " ".join(raw.strip().lower().split())


def tokenize(text: str) -> list[str]:
    return TOKEN_RE.findall(text.lower())


# --- EJDict ---


def parse_ejdict_line(line: str) -> list[tuple[str, str]]:
    line = line.rstrip("\r\n")
    if not line:
        return []
    parts = line.split("\t", 1)
    if len(parts) != 2:
        return []
    head, translation = parts
    translation = translation.strip()
    if not translation:
        return []
    results = []
    for raw_word in head.split(","):
        word = normalize_word(raw_word)
        if word:
            results.append((word, translation))
    return results


def iter_ejdict_files(ejdict_dir: Path) -> list[Path]:
    return sorted(ejdict_dir.glob("*.txt"))


def load_ejdict(files: list[Path]) -> tuple[dict[str, str], EjdictStats]:
    translations: dict[str, list[str]] = {}
    stats = EjdictStats()

    for path in files:
        with path.open("r", encoding="utf-8") as f:
            for line in f:
                stats.lines_read += 1
                entries = parse_ejdict_line(line)
                if not entries:
                    stats.skipped_lines += 1
                    continue
                for word, translation in entries:
                    translations.setdefault(word, []).append(translation)

    dictionary = {word: " / ".join(dict.fromkeys(values)) for word, values in translations.items()}
    stats.headwords = len(dictionary)
    return dictionary, stats


# --- Tatoeba ---


def iter_tatoeba_rows(tsv_path: Path) -> Iterator[tuple[int, str]]:
    with tsv_path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.rstrip("\r\n")
            if not line:
                continue
            parts = line.split("\t")
            if len(parts) != 3:
                continue
            raw_id, lang, text = parts
            if lang != "eng":
                continue
            try:
                sentence_id = int(raw_id)
            except ValueError:
                continue
            yield sentence_id, text


def build_tatoeba_index(
    tsv_path: Path,
    progress_every: int = LOG_EVERY_SENTENCES,
    limit: int | None = None,
) -> tuple[dict[int, SentenceMeta], dict[str, list[int]], TatoebaStats]:
    sentence_by_id: dict[int, SentenceMeta] = {}
    word_index: dict[str, list[int]] = {}
    stats = TatoebaStats()

    for sentence_id, text in iter_tatoeba_rows(tsv_path):
        stats.lines_read += 1
        if sentence_id in sentence_by_id:
            stats.duplicate_ids += 1
            continue

        tokens = tokenize(text)
        sentence_by_id[sentence_id] = SentenceMeta(text=text, word_count=len(tokens))
        for tok in dict.fromkeys(tokens):
            word_index.setdefault(tok, []).append(sentence_id)

        stats.eng_count += 1
        if stats.eng_count % progress_every == 0:
            logger.info("  tokenized %d sentences...", stats.eng_count)
        if limit is not None and stats.eng_count >= limit:
            break

    return sentence_by_id, word_index, stats


# --- 例文選定 ---


def select_example(
    candidate_ids: Sequence[int],
    sentence_by_id: Mapping[int, SentenceMeta],
    min_words: int,
    max_words: int,
) -> int | None:
    if not candidate_ids:
        return None
    filtered = [
        sid for sid in candidate_ids if min_words <= sentence_by_id[sid].word_count <= max_words
    ]
    pool = filtered if filtered else candidate_ids
    return min(pool, key=lambda sid: (sentence_by_id[sid].word_count, sid))


def phrase_occurs(phrase_tokens: Sequence[str], sentence_tokens: Sequence[str]) -> bool:
    n, m = len(phrase_tokens), len(sentence_tokens)
    if n == 0 or n > m:
        return False
    phrase_list = list(phrase_tokens)
    for start in range(m - n + 1):
        if sentence_tokens[start : start + n] == phrase_list:
            return True
    return False


def find_phrase_candidates(
    phrase_tokens: Sequence[str],
    word_index: Mapping[str, list[int]],
    sentence_by_id: Mapping[int, SentenceMeta],
) -> list[int]:
    anchor_candidates = word_index.get(phrase_tokens[0], [])
    matched = []
    for sid in anchor_candidates:
        sentence_tokens = tokenize(sentence_by_id[sid].text)
        if phrase_occurs(phrase_tokens, sentence_tokens):
            matched.append(sid)
    return matched


def resolve_word(
    word: str,
    word_index: Mapping[str, list[int]],
    sentence_by_id: Mapping[int, SentenceMeta],
    min_words: int,
    max_words: int,
) -> int | None:
    phrase_tokens = tokenize(word)
    if not phrase_tokens:
        return None
    if len(phrase_tokens) == 1:
        candidates = word_index.get(phrase_tokens[0], [])
    else:
        candidates = find_phrase_candidates(phrase_tokens, word_index, sentence_by_id)
    return select_example(candidates, sentence_by_id, min_words, max_words)


# --- SQLite出力 ---


def create_schema(conn: sqlite3.Connection) -> None:
    conn.executescript("""
        CREATE TABLE dictionary (
          word TEXT PRIMARY KEY,
          translation TEXT NOT NULL
        );
        CREATE TABLE sentences (
          id INTEGER PRIMARY KEY,
          text TEXT NOT NULL
        );
        CREATE TABLE word_examples (
          word TEXT PRIMARY KEY,
          sentence_id INTEGER NOT NULL REFERENCES sentences(id)
        );
        CREATE TABLE build_meta (
          key TEXT PRIMARY KEY,
          value TEXT
        );
        """)


def write_database(
    out_path: Path,
    dictionary: Mapping[str, str],
    sentence_by_id: Mapping[int, SentenceMeta],
    word_examples: Mapping[str, int],
    meta: Mapping[str, str],
) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.unlink(missing_ok=True)

    used_sentence_ids = list(dict.fromkeys(word_examples.values()))

    conn = sqlite3.connect(out_path)
    try:
        create_schema(conn)
        conn.executemany(
            "INSERT INTO dictionary (word, translation) VALUES (?, ?)",
            sorted(dictionary.items()),
        )
        conn.executemany(
            "INSERT INTO sentences (id, text) VALUES (?, ?)",
            [(sid, sentence_by_id[sid].text) for sid in sorted(used_sentence_ids)],
        )
        conn.executemany(
            "INSERT INTO word_examples (word, sentence_id) VALUES (?, ?)",
            sorted(word_examples.items()),
        )
        conn.executemany(
            "INSERT INTO build_meta (key, value) VALUES (?, ?)",
            sorted(meta.items()),
        )
        conn.commit()
    finally:
        conn.close()


# --- CLI ---


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="build_data.py",
        description="EJDict/TatoebaからEJCSV用SQLite (ejcsv.db) をオフラインビルドする",
    )
    parser.add_argument(
        "--ejdict-dir", type=Path, required=True, help="EJDict src/ ディレクトリ (a.txt〜z.txt)"
    )
    parser.add_argument(
        "--tatoeba-file", type=Path, required=True, help="Tatoeba eng_sentences.tsv のパス"
    )
    parser.add_argument("--out", type=Path, required=True, help="出力先SQLiteファイルパス")
    parser.add_argument("--min-sentence-words", type=int, default=DEFAULT_MIN_SENTENCE_WORDS)
    parser.add_argument("--max-sentence-words", type=int, default=DEFAULT_MAX_SENTENCE_WORDS)
    parser.add_argument(
        "--limit-sentences",
        type=int,
        default=None,
        help="開発時の高速イテレーション用: Tatoebaの読み込み行数上限（省略時は全件）",
    )
    parser.add_argument(
        "--log-level", default="INFO", choices=["DEBUG", "INFO", "WARNING", "ERROR"]
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    logging.basicConfig(
        level=getattr(logging, args.log_level),
        format="%(asctime)s [%(levelname)s] %(message)s",
    )

    if args.min_sentence_words > args.max_sentence_words:
        logger.error("--min-sentence-words は --max-sentence-words 以下である必要があります")
        return 2

    if not args.ejdict_dir.is_dir():
        logger.error("EJDictディレクトリが見つかりません: %s", args.ejdict_dir)
        return 1
    if not args.tatoeba_file.is_file():
        logger.error("Tatoebaファイルが見つかりません: %s", args.tatoeba_file)
        return 1

    try:
        ejdict_files = iter_ejdict_files(args.ejdict_dir)
        if not ejdict_files:
            logger.error("EJDictの*.txtファイルが見つかりません: %s", args.ejdict_dir)
            return 1
        if len(ejdict_files) < 26:
            logger.warning("EJDictファイルが26件未満です（%d件）", len(ejdict_files))

        logger.info("EJDictを読み込み中... (%d files)", len(ejdict_files))
        dictionary, ejdict_stats = load_ejdict(ejdict_files)
        logger.info(
            "EJDict読み込み完了: %d行 / %d見出し語 (スキップ%d行)",
            ejdict_stats.lines_read,
            ejdict_stats.headwords,
            ejdict_stats.skipped_lines,
        )

        logger.info("Tatoebaを読み込み中...")
        sentence_by_id, word_index, tatoeba_stats = build_tatoeba_index(
            args.tatoeba_file, limit=args.limit_sentences
        )
        logger.info(
            "Tatoeba読み込み完了: %d行 / eng %d文 / ユニーク語彙 %d語 (重複ID%d件)",
            tatoeba_stats.lines_read,
            tatoeba_stats.eng_count,
            len(word_index),
            tatoeba_stats.duplicate_ids,
        )

        vocab = sorted(set(dictionary) | set(word_index))
        logger.info("例文選定を開始... (%d語)", len(vocab))
        word_examples: dict[str, int] = {}
        for i, word in enumerate(vocab, start=1):
            sid = resolve_word(
                word, word_index, sentence_by_id, args.min_sentence_words, args.max_sentence_words
            )
            if sid is not None:
                word_examples[word] = sid
            if i % LOG_EVERY_WORDS == 0:
                logger.info("  例文選定 %d/%d語...", i, len(vocab))
        logger.info("例文選定完了: %d/%d語でヒット", len(word_examples), len(vocab))

        meta = {
            "built_at": datetime.now(timezone.utc).isoformat(),
            "ejdict_headwords": str(ejdict_stats.headwords),
            "tatoeba_sentences": str(tatoeba_stats.eng_count),
            "tatoeba_vocab": str(len(word_index)),
            "word_examples_count": str(len(word_examples)),
            "min_sentence_words": str(args.min_sentence_words),
            "max_sentence_words": str(args.max_sentence_words),
        }

        logger.info("SQLiteへ書き込み中: %s", args.out)
        write_database(args.out, dictionary, sentence_by_id, word_examples, meta)
        logger.info("完了: %s", args.out)
    except Exception:
        logger.exception("ビルド中にエラーが発生しました")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
