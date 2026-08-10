# API仕様

バックエンド（FastAPI）が提供するエンドポイントの仕様。フロントエンドはNext.jsのAPIルート経由でこれらを呼び出す（[docs/architecture.md](./architecture.md)、[docs/frontend.md](./frontend.md) 参照）。

## 共通事項

- 単語リストの分割・正規化（改行/カンマ区切りのパース、trim、空要素除去、小文字化）は**バックエンド側**で行う。フロントエンドはテキストエリアの生文字列をそのまま送信する。
- 2つのエンドポイントは同一のサービス関数 `app/services/lookup_service.py::build_results(words: list[str]) -> list[WordResult]` を共有する。`/api/lookup` はJSONへ、`/api/export/csv` はCSVバイト列へ変換するだけで、辞書引き・例文引きのロジックは重複させない。

### 入力バリデーション

| 項目 | 上限 | 超過時の挙動 |
|---|---|---|
| 入力テキスト全体の文字数 | 10,000文字 | 422エラー |
| 単語数 | 200語 | 422エラー |
| 1トークンあたりの文字数 | 100文字 | 422エラー |

いずれも `app/core/config.py` の環境変数（`MAX_INPUT_CHARS`, `MAX_WORDS`, `MAX_TOKEN_CHARS` 等）で調整可能な設計とする。制御文字は事前に除去する。

## `POST /api/lookup`

単語リストに対する訳語・例文をJSONで返す（プレビュー表示用）。

**リクエスト**

```
Content-Type: application/json

{
  "text": "run\ngive up, listen\nxenodochial"
}
```

**レスポンス 200**

```json
{
  "results": [
    { "word": "run", "translation": "走る / 経営する / ...", "example": "She runs every morning.", "sentence_id": 1, "translation_found": true, "example_found": true },
    { "word": "give up", "translation": "あきらめる", "example": null, "sentence_id": null, "translation_found": true, "example_found": false },
    { "word": "listen", "translation": "聞く", "example": "Listen to me carefully.", "sentence_id": 2, "translation_found": true, "example_found": true },
    { "word": "xenodochial", "translation": null, "example": null, "sentence_id": null, "translation_found": false, "example_found": false }
  ],
  "count": 4
}
```

- `translation` / `example` は見つからない場合 `null`。
- `sentence_id` はTatoebaの文ID。例文が見つかった場合のみ数値が入り、フロントエンドが `https://tatoeba.org/en/sentences/show/{sentence_id}` へのリンクを生成するために使う（見つからない場合は `null`）。
- `translation_found` / `example_found` はフロントエンドがプレビュー上で「見つからなかった単語」を視覚的に示すためのフラグ。
- 入力に重複する単語が含まれる場合、重複したまま複数行として返す（「行を消さない」という要件どおり）。

**レスポンス 422（バリデーションエラー）**

```json
{ "detail": "Too many words: 350 submitted, maximum is 200." }
```

## `POST /api/export/csv`

同じ入力形式を受け取り、CSVファイルをダウンロードレスポンスとして返す。

**リクエスト**

```
Content-Type: application/json

{
  "text": "run\ngive up, listen\nxenodochial"
}
```

**レスポンス 200**

```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="ejcsv_20260810_143210.csv"

（本文: UTF-8 BOM付きCSV）
```

### CSVフォーマット仕様

| 項目 | 仕様 |
|---|---|
| ヘッダ行 | `word,translation,example_sentence` |
| エンコーディング | UTF-8 with BOM（`utf-8-sig`）。Excel（特にWindows版）で日本語が文字化けしないようにするため |
| クオーティング | Python標準 `csv.writer` の `QUOTE_MINIMAL`。訳語・例文にカンマ/引用符/改行が含まれる場合は自動でクオートされる |
| 空欄の扱い | 訳語または例文が見つからない場合、そのセルは単に空文字列（`""`）。`N/A` 等の文字列は入れない |
| ファイル名 | `ejcsv_{YYYYMMDD}_{HHMMSS}.csv`（サーバー側でレスポンス生成時刻から生成） |
| 列の日本語ヘッダ化 | MVPでは行わない（英語のスネークケース固定）。将来的にローカライズ可能なトグルを追加する余地あり |

## エラーレスポンス共通仕様

- FastAPIの標準的な `{"detail": "..."}` 形式を踏襲する。
- バリデーションエラーは422、想定外のサーバーエラーは500。
