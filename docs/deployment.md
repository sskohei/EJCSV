# デプロイ

本プロジェクトはポートフォリオとして公開する想定であり、企業規模のインフラは不要。以下、具体的なホスティング先とその理由をまとめる。

## フロントエンド: Vercel

- Next.js App Routerに対してゼロコンフィグでデプロイ可能。
- GitHub連携で `main` へのマージ・PRごとのプレビューデプロイが自動化できる。
- 無料枠がポートフォリオ用途として十分。
- 環境変数 `FASTAPI_BASE_URL` をVercelのプロジェクト設定で登録する。

## バックエンド: Render（Dockerランタイム）

Render（Webサービス、Dockerランタイム）を第一候補として推奨する。Railway・Fly.ioとの比較:

| 選択肢 | 判断 |
|---|---|
| **Render**（採用） | SQLiteファイルをDockerイメージに同梱するだけで動作し、永続ボリューム等のマネージドDBが不要な本構成に適合。GitHub連携での自動デプロイ、環境変数のUI設定がシンプル |
| Fly.io | 悪くない選択肢だが、`fly.toml`・`flyctl`・ボリューム管理など運用面の複雑さが本プロジェクトの規模に対して過剰 |
| Railway | 従量課金がメインで、常時公開するポートフォリオ用途では費用の予測がしづらい |

- `Dockerfile`（バックエンド）: 依存関係のインストール → `app/` と（Git LFSで解決済みの）`data/build/ejcsv.db` をコピー → `uvicorn app.main:app --host 0.0.0.0 --port $PORT` で起動。
- **無料枠の注意点**: Renderの無料Webサービスは約15分間アクセスがないとスリープし、次のリクエスト時に数秒のコールドスタートが発生する。ポートフォリオデモとしては許容範囲だが、本番SLAが必要な用途には不向きである旨を明記しておく。

## CORS設定

フロントエンドがNext.jsのAPIルート経由でバックエンドを呼び出す構成（[docs/frontend.md](./frontend.md)）のため、FastAPI側のCORS許可オリジンは `ALLOWED_ORIGIN`（Vercelのデプロイ先URL）のみに絞り込む。ブラウザから直接叩かれることを想定した緩いCORS設定は不要。

## レート制限

[docs/backend.md](./backend.md) に記載の `slowapi` によるIPベースのレート制限（目安20req/分/IP）をRender上のバックエンドに適用する。単一インスタンス構成が前提。

## ライセンス表記チェックリスト

デプロイ前に以下を確認する（[docs/datasets.md](./datasets.md) 参照）:

- [ ] `AttributionFooter` コンポーネントがフロントエンドの全ページ（実質的にはメインページ）に表示されている
- [ ] EJDict（CC0）のクレジットが記載されている
- [ ] Tatoeba（CC BY 2.0 FR）のクレジット文言が記載されている
- [ ] プレビューテーブルの各例文に、該当するTatoeba文ページ（`tatoeba.org/en/sentences/show/{id}`）へのリンクが付与されている

## 今後の検討事項（V2）

- GitHub Actions によるCI（バックエンドのpytest、フロントエンドのlint/build）の追加（[docs/testing.md](./testing.md) 参照）
- 複数インスタンスへのスケールが必要になった場合のレート制限のRedis化
