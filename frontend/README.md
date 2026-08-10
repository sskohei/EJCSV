# frontend

EJCSVのフロントエンド（Next.js App Router, TypeScript）。詳細は[プロジェクトルートのREADME](../README.md)と[docs/frontend.md](../docs/frontend.md)を参照。

## セットアップ

```bash
npm install
cp .env.example .env.local  # FASTAPI_BASE_URLをバックエンドの起動先に合わせて編集
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開く。APIルート（`/api/lookup`, `/api/export/csv`）は`FASTAPI_BASE_URL`が指すFastAPIバックエンドへリクエストをプロキシする。

## その他のコマンド

```bash
npm run build   # 本番ビルド
npm run lint    # ESLint
npm run format  # Prettier整形
npx tsc --noEmit  # 型チェック
```
