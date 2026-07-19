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

-- Row level security - allow public insert without auth
alter table waitlist enable row level security;

create policy "Allow public signup" on waitlist for insert to public with check (true);
create policy "Allow read" on waitlist for select to public using (true);
create policy "Allow update" on waitlist for update to public using (true);