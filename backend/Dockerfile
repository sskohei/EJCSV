FROM python:3.11-slim

WORKDIR /app

COPY pyproject.toml ./
RUN pip install --no-cache-dir .

COPY app ./app

# TODO(deploy issue): Git LFSで解決した data/build/ejcsv.db をここでCOPYする
# TODO(deploy issue): Renderの $PORT に合わせて起動コマンドを調整する

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
