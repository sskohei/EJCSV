# CLAUDE.md

## プロジェクト概要

EJCSVは、英単語のリストを入力すると「英単語・日本語訳・例文」の3列からなるCSVファイルを生成しダウンロードできるWebアプリケーション。辞書データにEJDict（CC0）、例文データにTatoeba（CC BY 2.0 FR）を使用する。フロントエンドはNext.js、バックエンドはFastAPI。

## リポジトリ構成

```
frontend/   # Next.js (App Router, TypeScript)
backend/    # FastAPI + SQLite（EJDict/Tatoebaから事前ビルドしたルックアップDB）
docs/       # 詳細設計ドキュメント（下記参照）
```

`frontend/` と `backend/` は現時点では未実装（本リポジトリはまずドキュメントから整備している段階）。実装時は `docs/` の各ファイルを一次情報源とすること。

## 主要コマンド（実装後に整備）

```bash
# フロントエンド
cd frontend && npm run dev

# バックエンド
cd backend && uvicorn app.main:app --reload

# データビルド（EJDict/Tatoebaの生データからejcsv.dbを生成）
cd backend && python scripts/build_data.py

# テスト
cd backend && pytest
cd frontend && npm test
```

## ドキュメント一覧

| ファイル | 内容 |
|---|---|
| [docs/requirements.md](./docs/requirements.md) | 要件定義、MVPスコープの確定事項、既知の制約 |
| [docs/datasets.md](./docs/datasets.md) | EJDict/Tatoebaの実データ・ライセンス・採用理由 |
| [docs/architecture.md](./docs/architecture.md) | システム全体構成、リクエストのライフサイクル |
| [docs/data-pipeline.md](./docs/data-pipeline.md) | オフラインデータビルドの設計、SQLiteスキーマ |
| [docs/api.md](./docs/api.md) | APIエンドポイント仕様、CSV仕様 |
| [docs/backend.md](./docs/backend.md) | FastAPIのディレクトリ構成・サービス層設計 |
| [docs/frontend.md](./docs/frontend.md) | Next.jsのコンポーネント構成・UIフロー |
| [docs/deployment.md](./docs/deployment.md) | Vercel/Renderへのデプロイ、ライセンス表記 |
| [docs/testing.md](./docs/testing.md) | テスト方針 |

## コーディング規約（実装時の指針）

- フロントエンド: TypeScript strictモード、状態管理は素の `useState`/`useReducer` を優先しライブラリを安易に追加しない、eslint/prettierに従う。
- バックエンド: すべてのAPI入出力をPydanticモデルで型付けする、ruff/blackに従う。
- 辞書引き・例文引きのロジックは `app/services/lookup_service.py` に集約し、`/api/lookup` と `/api/export/csv` の間でロジックを重複させない（[docs/backend.md](./docs/backend.md) 参照）。
- データの前処理（EJDict/Tatoebaのパース・正規化・例文選定）はすべてオフラインの `scripts/build_data.py` で行い、リクエスト時には行わない（[docs/data-pipeline.md](./docs/data-pipeline.md) 参照）。

## ブランチ運用

ブランチ命名規則は [README.md](./README.md) を参照。

---

このファイルは要点のみを短く保つ。詳細は必ず `docs/` 配下の該当ファイルを参照すること。
