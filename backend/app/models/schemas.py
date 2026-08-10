from pydantic import BaseModel


class LookupRequest(BaseModel):
    text: str


class WordResult(BaseModel):
    word: str
    translation: str | None
    example: str | None
    translation_found: bool
    example_found: bool


class LookupResponse(BaseModel):
    results: list[WordResult]
    count: int
