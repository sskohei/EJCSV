# フロントエンド (Next.js)

## 技術選定

- **Next.js App Router** を採用（現在の標準的な構成であり、APIルート機能をそのままバックエンドへのプロキシとして利用できるため）。
- **TypeScript**（strictモード）。
- MVPは単一ページのシンプルな構成とし、状態管理ライブラリ（Redux/Zustand/React Query等）は導入しない。素の `useState` / `useReducer` で入力テキスト・ローディング状態・結果・エラーを管理すれば十分な規模。

## ディレクトリ・コンポーネント構成

```
frontend/
  app/
    page.tsx                     # メインページ（単一ページ構成）
    api/
      lookup/route.ts            # POST /api/lookup のプロキシ（サーバーサイドでFastAPIへ転送）
      export/csv/route.ts        # POST /api/export/csv のプロキシ
  components/
    WordInputForm.tsx            # テキストエリア + 送信ボタン
    ResultsTable.tsx             # プレビュー用テーブル（word / translation / example、未ヒットの視覚表示）
    DownloadCsvButton.tsx        # fetch(POST) -> blob -> <a download> を発火するダウンロードボタン
    AttributionFooter.tsx        # Tatoeba/EJDictのクレジット表示（常時表示）
  lib/
    api.ts                       # /api/lookup, /api/export/csv 呼び出しの薄いラッパー
```

## UIフロー

1. ユーザーが `WordInputForm` のテキストエリアに単語リストを入力し送信する。
2. `lib/api.ts` 経由で `POST /api/lookup`（Next.jsのAPIルート）を呼ぶ。
3. レスポンスを `ResultsTable` でプレビュー表示する。訳語・例文が見つからなかったセルは視覚的に区別する（例: グレーアウトや「該当なし」の薄い表示）。各例文にはTatoebaの当該文ページへのリンクを添える（[docs/datasets.md](./datasets.md) のクレジット対応方針を参照)。
4. `DownloadCsvButton` を押すと、同じ入力テキストを `POST /api/export/csv` に送信し、返ってきたBlobを `<a download>` で保存する（GETではなくPOSTでボディを送る必要があるため、単純なハイパーリンクではなくJSでのfetch+blob方式を取る）。
5. `AttributionFooter` は常時表示し、Tatoeba/EJDictのクレジットを記載する。

## バックエンド接続方式: Next.js APIルート経由のプロキシ

ブラウザから直接FastAPIバックエンド（Render）を呼び出す構成（CORSで許可する方式）ではなく、**Next.jsのAPIルートをプロキシとして経由させる**方式を採用する。

理由:
- ブラウザは常に同一オリジン（Next.jsサーバー）としか通信しないため、CORS設定が不要になる。
- FastAPIバックエンドの実URLがクライアントバンドルに露出しない。
- 将来的にキャッシュ・リクエストログ・APIキー付与などを追加する場合、フロントエンドのUIコードを変更せずプロキシ層だけで対応できる。
- Render上のFastAPIのCORS設定を、実質的に任意のブラウザオリジンを許可する必要がないレベルまで絞り込める（[docs/deployment.md](./deployment.md) 参照）。

デプロイ時は `FASTAPI_BASE_URL` をVercelの環境変数として設定し、Next.jsのAPIルートがサーバーサイドからこの値を参照してFastAPIへ転送する。

## 環境変数

| 変数名 | 用途 |
|---|---|
| `FASTAPI_BASE_URL` | Render上にデプロイされたFastAPIバックエンドのベースURL（サーバーサイドのみで参照、クライアントに露出しない） |
