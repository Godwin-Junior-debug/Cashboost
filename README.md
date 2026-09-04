# Cashboost9ja — Local setup for auth & database

This project uses Supabase for auth and as the primary database. The frontend expects the `profiles` table and related schema defined in `supabase/migrations/20260711115344_create_nairaboost_schema.sql`.

Quick setup

- Create a Supabase project at https://app.supabase.com and copy the project URL and anon key.
- In your project root, create a `.env` file from the example:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Apply database schema

Option A — Supabase Dashboard (recommended):
- Open your Supabase project, go to **SQL Editor**, create a new query, paste the contents of `supabase/migrations/20260711115344_create_nairaboost_schema.sql`, and run it.

Option B — CLI / psql:
- Obtain your database connection string from the Supabase project settings.
- Run:

```bash
psql "postgres://..." -f supabase/migrations/20260711115344_create_nairaboost_schema.sql
```

Notes

- The SQL migration installs triggers that auto-create `profiles` rows when a new auth user signs up. If you don't run the migration, the frontend now attempts a safe client-side `profiles` insert as a fallback.
- After the DB is set up and env vars are configured, run the dev server:

```bash
npm install
npm run dev
```

If you want, I can run the dev server here, or help you apply the migration via the Supabase CLI — tell me which you prefer.