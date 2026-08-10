import re

from fastapi import HTTPException

from app.core.config import get_settings
from app.models.schemas import LookupRequest
from app.services.parsing import parse_words

CONTROL_CHAR_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def parse_and_validate_words(payload: LookupRequest) -> list[str]:
    settings = get_settings()
    text = CONTROL_CHAR_RE.sub("", payload.text)

    if len(text) > settings.MAX_INPUT_CHARS:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Input text too long: {len(text)} characters submitted, "
                f"maximum is {settings.MAX_INPUT_CHARS}."
            ),
        )

    words = parse_words(text)

    if len(words) > settings.MAX_WORDS:
        raise HTTPException(
            status_code=422,
            detail=f"Too many words: {len(words)} submitted, maximum is {settings.MAX_WORDS}.",
        )

    for word in words:
        if len(word) > settings.MAX_TOKEN_CHARS:
            raise HTTPException(
                status_code=422,
                detail=(
                    f"Word too long: '{word}' exceeds maximum of "
                    f"{settings.MAX_TOKEN_CHARS} characters."
                ),
            )

    return words
