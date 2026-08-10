import csv
import io

from app.models.schemas import WordResult

CSV_HEADER = ["word", "translation", "example_sentence"]


def build_csv_bytes(results: list[WordResult]) -> bytes:
    buffer = io.StringIO()
    writer = csv.writer(buffer, quoting=csv.QUOTE_MINIMAL)
    for result in results:
        writer.writerow([result.word, result.translation or "", result.example or ""])
    return buffer.getvalue().encode("utf-8-sig")
