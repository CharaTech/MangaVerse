-- Waitlist table for email subscribers
create table waitlist (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  subscribed_at timestamp with time zone default now(),
  confirmed boolean default false,
  confirmation_token text,
  notified boolean default false
);

-- Index for fast lookups
create index idx_waitlist_email on waitlist(email);
create index idx_waitlist_confirmed on waitlist(confirmed);

-- Row level security
alter table waitlist enable row level security;

create policy "Allow signup" on waitlist for insert with check (true);
create policy "Allow read own" on waitlist for select using (email = current_setting('request.email', true));
create policy "Allow update own" on waitlist for update using (email = current_setting('request.email', true));