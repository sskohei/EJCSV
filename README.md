# EJCSV

英単語のリストを入力すると、「英単語・日本語訳・例文」の3列からなるCSVファイルを生成してダウンロードできるWebアプリケーションです。

- 辞書データ: [EJDict](https://github.com/kujirahand/EJDict)（CC0）
- 例文データ: [Tatoeba](https://tatoeba.org/)（CC BY 2.0 FR）
- フロントエンド: Next.js (App Router, TypeScript)
- バックエンド: FastAPI + SQLite

詳細な要件・アーキテクチャ・データセットの選定理由などは [`docs/`](./docs/) 配下、Claude Code向けの要点整理は [`CLAUDE.md`](./CLAUDE.md) を参照してください。

## ステータス

現在はプロジェクトの設計ドキュメント整備段階です。`frontend/`・`backend/` の実装はこれから行います。

## セットアップ（実装後に整備）

```bash
# フロントエンド
cd frontend && npm install && npm run dev

# バックエンド
cd backend && pip install -e . && python scripts/build_data.py && uvicorn app.main:app --reload
```

具体的な環境変数・データセットの取得手順は [docs/data-pipeline.md](./docs/data-pipeline.md) と [docs/deployment.md](./docs/deployment.md) を参照してください。

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
