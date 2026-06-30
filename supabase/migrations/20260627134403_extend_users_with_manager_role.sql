/*
# Extend users table with manager role

## Overview
The existing `users` table has roles `admin` and `judge`. This migration adds
the `manager` (إداري) role to support the four user types requested:
- admin (ادمن)
- judge (محكم)
- contestant (متسابق)
- manager (إداري)

## Changes
- Drops the old CHECK constraint and replaces it with one that includes 'manager'.
- Adds a `phone` column for optional contact info.
- Adds a `notes` column for optional notes.
*/

-- Add phone and notes columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notes text;

-- Replace the role CHECK constraint to include 'manager'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'judge', 'contestant', 'manager'));
