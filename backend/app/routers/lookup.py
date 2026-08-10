import sqlite3

from fastapi import APIRouter, Depends, Request

from app.core.config import get_settings
from app.core.limiter import limiter
from app.db.connection import get_db
from app.models.schemas import LookupResponse
from app.routers.dependencies import parse_and_validate_words
from app.services.lookup_service import build_results

router = APIRouter(tags=["lookup"])


@router.post("/lookup", response_model=LookupResponse)
@limiter.limit(get_settings().RATE_LIMIT)
def lookup(
    request: Request,
    words: list[str] = Depends(parse_and_validate_words),
    conn: sqlite3.Connection = Depends(get_db),
) -> LookupResponse:
    results = build_results(conn, words)
    return LookupResponse(results=results, count=len(results))
