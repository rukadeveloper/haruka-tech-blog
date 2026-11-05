-- Supabase SQL Editor 에 통째로 붙여 넣고 Run. 여러 번 실행해도 안전하다.

create table if not exists public.posts (
  slug        text primary key,
  title       text not null,
  date        date,
  category    text not null default '',
  description text not null default '',
  tags        text[] not null default '{}',
  thumbnail   text not null default '',
  format      text not null default 'markdown' check (format in ('markdown', 'html')),
  draft       boolean not null default false,
  body        text not null default '',
  -- 위 컬럼에 없는 frontmatter (tistoryId 등)
  extra       jsonb not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists posts_date_idx on public.posts (date desc);

-- path: "FE" 또는 "FE/Next.js", position: 표시 순서
create table if not exists public.categories (
  path     text primary key,
  position integer not null
);

create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_slug  text not null references public.posts (slug) on update cascade on delete cascade,
  parent_id  uuid references public.comments (id) on delete cascade,
  author_id  bigint not null,
  login      text not null,
  name       text not null,
  avatar     text not null,
  body       text not null,
  created_at timestamptz not null default now()
);
create index if not exists comments_post_idx on public.comments (post_slug, created_at);

-- 서버(service role)만 접근한다. RLS 를 켜고 정책을 만들지 않으면 공개 키(anon)로는 읽기·쓰기가 모두 막힌다.
alter table public.posts enable row level security;
alter table public.categories enable row level security;
alter table public.comments enable row level security;

-- 방명록 (GitHub 로그인 한 방문자가 남긴 글)
create table if not exists public.guestbook (
  id         uuid primary key default gen_random_uuid(),
  author_id  bigint not null,
  login      text not null,
  name       text not null,
  avatar     text not null,
  body       text not null,
  created_at timestamptz not null default now()
);
create index if not exists guestbook_created_idx on public.guestbook (created_at desc);
alter table public.guestbook enable row level security;
