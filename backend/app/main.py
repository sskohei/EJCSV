from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import export, lookup

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    if not Path(settings.DB_PATH).exists():
        raise RuntimeError(
            f"DB_PATH '{settings.DB_PATH}' が見つかりません。"
            "scripts/build_data.py で ejcsv.db をビルドしてから起動してください。"
        )
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.ALLOWED_ORIGIN],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(lookup.router, prefix="/api")
app.include_router(export.router, prefix="/api")
