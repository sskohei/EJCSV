from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    DB_PATH: str = "data/build/ejcsv.db"
    MAX_WORDS: int = 200
    MAX_INPUT_CHARS: int = 10_000
    MAX_TOKEN_CHARS: int = 100
    ALLOWED_ORIGIN: str = "http://localhost:3000"
    RATE_LIMIT: str = "20/minute"


@lru_cache
def get_settings() -> Settings:
    return Settings()
