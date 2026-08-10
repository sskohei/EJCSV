import re


def normalize_word(raw: str) -> str:
    return " ".join(raw.strip().lower().split())


def parse_words(text: str) -> list[str]:
    raw_tokens = re.split(r"[\n,]", text)
    words = []
    for raw_token in raw_tokens:
        word = normalize_word(raw_token)
        if word:
            words.append(word)
    return words
