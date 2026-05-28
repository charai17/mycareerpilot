# Supabase Setup

This folder contains the starter database schema for mycareerpilot.

## Environment

Create `.env.local` locally with:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

The local `.env.local` file is ignored by Git.

## Database

Run `schema.sql` in the Supabase SQL editor to create:

- `profiles`
- `cvs`
- `jobs`
- `applications`
- `application_drafts`
- `audit_logs`

The schema enables row-level security and policies so signed-in users can only manage their own data.

## Auth

Google login will be wired through Supabase Auth in the next milestone.
