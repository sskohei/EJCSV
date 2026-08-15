# バックエンド (FastAPI)

## ディレクトリ構成

```
backend/
  app/
    main.py                      # FastAPI() インスタンス、ルーター登録、起動時のDBパスチェック
    core/
      config.py                  # pydantic-settings: DB_PATH, MAX_WORDS, MAX_INPUT_CHARS, ALLOWED_ORIGIN 等
    routers/
      lookup.py                  # POST /api/lookup
      export.py                  # POST /api/export/csv
    services/
      parsing.py                 # 生テキスト -> 正規化済み単語リスト
      dictionary_service.py      # word -> translation（SQLiteクエリ）
      sentence_service.py        # word -> example sentence（SQLiteクエリ）
      lookup_service.py          # parsing + dictionary + sentence を統括し、list[WordResult]を生成。両ルーターから共有される
      csv_service.py             # list[WordResult] -> UTF-8 BOM付きCSVバイト列
    models/
      schemas.py                 # LookupRequest, WordResult, LookupResponse などのPydanticモデル
    db/
      connection.py               # SQLite接続（読み取り専用）の依存性注入
  scripts/
    build_data.py                # オフラインデータビルドスクリプト（docs/data-pipeline.md参照）
  data/
    raw/                          # gitignore対象。EJDict/Tatoebaの生データ
    build/                        # ejcsv.db（Git LFS管理、docs/data-pipeline.md参照）
  tests/
    fixtures/
      build_test_db.py            # テスト用の小さなfixture SQLite DBを構築
    test_dictionary_service.py
    test_sentence_service.py
    test_csv_service.py
    test_api_lookup.py
    test_api_export.py
  pyproject.toml
  Dockerfile
```

## サービス層の責務分割

各サービスは単一責務に分割し、テストしやすくする。

- `parsing.py`: 改行・カンマでの分割、trim、空要素除去、小文字化・空白正規化。重複を保持したまま返す（要件どおり行を消さないため）。
- `dictionary_service.py`: `SELECT translation FROM dictionary WHERE word = ?` の単純なラッパー。単語・フレーズの両方に対して同一のインターフェースで動作する。
- `sentence_service.py`: `SELECT s.text FROM word_examples we JOIN sentences s ON we.sentence_id = s.id WHERE we.word = ?` の単純なラッパー。
- `lookup_service.py`: 上記2つを束ね、入力単語リストから `list[WordResult]` を組み立てるオーケストレーション層。`/api/lookup` と `/api/export/csv` の両方から呼ばれる唯一の入口とし、ロジックの重複を避ける。
- `csv_service.py`: `list[WordResult]` を受け取り、ヘッダなしで `csv.writer`（`QUOTE_MINIMAL`）によるUTF-8 BOM付きバイト列を生成する。空欄ルールは [docs/api.md](./api.md) を参照。

## データベースアクセス方針

- `data/build/ejcsv.db` を起動時に読み取り専用で開く（`sqlite3.connect(path, uri=True)` を `?mode=ro` 付きで、または通常接続でも書き込みを一切行わない運用とする）。
- SQLiteは複数プロセスからの同時読み取りに問題なく対応できるため、Workerプロセスごとに1接続を持たせる。
- `dictionary.word` と `word_examples.word` はいずれも `PRIMARY KEY` として定義済みのため、追加のインデックスなしに高速な点検索が可能（[docs/data-pipeline.md](./data-pipeline.md) のスキーマ参照）。
- 起動時にDBファイルの存在確認を行い、存在しない場合は明確なエラーメッセージで起動を失敗させる（サイレントな空データでの起動を防ぐ）。

## レート制限・入力制限

- `slowapi`（インメモリ、IPベース）を `/api/lookup` と `/api/export/csv` に適用する。目安: **20 リクエスト/分/IP**。
- インメモリ方式は**単一プロセス構成でのみ正しく機能する**制約がある点を明記する。将来的に複数インスタンスへスケールする場合はRedis等の共有ストアへの切り替えが必要。
- [docs/api.md](./api.md) に記載の最大単語数・最大文字数によるバリデーションも、レート制限と並ぶ安価な悪用対策として機能する。

## 環境変数（想定）

| 変数名 | 用途 |
|---|---|
| `DB_PATH` | `ejcsv.db` の配置パス |
| `MAX_WORDS` | 1リクエストあたりの最大単語数（デフォルト200） |
| `MAX_INPUT_CHARS` | 入力テキストの最大文字数（デフォルト10,000） |
| `ALLOWED_ORIGIN` | CORS許可オリジン（Next.jsのデプロイ先URL） |
| `RATE_LIMIT` | `slowapi` のレート制限設定 |

具体的な既定値・型は実装時に `app/core/config.py`（pydantic-settings）で確定する。
