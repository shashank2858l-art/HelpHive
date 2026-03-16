-- DROP EVERYTHING FIRST TO ENSURE A CLEAN STATE
drop table if exists public.volunteer_activity cascade;
drop table if exists public.help_requests cascade;
drop table if exists public.volunteers cascade;
drop table if exists public.events cascade;
drop table if exists public.resources cascade;
drop table if exists public.notifications cascade;
drop table if exists public.disasters cascade;
drop table if exists public.tasks cascade;
drop table if exists public.users cascade;

-- REBUILD FROM SCRATCH
create extension if not exists "pgcrypto";

create table public.users (
  id uuid primary key default gen_random_uuid(),
  "fullName" text not null,
  email text unique not null,
  "passwordHash" text not null,
  role text not null check (role in ('admin', 'volunteer')),
  phone text,
  location text,
  skills text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.volunteers (
  id uuid primary key,
  name text,
  email text,
  role text default 'volunteer',
  status text default 'approved',
  skills text[] default '{}',
  "eventsJoined" int default 0,
  "hoursWorked" int default 0,
  "impactScore" int default 0,
  location text,
  coordinates jsonb,
  available boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text,
  name text,
  description text,
  location text,
  date timestamptz,
  status text default 'planned',
  "volunteersRequired" int default 0,
  "assignedVolunteers" uuid[] default '{}',
  "resourcesRequired" jsonb default '[]'::jsonb,
  coordinates jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  "resourceName" text,
  name text,
  category text default 'General',
  quantity int default 0,
  status text default 'available',
  location text,
  coordinates jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.volunteer_activity (
  id uuid primary key default gen_random_uuid(),
  "volunteerId" uuid,
  "eventId" uuid,
  "hoursContributed" int default 0,
  timestamp timestamptz default now(),
  created_at timestamptz default now()
);

create table public.help_requests (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  status text default 'open',
  urgency text,
  location text,
  "createdBy" uuid,
  "assignedVolunteers" uuid[] default '{}',
  coordinates jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid,
  title text,
  message text,
  read boolean default false,
  created_at timestamptz default now()
);

create table public.disasters (
  id uuid primary key default gen_random_uuid(),
  type text,
  location text,
  severity text,
  status text default 'active',
  coordinates jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  status text default 'pending',
  "assignedVolunteer" uuid,
  "eventId" uuid,
  "createdBy" uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ENABLE SECURITY
alter table public.users enable row level security;
alter table public.volunteers enable row level security;
alter table public.events enable row level security;
alter table public.resources enable row level security;
alter table public.volunteer_activity enable row level security;
alter table public.help_requests enable row level security;
alter table public.notifications enable row level security;
alter table public.disasters enable row level security;
alter table public.tasks enable row level security;

-- ALLOW SERVICE ACCESS (Strict standard syntax)
create policy users_service_all on public.users for all using (true) with check (true);
create policy volunteers_service_all on public.volunteers for all using (true) with check (true);
create policy events_service_all on public.events for all using (true) with check (true);
create policy resources_service_all on public.resources for all using (true) with check (true);
create policy volunteer_activity_service_all on public.volunteer_activity for all using (true) with check (true);
create policy help_requests_service_all on public.help_requests for all using (true) with check (true);
create policy notifications_service_all on public.notifications for all using (true) with check (true);
create policy disasters_service_all on public.disasters for all using (true) with check (true);
create policy tasks_service_all on public.tasks for all using (true) with check (true);

-- RELOAD CACHE
NOTIFY pgrst, 'reload schema';

-- SEED DATA DIRECTLY (FOOLPROOF)
INSERT INTO public.users (id, "fullName", email, "passwordHash", role)
VALUES 
('123e4567-e89b-12d3-a456-426614174000', 'System Admin', 'admin@helphive.org', '$2a$10$wN1r0m/kZlX1q0r/kZlX1e0m/kZlX1q0r/kZlX1e0m/kZlX1q', 'admin'),
('123e4567-e89b-12d3-a456-426614174001', 'Aisha Sharma', 'aisha.demo@helphive.org', '$2a$10$wN1r0m/kZlX1q0r/kZlX1e0m/kZlX1q0r/kZlX1e0m/kZlX1q', 'volunteer'),
('123e4567-e89b-12d3-a456-426614174002', 'Rahul Verma', 'rahul.demo@helphive.org', '$2a$10$wN1r0m/kZlX1q0r/kZlX1e0m/kZlX1q0r/kZlX1e0m/kZlX1q', 'volunteer')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.volunteers (id, name, email, role, "impactScore", "eventsJoined", "hoursWorked", location)
VALUES 
('123e4567-e89b-12d3-a456-426614174001', 'Aisha Sharma', 'aisha.demo@helphive.org', 'medical', 450, 12, 85, 'Mumbai, Maharashtra'),
('123e4567-e89b-12d3-a456-426614174002', 'Rahul Verma', 'rahul.demo@helphive.org', 'logistics', 210, 5, 40, 'Chennai, Tamil Nadu')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.events (id, title, description, location, date, status, "volunteersRequired")
VALUES 
('123e4567-e89b-12d3-a456-426614175001', 'Chennai Flood Relief Camp', 'Setting up a relief camp.', 'Chennai, Tamil Nadu', now() + interval '2 days', 'active', 50),
('123e4567-e89b-12d3-a456-426614175002', 'Medical Supply Distribution', 'Distributing essential supplies.', 'Mumbai, Maharashtra', now() + interval '5 days', 'planned', 20)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.resources ("resourceName", quantity, status, location)
VALUES 
('First Aid Kits', 500, 'available', 'Central Warehouse'),
('Blankets', 1200, 'available', 'Chennai Hub'),
('Drinking Water', 5000, 'in_transit', 'Mumbai Port');

INSERT INTO public.disasters (type, location, severity, status)
VALUES 
('Flood', 'Chennai, Tamil Nadu', 'high', 'active'),
('Cyclone Alert', 'Odisha Coast', 'critical', 'active');

INSERT INTO public.help_requests (title, description, status, urgency, location)
VALUES 
('Urgent Medical Assistance', 'Need a doctor immediately.', 'open', 'high', 'Chennai, Tamil Nadu'),
('Food Shortage', 'Running out of food packets.', 'in_progress', 'medium', 'Chennai, Tamil Nadu');

INSERT INTO public.volunteer_activity ("volunteerId", "hoursContributed", timestamp)
VALUES 
('123e4567-e89b-12d3-a456-426614174001', 8, now() - interval '10 days'),
('123e4567-e89b-12d3-a456-426614174001', 12, now() - interval '5 days'),
('123e4567-e89b-12d3-a456-426614174002', 5, now() - interval '20 days');
