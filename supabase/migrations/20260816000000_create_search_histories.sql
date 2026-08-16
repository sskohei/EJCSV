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
