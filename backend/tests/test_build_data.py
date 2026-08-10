import sqlite3

from scripts.build_data import (
    SentenceMeta,
    build_tatoeba_index,
    iter_ejdict_files,
    load_ejdict,
    normalize_word,
    parse_ejdict_line,
    phrase_occurs,
    resolve_word,
    select_example,
    tokenize,
    write_database,
)


def test_normalize_word_collapses_whitespace_and_lowercases():
    assert normalize_word("  Give   Up ") == "give up"


def test_tokenize_keeps_apostrophes_as_single_token():
    assert tokenize("Don't stop.") == ["don't", "stop"]


def test_parse_ejdict_line_splits_comma_separated_headwords():
    assert parse_ejdict_line("Cat,CAT\t猫") == [("cat", "猫"), ("cat", "猫")]


def test_parse_ejdict_line_keeps_synonym_reference_as_is():
    assert parse_ejdict_line("'em\t=them") == [("'em", "=them")]


def test_parse_ejdict_line_skips_lines_without_tab():
    assert parse_ejdict_line("no tab here") == []


def test_parse_ejdict_line_skips_empty_line():
    assert parse_ejdict_line("") == []


def test_load_ejdict_joins_distinct_translations_for_same_word(tmp_path):
    f = tmp_path / "a.txt"
    f.write_text("apple\tリンゴ\napple\t果物\n", encoding="utf-8")
    dictionary, stats = load_ejdict([f])
    assert dictionary["apple"] == "リンゴ / 果物"
    assert stats.headwords == 1


def test_load_ejdict_removes_exact_duplicate_translations(tmp_path):
    f = tmp_path / "a.txt"
    f.write_text("apple\tリンゴ\napple\tリンゴ\n", encoding="utf-8")
    dictionary, _ = load_ejdict([f])
    assert dictionary["apple"] == "リンゴ"


def test_iter_ejdict_files_returns_sorted_order(tmp_path):
    (tmp_path / "b.txt").write_text("", encoding="utf-8")
    (tmp_path / "a.txt").write_text("", encoding="utf-8")
    files = iter_ejdict_files(tmp_path)
    assert [f.name for f in files] == ["a.txt", "b.txt"]


def test_build_tatoeba_index_skips_non_english_and_duplicate_ids(tmp_path):
    f = tmp_path / "eng_sentences.tsv"
    f.write_text(
        "\n".join(
            [
                "1\teng\tThe cat sat on the mat.",
                "2\tfra\tLe chat est noir.",
                "1\teng\tDuplicate id should be skipped.",
            ]
        )
        + "\n",
        encoding="utf-8",
    )
    sentence_by_id, word_index, stats = build_tatoeba_index(f)
    assert set(sentence_by_id) == {1}
    assert stats.eng_count == 1
    assert stats.duplicate_ids == 1
    assert 1 in word_index["cat"]


def test_select_example_returns_none_for_no_candidates():
    assert select_example([], {}, 4, 25) is None


def test_select_example_prefers_shortest_within_filter():
    sentence_by_id = {
        1: SentenceMeta(text="s1", word_count=10),
        2: SentenceMeta(text="s2", word_count=5),
        3: SentenceMeta(text="s3", word_count=30),
    }
    assert select_example([1, 2, 3], sentence_by_id, 4, 25) == 2


def test_select_example_tie_breaks_by_smallest_sentence_id():
    sentence_by_id = {
        5: SentenceMeta(text="a", word_count=6),
        2: SentenceMeta(text="b", word_count=6),
        9: SentenceMeta(text="c", word_count=6),
    }
    assert select_example([5, 2, 9], sentence_by_id, 4, 25) == 2


def test_select_example_falls_back_to_shortest_when_filter_is_empty():
    sentence_by_id = {
        1: SentenceMeta(text="a", word_count=2),
        2: SentenceMeta(text="b", word_count=3),
    }
    assert select_example([1, 2], sentence_by_id, 4, 25) == 1


def test_phrase_occurs_matches_consecutive_tokens():
    assert phrase_occurs(["give", "up"], ["please", "give", "up", "now"]) is True


def test_phrase_occurs_does_not_match_partial_word_substring():
    assert phrase_occurs(["a", "cat"], ["a", "category", "exists", "here"]) is False


def test_phrase_occurs_returns_false_when_phrase_longer_than_sentence():
    assert phrase_occurs(["a", "b", "c"], ["a", "b"]) is False


def test_resolve_word_finds_phrase_candidate():
    sentence_by_id = {
        1: SentenceMeta(text="Please give up now.", word_count=4),
        2: SentenceMeta(text="I will never give in.", word_count=5),
    }
    word_index = {
        "give": [1, 2],
        "up": [1],
        "in": [2],
        "please": [1],
        "now": [1],
        "i": [2],
        "will": [2],
        "never": [2],
    }
    assert resolve_word("give up", word_index, sentence_by_id, 4, 25) == 1


def test_build_pipeline_is_deterministic(tmp_path):
    ejdict_dir = tmp_path / "ejdict"
    ejdict_dir.mkdir()
    (ejdict_dir / "a.txt").write_text("apple\tリンゴ\ncat\t猫\n", encoding="utf-8")
    (ejdict_dir / "g.txt").write_text("Give Up,give up\tあきらめる\n", encoding="utf-8")

    tatoeba_file = tmp_path / "eng_sentences.tsv"
    tatoeba_file.write_text(
        "\n".join(
            [
                "1\teng\tI have a red apple today.",
                "2\teng\tShe has an apple.",
                "3\teng\tThe cat sat on the mat quietly.",
                "4\teng\tPlease do not give up now.",
                "5\teng\tNever give up on your dreams.",
            ]
        )
        + "\n",
        encoding="utf-8",
    )

    def run_once(out_path):
        files = iter_ejdict_files(ejdict_dir)
        dictionary, _ = load_ejdict(files)
        sentence_by_id, word_index, _ = build_tatoeba_index(tatoeba_file)
        vocab = sorted(set(dictionary) | set(word_index))
        word_examples = {}
        for word in vocab:
            sid = resolve_word(word, word_index, sentence_by_id, 4, 25)
            if sid is not None:
                word_examples[word] = sid
        write_database(out_path, dictionary, sentence_by_id, word_examples, {"built_at": "x"})
        return dictionary, word_examples

    out1 = tmp_path / "out1.db"
    out2 = tmp_path / "out2.db"
    dict1, examples1 = run_once(out1)
    dict2, examples2 = run_once(out2)

    assert dict1 == dict2
    assert examples1 == examples2
    assert examples1["give up"] == 4

    def read_rows(path, table, cols):
        conn = sqlite3.connect(path)
        try:
            return sorted(conn.execute(f"SELECT {cols} FROM {table}").fetchall())
        finally:
            conn.close()

    assert read_rows(out1, "dictionary", "word, translation") == read_rows(
        out2, "dictionary", "word, translation"
    )
    assert read_rows(out1, "word_examples", "word, sentence_id") == read_rows(
        out2, "word_examples", "word, sentence_id"
    )
