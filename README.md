# Daily Habit Tracker

A polished habit-tracking web app prototype with email-linked local accounts, goals, schedules, charts, themes, and a phone-friendly step counter.

## Features

- Email and Google-style sign-in flow
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

## Current Prototype Notes

This version runs fully in the browser using local storage. Email sign-in creates a local account on the device. Gmail backup opens a real Gmail compose window, but full cloud sync requires a hosted app plus OAuth/backend setup.

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

- Host the app on GitHub Pages, Vercel, Netlify, Firebase Hosting, or Sites
- Add real Google OAuth
- Add cloud sync with Firebase or Supabase
- Convert to a Progressive Web App
- Add browser notifications for scheduled habit blocks
