#!/usr/bin/env bash
# EJDict/Tatoebaの生データを backend/data/raw/ に取得する。
# 取得元・ライセンスは docs/datasets.md を参照。取得結果は .gitignore 対象。
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
RAW_DIR="${BACKEND_DIR}/data/raw"

EJDICT_DIR="${RAW_DIR}/ejdict/src"
TATOEBA_DIR="${RAW_DIR}/tatoeba"
TATOEBA_BZ2="${TATOEBA_DIR}/eng_sentences.tsv.bz2"
TATOEBA_TSV="${TATOEBA_DIR}/eng_sentences.tsv"

mkdir -p "${EJDICT_DIR}" "${TATOEBA_DIR}"

echo "== EJDict (a.txt〜z.txt) を取得 =="
for letter in {a..z}; do
  dest="${EJDICT_DIR}/${letter}.txt"
  if [ -s "${dest}" ]; then
    echo "  skip ${letter}.txt (既に存在)"
    continue
  fi
  echo "  downloading ${letter}.txt"
  curl -fsSL "https://raw.githubusercontent.com/kujirahand/EJDict/master/src/${letter}.txt" -o "${dest}"
done

echo "== Tatoeba (eng_sentences.tsv) を取得 =="
if [ -s "${TATOEBA_TSV}" ]; then
  echo "  skip eng_sentences.tsv (既に存在)"
else
  curl -fsSL "https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences.tsv.bz2" -o "${TATOEBA_BZ2}"
  bunzip2 -k "${TATOEBA_BZ2}"
  rm -f "${TATOEBA_BZ2}"
fi

echo "== 完了 =="
echo "EJDict: ${EJDICT_DIR}"
echo "Tatoeba: ${TATOEBA_TSV}"
