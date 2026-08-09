# アーキテクチャ

## 全体構成

```
[ブラウザ]
    │  HTTPS (同一オリジン)
    ▼
[Next.js — Vercel]
    │  App Router のAPIルートがプロキシとして機能
    │  (frontend/app/api/lookup/route.ts, frontend/app/api/export/csv/route.ts)
    │  サーバーサイドから FASTAPI_BASE_URL 宛にリクエスト転送
    ▼
[FastAPI — Render (Dockerコンテナ)]
    │  app/routers/lookup.py, app/routers/export.py
    │  app/services/ 内のロジックで整形
    ▼
[SQLite: ejcsv.db]
    dictionary / sentences / word_examples テーブルへの読み取り専用点検索
    (Dockerイメージにビルド済みファイルとして同梱)
```

- **フロントエンド (Next.js, Vercel)**: ユーザー入力の受付、結果プレビュー、CSVダウンロードのトリガー。ブラウザは常にNext.jsサーバーとだけ通信し、FastAPIバックエンドのURLはブラウザに露出しない。
- **フロントエンドAPIルート（プロキシ）**: Next.jsのAPIルートがサーバーサイドでFastAPIバックエンドを呼び出す。これによりCORS設定が不要になり、バックエンドのAllow Originを絞れる。詳細は [docs/frontend.md](./frontend.md)。
- **バックエンド (FastAPI, Render)**: 入力パース、辞書引き、例文引き、CSV生成のロジックを担う。詳細は [docs/backend.md](./backend.md)、APIコントラクトは [docs/api.md](./api.md)。
- **データストア (SQLite)**: EJDictとTatoebaから事前ビルドした軽量なルックアップ用DB。リクエスト時にはインデックス済みの点検索のみを行い、生コーパス（約104MBのTatoeba生データ、2,033,133文）は一切ロードしない。ビルド方法は [docs/data-pipeline.md](./data-pipeline.md)。

## 1回のlookupリクエストのライフサイクル

1. ユーザーがテキストエリアに単語リストを入力し送信する。
2. ブラウザが `POST /api/lookup`（Next.jsのAPIルート、同一オリジン）にリクエストを送る。
3. Next.jsのAPIルートが、サーバーサイドから `FASTAPI_BASE_URL` 環境変数の指す先（Render上のFastAPI）へ同じボディでリクエストを転送する。
4. FastAPIの `app/routers/lookup.py` がリクエストを受け、`app/services/parsing.py` で入力テキストを単語リストに正規化する（改行・カンマ分割、trim、空要素除去、大文字小文字を小文字化）。
5. `app/services/lookup_service.py` が各単語について:
   - `app/services/dictionary_service.py` 経由で `dictionary` テーブルを検索し、訳語を取得（見つからなければ `null`）。
   - `app/services/sentence_service.py` 経由で `word_examples` テーブルを検索し、対応する例文を取得（見つからなければ `null`）。
6. 結果のリストをJSONとしてNext.jsに返し、Next.jsがそのままブラウザに返す。
7. ブラウザは結果をテーブルでプレビュー表示する。
8. ユーザーが「CSVダウンロード」を押すと、ブラウザは同じ入力テキストを `POST /api/export/csv`（Next.js経由でFastAPIの同名エンドポイント）に送信し、返ってきた `text/csv` のBlobをファイルとして保存する。CSV生成時のロジック（ステップ4〜5相当）はlookupと共有の `lookup_service.py` を再利用し、`app/services/csv_service.py` がCSVバイト列への変換のみを担う。

詳細なリクエスト/レスポンス形式は [docs/api.md](./api.md) を参照。
