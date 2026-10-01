# Daily Habit Tracker

A polished habit-tracking web app prototype with email-linked local accounts, goals, schedules, charts, themes, and a phone-friendly step counter.

## Features

- Email local sign-in and real Google login through Supabase
- Separate pages for Today, Graphs, Schedule, Goals, and Settings
- Habit creation with targets, units, and custom colors
- Circular daily progress rings
- Habit-colored trend charts
- Schedule planner with date-specific time blocks
- Daily-life schedule blocks for study, work, meals, rest, chores, social time, and personal plans
- Per-email local storage, so different emails get different habits and schedules on the same device
- Theme picker with multiple app themes
- Gmail and Mail backup actions
- Phone motion step counter with manual fallback
- Optional Supabase cloud sync for habits, logs, schedules, themes, and settings

## Cloud Sync Setup

Local email mode still works fully in the browser. For real Google login and cross-device sync, create a Supabase project and run this SQL in the Supabase SQL editor:

```sql
create table if not exists public.habit_tracker_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  habits jsonb not null default '[]'::jsonb,
  logs jsonb not null default '[]'::jsonb,
  schedule jsonb not null default '[]'::jsonb,
  missed_notes jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.habit_tracker_profiles enable row level security;

create policy "Users can read their own habit tracker profile"
on public.habit_tracker_profiles
for select
using (auth.uid() = user_id);

create policy "Users can insert their own habit tracker profile"
on public.habit_tracker_profiles
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own habit tracker profile"
on public.habit_tracker_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

Then:

1. In Supabase, enable **Authentication → Providers → Google**.
2. Add your app URL under **Authentication → URL Configuration**.
3. Copy your Supabase **Project URL** and **anon public key**.
4. Open the app, sign in locally once, go to **Settings → Cloud Sync**, paste those values, and press **Save cloud settings**.
5. Press **Sign in with Google**.

After Google login, the app saves and loads habits, logs, schedules, themes, and settings from Supabase. The same Google account will sync across phone and laptop when both devices use the same hosted app URL.

## Run Locally

The standalone prototype can be opened directly:

```text
index.html
```

The React/TypeScript source is also included for future development:

```bash
npm install
npm run dev
```

## Recommended Next Steps

- Host the app on GitHub Pages, Vercel, Netlify, Firebase Hosting, or Sites so Google login has a stable redirect URL
- Convert to a Progressive Web App
- Add conflict resolution for editing offline on multiple devices at the same time
