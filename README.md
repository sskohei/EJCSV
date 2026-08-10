# EJCSV

英単語のリストを入力すると、「英単語・日本語訳・例文」の3列からなるCSVファイルを生成してダウンロードできるWebアプリケーションです。

- 辞書データ: [EJDict](https://github.com/kujirahand/EJDict)（CC0）
- 例文データ: [Tatoeba](https://tatoeba.org/)（CC BY 2.0 FR）
- フロントエンド: Next.js (App Router, TypeScript)
- バックエンド: FastAPI + SQLite

詳細な要件・アーキテクチャ・データセットの選定理由などは [`docs/`](./docs/) 配下、Claude Code向けの要点整理は [`CLAUDE.md`](./CLAUDE.md) を参照してください。

## ステータス

データビルド（EJDict/Tatoeba → SQLite）・バックエンドAPI（FastAPI）・フロントエンド（Next.js UI + APIルート）の実装、および両者のテスト（pytest / Vitest）整備は完了しています。残る作業はVercel/Renderへのデプロイです。

## セットアップ

```bash
# バックエンド
cd backend
pip install -e .
./scripts/fetch_raw_data.sh  # EJDict/Tatoebaの生データをdata/raw/に取得
python scripts/build_data.py \
  --ejdict-dir data/raw/ejdict/src \
  --tatoeba-file data/raw/tatoeba/eng_sentences.tsv \
  --out data/build/ejcsv.db
uvicorn app.main:app --reload

# フロントエンド（別ターミナル）
cd frontend
npm install
cp .env.example .env.local  # FASTAPI_BASE_URLをバックエンドの起動先に合わせて編集
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開くと利用できます。具体的な環境変数・データセットの取得手順は [docs/data-pipeline.md](./docs/data-pipeline.md) と [docs/deployment.md](./docs/deployment.md) を参照してください。

## テスト

```bash
# バックエンド
cd backend && pip install -e ".[dev]" && pytest

# フロントエンド
cd frontend && npm test
```

テスト方針の詳細は [docs/testing.md](./docs/testing.md) を参照してください。

## ブランチ命名規則

`main` から新しいブランチを切って作業し、Pull Requestを経てマージします。ブランチ名は以下の接頭辞を用いた `<type>/<short-description>` 形式とします。

| 接頭辞 | 用途 |
|---|---|
| `feature/<short-description>` | 新機能の追加 |
| `fix/<short-description>` | バグ修正 |
| `docs/<short-description>` | ドキュメントのみの変更 |
| `chore/<short-description>` | 依存関係の更新・雑務など |

対応するissueがある場合は、`feature/123-short-description` のようにissue番号を前置しても構いません。

例:
- `feature/word-lookup-api`
- `fix/csv-encoding-bom`
- `docs/project-scaffolding`

## ドキュメント一覧

詳細は [docs/](./docs/) を参照してください。

| ファイル | 内容 |
|---|---|
| [docs/requirements.md](./docs/requirements.md) | 要件定義 |
| [docs/datasets.md](./docs/datasets.md) | 使用データセットの詳細・ライセンス |
| [docs/architecture.md](./docs/architecture.md) | システムアーキテクチャ |
| [docs/data-pipeline.md](./docs/data-pipeline.md) | データビルドパイプライン |
| [docs/api.md](./docs/api.md) | API仕様 |
| [docs/backend.md](./docs/backend.md) | バックエンド設計 |
| [docs/frontend.md](./docs/frontend.md) | フロントエンド設計 |
| [docs/deployment.md](./docs/deployment.md) | デプロイ手順 |
| [docs/testing.md](./docs/testing.md) | テスト方針 |

## ライセンス

本アプリが利用するデータセットのライセンス（EJDict: CC0、Tatoeba: CC BY 2.0 FR）およびクレジット表記の方針については [docs/datasets.md](./docs/datasets.md) を参照してください。
