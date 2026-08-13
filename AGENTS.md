# EJCSV 開発ガイド

## プロジェクト概要

EJCSVは、英単語または短いフレーズのリストから、英単語・日本語訳・英語例文の3列を持つCSVを生成するWebアプリケーションです。

- 辞書データ: EJDict（CC0）
- 例文データ: Tatoeba（CC BY 2.0 FR）
- フロントエンド: Next.js App Router、React、TypeScript
- バックエンド: FastAPI、SQLite

詳細仕様は、作業対象に応じて `docs/requirements.md`、`docs/api.md`、`docs/architecture.md` などを一次情報源として確認してください。

## リポジトリ構成

```text
frontend/   Next.js UIとAPIプロキシ
backend/    FastAPI、検索サービス、CSV生成、SQLite DB
docs/       要件・設計・データ・デプロイ・テストのドキュメント
```

`frontend/` 配下で作業する場合は、同ディレクトリの `AGENTS.md` も必ず確認してください。Next.js関連のローカルルールが記載されています。

## 開発時の基本コマンド

バックエンド:

```bash
cd backend
pip install -e ".[dev]"
uvicorn app.main:app --reload
pytest
ruff check .
black --check .
```

フロントエンド:

```bash
cd frontend
npm install
npm run dev
npm test
npm run lint
npm run build
```

ローカル利用時は、`frontend/.env.local` に以下を設定します。

```text
FASTAPI_BASE_URL=http://localhost:8000
```

## 実装方針

- 入力の分割・trim・空要素除去・小文字化・空白正規化はバックエンドで行う。
- 入力順と重複は保持する。未知語でも行を削除せず、該当するセルだけ空欄にする。
- 単語の照合は語形の完全一致とし、ステミングや見出し語化は行わない。
- `/api/lookup` と `/api/export/csv` は `app/services/lookup_service.py` の共通ロジックを利用する。ルーターごとに検索処理を複製しない。
- SQLiteは読み取り専用で利用する。リクエスト処理中に生のEJDict/Tatoebaデータを読み込んだり、DBを更新したりしない。
- データのパース、正規化、例文選定は `backend/scripts/build_data.py` で事前に行う。
- APIの入出力はPydanticモデルで型付けする。
- バックエンドはruff/Black、フロントエンドはESLint/Prettierの既存設定に従う。
- 新しい依存関係や状態管理ライブラリは、必要性を確認してから追加する。

## データとライセンス

- `backend/data/raw/` は再生成可能な生データであり、リポジトリへ追加しない。
- SQLite成果物の更新が必要な場合は、データセットの取得元・バージョン・ビルド条件を確認し、`docs/datasets.md` と `docs/data-pipeline.md` の方針に従う。
- UI上のEJDict/Tatoebaのクレジット表記を削除・省略しない。
- 例文には可能な限りTatoebaの文IDリンクを保持する。

## テスト方針

バックエンドのテストは本番DBに依存せず、`backend/tests/fixtures/` の小さなSQLite fixtureを使用します。特に次を確認します。

- 入力パース、正規化、重複保持
- 辞書・例文の検索と未ヒット時の扱い
- 単語境界での例文一致と例文選定の決定性
- CSVヘッダー、UTF-8 BOM、クオート、空欄
- APIの正常系、422バリデーション、CSVレスポンス

フロントエンドはVitestとReact Testing Libraryでコンポーネントの主要な挙動を検証します。変更時は関連テストを先に実行し、可能ならバックエンド・フロントエンドの全テストも実行してください。

## APIと制限

- `POST /api/lookup`: 検索結果をJSONで返す
- `POST /api/export/csv`: UTF-8 BOM付きCSVを返す
- デフォルトの制限は、最大200語、入力全体10,000文字、1トークン100文字、20リクエスト/分/IP
- 制限値やDBパス、CORS許可オリジンは `backend/app/core/config.py` の設定で変更する

API契約を変更する場合は、バックエンドのPydanticモデル、Next.jsのAPIプロキシ、`frontend/lib/api.ts`、関連テスト、`docs/api.md` をまとめて更新します。

## 変更時の注意

- 変更前に関連する既存コードとドキュメントを読み、現在の作業ツリーの変更を上書きしない。
- データセットやライセンスに関わる変更は、実装だけでなくクレジットとドキュメントも更新する。
- デプロイ設定を変更した場合は `render.yaml`、`backend/Dockerfile`、`docs/deployment.md` の整合性を確認する。
- 仕様変更を伴う場合は、まず `docs/requirements.md` と `docs/api.md` の決定事項・制約を更新する。
- 完了時は、実行したテストと未実行の検証（依存関係不足など）があれば明記する。
