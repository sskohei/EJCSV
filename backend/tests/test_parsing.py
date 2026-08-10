from app.services.parsing import normalize_word, parse_words


def test_normalize_word_collapses_whitespace_and_lowercases():
    assert normalize_word("  Give   Up ") == "give up"


def test_parse_words_splits_on_newlines_and_commas():
    assert parse_words("run\ngive up, listen\nxenodochial") == [
        "run",
        "give up",
        "listen",
        "xenodochial",
    ]


def test_parse_words_trims_and_drops_empty_tokens():
    assert parse_words("run\n\n , ,cat ,") == ["run", "cat"]


def test_parse_words_normalizes_case_and_internal_whitespace():
    assert parse_words("RUN\nGive   Up") == ["run", "give up"]


def test_parse_words_preserves_duplicates():
    assert parse_words("cat,cat\ndog") == ["cat", "cat", "dog"]
