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

-- Only a verified account reserves its email and its name + date of birth.
-- An unverified signup (never confirmed, or whose token expired) does not
-- permanently block a fresh signup attempt with the same details.
create unique index if not exists users_email_verified_unique
  on users (email) where email_verified;

create unique index if not exists users_name_dob_verified_unique
  on users (lower(trim(name)), date_of_birth) where email_verified;
