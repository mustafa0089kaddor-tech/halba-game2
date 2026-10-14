-- حلبة: مخطط قاعدة البيانات. شغّله مرة واحدة في Supabase > SQL Editor، ثم seed.sql
create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'user' check (role in ('user','admin')),
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

create table if not exists packs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  price_label text,           -- نص العرض مثل «29 ر.س»
  stripe_price_id text,       -- سعر دفعة واحدة (one-time) في Stripe
  active boolean not null default true
);

create table if not exists sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  url text,
  blurb text,
  active boolean not null default true
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  emoji text not null default '❓',
  color text not null default '#38B6D8',
  description text,
  group_key text not null default 'arabic',          -- المحور (اللغة العربية، الأحاديث، ...)
  sort int not null default 0,
  premium boolean not null default false,            -- حصرية للمشتركين
  pack_id uuid references packs(id) on delete set null, -- تُباع كباقة منفصلة
  sponsor_id uuid references sponsors(id) on delete set null,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  points int not null check (points in (200,400,600)),   -- مستوى الصعوبة؛ كل فئة تضم عدداً كبيراً من كل مستوى
  type text not null default 'text' check (type in ('text','image','audio','video')),
  question text not null,
  answer text not null,
  options jsonb,                                     -- [الصحيحة, خطأ1, خطأ2, خطأ3]
  source text,                                       -- مصدر الحديث/الآية/الكتاب
  media_url text,                                    -- رابط صورة/صوت/فيديو أو رابط يوتيوب
  media_credit text,                                 -- النسبة والترخيص
  media_license text check (media_license in ('free','own','restricted')), -- null أو restricted = لا يُعرض
  flags jsonb not null default '[]'::jsonb,           -- أيقونات التحذير: religious | film | character
  source_url text,                                   -- رابط المصدر، يُحوَّل إلى QR
  status text not null default 'draft' check (status in ('draft','approved')), -- لا يُعرض إلا المعتمد
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (category_id, question)
);
create index if not exists questions_pool on questions (category_id, points) where active and status = 'approved';

create table if not exists seen_questions (          -- لتقليل تكرار الأسئلة على اللاعب نفسه
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references questions(id) on delete cascade,
  seen_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create or replace view category_stats as              -- حجم البنك المعتمد لكل فئة
  select category_id,
    count(*) filter (where points = 200) as c200,
    count(*) filter (where points = 400) as c400,
    count(*) filter (where points = 600) as c600,
    count(*) as total
  from questions where active and status = 'approved' group by category_id;

create table if not exists orgs (                    -- نسخة الشركات والفعاليات: /e/<slug>
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  logo_url text,
  color text,
  contact_email text,
  active boolean not null default true
);

create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  org_id uuid references orgs(id) on delete set null,
  teams jsonb,
  categories jsonb,
  scores jsonb,
  winner int,                                        -- 0 / 1 / -1 للتعادل
  status text not null default 'started' check (status in ('started','finished')),
  started_at timestamptz not null default now(),
  finished_at timestamptz
);
create index if not exists games_user_day on games (user_id, started_at desc);

create table if not exists subscriptions (
  id text primary key,                               -- معرّف الاشتراك في Stripe
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null,
  price_id text,
  interval text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists purchases (               -- ما يملكه المستخدم من باقات
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pack_id uuid not null references packs(id) on delete cascade,
  stripe_session_id text unique,
  created_at timestamptz not null default now(),
  unique (user_id, pack_id)
);

create table if not exists payments (                -- سجل الإيرادات للوحة الأدمن
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  kind text not null check (kind in ('subscription','pack')),
  amount int not null,                               -- بأصغر وحدة (هللة/سنت)
  currency text not null,
  stripe_ref text unique,
  created_at timestamptz not null default now()
);

create table if not exists feedback (                -- تقييم وإبلاغ
  id uuid primary key default gen_random_uuid(),
  question_id uuid references questions(id) on delete cascade,
  kind text not null check (kind in ('report','up','down')),
  reason text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- إنشاء ملف المستخدم تلقائياً عند التسجيل
create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- الأمان: كل الجداول مقفلة. الخادم يقرأ ويكتب بمفتاح service_role فقط،
-- فلا تُكشف إجابات الفئات المدفوعة عبر مفتاح anon العام.
alter table profiles enable row level security;
alter table packs enable row level security;
alter table sponsors enable row level security;
alter table categories enable row level security;
alter table questions enable row level security;
alter table orgs enable row level security;
alter table games enable row level security;
alter table subscriptions enable row level security;
alter table purchases enable row level security;
alter table payments enable row level security;
alter table feedback enable row level security;
alter table seen_questions enable row level security;

create policy "own profile" on profiles for select using (auth.uid() = id);
create policy "own games" on games for select using (auth.uid() = user_id);
create policy "own subs" on subscriptions for select using (auth.uid() = user_id);

-- مخزن الوسائط (صور/صوت/فيديو الأسئلة): عام للقراءة، والرفع من الخادم فقط
insert into storage.buckets (id, name, public) values ('media','media', true) on conflict (id) do nothing;

-- لجعل نفسك أدمن بعد أول تسجيل دخول:
-- update profiles set role = 'admin' where email = 'you@example.com';

-- للمشاريع التي شغّلت نسخة سابقة من المخطط (آمن للتكرار):
alter table questions add column if not exists media_credit text;

-- ترقية من النسخ السابقة (آمن للتكرار):
alter table questions add column if not exists media_license text check (media_license in ('free','own','restricted'));
alter table questions add column if not exists flags jsonb not null default '[]'::jsonb;
alter table questions add column if not exists source_url text;
