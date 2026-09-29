create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  password_hash text not null,
  name text not null,
  date_of_birth date not null,
  email_verified boolean not null default false,
  verification_token text unique,
  verification_token_expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table users add column if not exists reset_token text unique;
alter table users add column if not exists reset_token_expires_at timestamptz;

-- Only a verified account reserves its email and its name + date of birth.
-- An unverified signup (never confirmed, or whose token expired) does not
-- permanently block a fresh signup attempt with the same details.
create unique index if not exists users_email_verified_unique
  on users (email) where email_verified;

create unique index if not exists users_name_dob_verified_unique
  on users (lower(trim(name)), date_of_birth) where email_verified;

alter table users add column if not exists is_operator boolean not null default false;

create table if not exists polls (
  id uuid primary key,
  question text not null,
  choice_mode text not null check (choice_mode in ('single', 'multiple')),
  deadline timestamptz,
  results_visibility text not null check (results_visibility in ('live', 'after_close')),
  closed_at timestamptz,
  created_by uuid not null references users (id),
  created_at timestamptz not null default now()
);

create table if not exists poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references polls (id) on delete cascade,
  label text not null,
  position integer not null
);

-- Marks that a User has already voted on a Poll. Deliberately has no
-- reference to which Option(s) they chose: that link lives only in
-- `votes`, which has no reference back to the User. See ADR 0001.
create table if not exists poll_voters (
  poll_id uuid not null references polls (id) on delete cascade,
  user_id uuid not null references users (id),
  voted_at timestamptz not null default now(),
  primary key (poll_id, user_id)
);

create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references polls (id) on delete cascade,
  option_id uuid not null references poll_options (id) on delete cascade,
  created_at timestamptz not null default now()
);
