from app.models.schemas import WordResult
from app.services.csv_service import build_csv_bytes


def test_csv_has_bom_without_header():
    results = [
        WordResult(
            word="cat",
            translation="猫",
            example="There is a cat.",
            translation_found=True,
            example_found=True,
        )
    ]
    csv_bytes = build_csv_bytes(results)
    assert csv_bytes.startswith(b"\xef\xbb\xbf")
    text = csv_bytes.decode("utf-8-sig")
    assert text.splitlines() == ["cat,猫,There is a cat."]


def test_rows_contain_word_translation_example():
    results = [
        WordResult(
            word="cat",
            translation="猫",
            example="There is a cat.",
            translation_found=True,
            example_found=True,
        )
    ]
    text = build_csv_bytes(results).decode("utf-8-sig")
    lines = text.splitlines()
    assert lines[0] == "cat,猫,There is a cat."


def test_missing_translation_and_example_become_empty_strings():
    results = [
        WordResult(
            word="xenodochial",
            translation=None,
            example=None,
            translation_found=False,
            example_found=False,
        )
    ]
    text = build_csv_bytes(results).decode("utf-8-sig")
    lines = text.splitlines()
    assert lines[0] == "xenodochial,,"
    assert "N/A" not in text


def test_values_with_commas_or_quotes_are_auto_quoted():
    results = [
        WordResult(
            word="run",
            translation='走る / 経営する, "manage"',
            example='She said, "Let\'s run."',
            translation_found=True,
            example_found=True,
        )
    ]
    text = build_csv_bytes(results).decode("utf-8-sig")
    lines = text.splitlines()
    assert lines[0] == 'run,"走る / 経営する, ""manage""","She said, ""Let\'s run."""'
