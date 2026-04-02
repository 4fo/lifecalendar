-- =====================================================
-- LIFE CALENDAR DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. PROFILES TABLE (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  birthday date,
  life_span int default 71,
  week_start_day text default 'sunday',
  show_past_years boolean default false,
  theme text default 'system',
  subscription_tier text default 'free',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. EVENTS TABLE
create table public.events (
  id text primary key,
  user_id uuid references auth.users on delete cascade,
  title text not null,
  description text,
  start_date date not null,
  end_date date,
  category text not null,
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. YEARLY GOALS (Guided Life)
create table public.yearly_goals (
  id text primary key,
  user_id uuid references auth.users on delete cascade,
  year int not null,
  goals jsonb default '[]',
  created_at timestamptz default now()
);

-- 4. QUARTERLY OBJECTIVES
create table public.quarterly_objectives (
  id text primary key,
  user_id uuid references auth.users on delete cascade,
  year int not null,
  quarter int not null,
  objectives jsonb default '[]',
  created_at timestamptz default now()
);

-- 5. MONTHLY MILESTONES
create table public.monthly_milestones (
  id text primary key,
  user_id uuid references auth.users on delete cascade,
  year int not null,
  month int not null,
  milestones jsonb default '[]',
  created_at timestamptz default now()
);

-- 6. WEEKLY TASKS
create table public.weekly_tasks (
  id text primary key,
  user_id uuid references auth.users on delete cascade,
  year int not null,
  week int not null,
  tasks jsonb default '[]',
  created_at timestamptz default now()
);

-- 7. NUDGE HISTORY
create table public.nudges (
  id text primary key,
  user_id uuid references auth.users on delete cascade,
  nudge_type text not null,
  sent_at timestamptz default now(),
  completed boolean default false
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.yearly_goals enable row level security;
alter table public.quarterly_objectives enable row level security;
alter table public.monthly_milestones enable row level security;
alter table public.weekly_tasks enable row level security;
alter table public.nudges enable row level security;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- PROFILES: Users can only access their own profile
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- EVENTS: Users can only access their own events
create policy "Users can view own events" on events for select using (auth.uid() = user_id);
create policy "Users can insert own events" on events for insert with check (auth.uid() = user_id);
create policy "Users can update own events" on events for update using (auth.uid() = user_id);
create policy "Users can delete own events" on events for delete using (auth.uid() = user_id);

-- YEARLY GOALS
create policy "Users can view own yearly goals" on yearly_goals for select using (auth.uid() = user_id);
create policy "Users can insert own yearly goals" on yearly_goals for insert with check (auth.uid() = user_id);
create policy "Users can update own yearly goals" on yearly_goals for update using (auth.uid() = user_id);
create policy "Users can delete own yearly goals" on yearly_goals for delete using (auth.uid() = user_id);

-- QUARTERLY OBJECTIVES
create policy "Users can view own quarterly objectives" on quarterly_objectives for select using (auth.uid() = user_id);
create policy "Users can insert own quarterly objectives" on quarterly_objectives for insert with check (auth.uid() = user_id);
create policy "Users can update own quarterly objectives" on quarterly_objectives for update using (auth.uid() = user_id);
create policy "Users can delete own quarterly objectives" on quarterly_objectives for delete using (auth.uid() = user_id);

-- MONTHLY MILESTONES
create policy "Users can view own monthly milestones" on monthly_milestones for select using (auth.uid() = user_id);
create policy "Users can insert own monthly milestones" on monthly_milestones for insert with check (auth.uid() = user_id);
create policy "Users can update own monthly milestones" on monthly_milestones for update using (auth.uid() = user_id);
create policy "Users can delete own monthly milestones" on monthly_milestones for delete using (auth.uid() = user_id);

-- WEEKLY TASKS
create policy "Users can view own weekly tasks" on weekly_tasks for select using (auth.uid() = user_id);
create policy "Users can insert own weekly tasks" on weekly_tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own weekly tasks" on weekly_tasks for update using (auth.uid() = user_id);
create policy "Users can delete own weekly tasks" on weekly_tasks for delete using (auth.uid() = user_id);

-- NUDGES
create policy "Users can view own nudges" on nudges for select using (auth.uid() = user_id);
create policy "Users can insert own nudges" on nudges for insert with check (auth.uid() = user_id);
create policy "Users can update own nudges" on nudges for update using (auth.uid() = user_id);

-- =====================================================
-- FUNCTION: Create profile on user signup
-- =====================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

create index idx_events_user_id on events(user_id);
create index idx_events_start_date on events(start_date);
create index idx_yearly_goals_user_year on yearly_goals(user_id, year);
create index idx_quarterly_objectives_user_quarter on quarterly_objectives(user_id, year, quarter);
create index idx_monthly_milestones_user_month on monthly_milestones(user_id, year, month);
create index idx_nudges_user_sent on nudges(user_id, sent_at);
