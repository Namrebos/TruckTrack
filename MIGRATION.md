# Supabase to Neon migration

> The checked-in target schema has been reconciled against the current
> Supabase database metadata and verified with a test import into Neon.

## Completed test import (2026-09-20)

- Source: Supabase PostgreSQL 15.8
- Target: Neon PostgreSQL 18.6
- Imported and exact-content verified: 4 users, 3 trucks, 533 entries
- All four password values were confirmed as bcrypt hashes without exposing them
- Three trucks and all usernames were unique; critical source fields contained no nulls
- Nine historical entries reference truck names no longer present in `trucks`, so
  an `entries.truck` foreign key is intentionally not added yet
- A permission-restricted, Git-ignored source snapshot was created before import
- Anonymous API access was rejected and an ephemeral admin session verified all
  protected read endpoints; the users response contained no password field

The application now expects all browser data access to go through `/api`. The
Neon connection string is server-only and must never use a `VITE_` prefix.

## Before importing production data

1. Export and review the Supabase schema, indexes, constraints, functions,
   triggers, grants, and RLS policies.
2. Create a logical backup and record row counts for `users`, `trucks`, and
   `entries`.
3. Confirm that existing `users.password` values are bcrypt hashes.
4. Import into a non-production Neon branch first.
5. Run `npm run db:migrate:check`, then `npm run db:migrate:apply` only against
   an empty Neon target.

## Required server environment

Copy `.env.example` to `.env.local` for local Vercel development and configure
the same variables in Vercel for Preview and Production. Use a pooled Neon
connection string for `DATABASE_URL`.

## Verification gates

- Row counts and representative records match the source database.
- Password hashes are never returned by an API response.
- Driver sessions receive `403` from administrator endpoints.
- Editing browser storage does not grant administrator access.
- Logout invalidates the database session.
- Entry creation enforces an existing truck and non-decreasing odometer.
- Reports and spreadsheet exports match the Supabase-backed version.

Do not delete or disable Supabase until the Neon deployment has completed a
production observation period and a rollback has been tested.
