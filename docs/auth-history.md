# 認証・検索履歴

## 方針

- Googleアカウントによる認証にはSupabase Authを利用する。
- ユーザーの検索履歴はSupabase PostgreSQLに保存する。
- 認証・履歴処理はNext.jsのサーバー側で行い、FastAPIは辞書・例文検索とCSV生成を担当する。
- 未ログインでも検索とCSV出力は利用できる。ログイン中の検索成功時だけ履歴を保存する。
- 履歴保存に失敗しても、検索結果の表示やCSV出力は失敗させない。

## テーブル案

Supabase Authが管理する`auth.users`をユーザー情報の基準とし、アプリケーション側では検索履歴だけを管理する。

```sql
create table public.search_histories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  input_text text not null,
  normalized_words jsonb not null,
  results jsonb not null,
  result_count integer not null,
  created_at timestamptz not null default now()
);

create index search_histories_user_created_at_idx
  on public.search_histories (user_id, created_at desc);
```

`results`には保存時点の`WordResult`配列を保存する。辞書データが将来更新されても、過去の履歴を同じ内容で再表示できるようにする。

## Row Level Security

```sql
alter table public.search_histories enable row level security;

create policy "users can read own search histories"
  on public.search_histories for select
  using (auth.uid() = user_id);

create policy "users can insert own search histories"
  on public.search_histories for insert
  with check (auth.uid() = user_id);

create policy "users can delete own search histories"
  on public.search_histories for delete
  using (auth.uid() = user_id);
```

SupabaseのService Role Keyはブラウザに公開しない。Next.jsではユーザーセッションを付与したServer Clientを利用し、RLSを適用する。

## 処理フロー

1. ブラウザがSupabase AuthのGoogleログインを開始する。
2. OAuthコールバック後、SupabaseのセッションCookieを設定する。
3. ブラウザが`POST /api/lookup`を呼び出す。
4. Next.jsがFastAPIへ検索を転送する。
5. FastAPIのレスポンスが正常なら、Next.jsはログインユーザーの履歴をSupabaseへ保存する。
6. 履歴保存の成否にかかわらず、検索結果をブラウザへ返す。

CSVダウンロードでは履歴を保存しない。
