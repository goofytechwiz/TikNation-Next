alter table public.tiknation_privacy_settings
  add column if not exists show_followers boolean not null default true,
  add column if not exists show_following boolean not null default true,
  add column if not exists who_can_comment text not null default 'everyone'
    check (who_can_comment in ('everyone','followers','following','none')),
  add column if not exists who_can_tag text not null default 'everyone'
    check (who_can_tag in ('everyone','followers','following','none')),
  add column if not exists require_tag_approval boolean not null default false,
  add column if not exists allow_content_downloads boolean not null default false,
  add column if not exists allow_reposts boolean not null default true,
  add column if not exists allow_content_remix boolean not null default false;

create table if not exists public.tiknation_hidden_words (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  phrase text not null check (char_length(trim(phrase)) between 1 and 60),
  created_at timestamptz not null default now(),
  unique (user_id, phrase)
);
alter table public.tiknation_hidden_words enable row level security;
revoke all on public.tiknation_hidden_words from anon, public;
grant select, insert, delete on public.tiknation_hidden_words to authenticated;
drop policy if exists "Users manage their own hidden words" on public.tiknation_hidden_words;
create policy "Users manage their own hidden words"
on public.tiknation_hidden_words for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create table if not exists public.tiknation_restricted_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  restricted_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, restricted_user_id),
  check (user_id <> restricted_user_id)
);
alter table public.tiknation_restricted_accounts enable row level security;
revoke all on public.tiknation_restricted_accounts from anon, public;
grant select, insert, delete on public.tiknation_restricted_accounts to authenticated;
drop policy if exists "Users manage their own restricted accounts" on public.tiknation_restricted_accounts;
create policy "Users manage their own restricted accounts"
on public.tiknation_restricted_accounts for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
