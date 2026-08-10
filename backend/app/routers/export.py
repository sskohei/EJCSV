import sqlite3
from datetime import datetime

from fastapi import APIRouter, Depends, Request, Response

from app.core.config import get_settings
from app.core.limiter import limiter
from app.db.connection import get_db
from app.routers.dependencies import parse_and_validate_words
from app.services.csv_service import build_csv_bytes
from app.services.lookup_service import build_results

router = APIRouter(tags=["export"])


@router.post("/export/csv")
@limiter.limit(get_settings().RATE_LIMIT)
def export_csv(
    request: Request,
    words: list[str] = Depends(parse_and_validate_words),
    conn: sqlite3.Connection = Depends(get_db),
) -> Response:
    results = build_results(conn, words)
    csv_bytes = build_csv_bytes(results)
    filename = f"ejcsv_{datetime.now():%Y%m%d_%H%M%S}.csv"
    return Response(
        content=csv_bytes,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
