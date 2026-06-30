/*
# Quran Competition Platform — Schema & Auth

## Overview
Creates the full data model for a Quran competition management platform with
a custom "special ID" login system. Each authorized user (admin/judge) logs in
with a unique special ID code instead of email/password.

## New Tables

1. `users` — authorized platform users (admins / judges)
   - `id` (uuid, PK)
   - `special_id` (text, UNIQUE, NOT NULL) — the login code, e.g. "QC-ADMIN-001"
   - `name` (text, NOT NULL) — display name
   - `role` (text, NOT NULL, default 'admin') — 'admin' or 'judge'
   - `created_at` (timestamptz)

2. `contestants` — people being judged in the competition
   - `id` (uuid, PK)
   - `name` (text, NOT NULL)
   - `national_id` (text)
   - `phone` (text)
   - `nationality` (text)
   - `branch` (smallint, NOT NULL) — 1, 2, or 3
   - `institution` (text)
   - `notes` (text)
   - `created_at` (timestamptz)

3. `judges` — people who score contestants
   - `id` (uuid, PK)
   - `name` (text, NOT NULL)
   - `qualification` (text)
   - `specialty` (text)
   - `phone` (text)
   - `pin` (text)
   - `notes` (text)
   - `created_at` (timestamptz)

4. `sessions` — a scoring session for one contestant on one question template
   - `id` (uuid, PK)
   - `contestant_id` (uuid, FK -> contestants, ON DELETE CASCADE)
   - `branch` (smallint, NOT NULL)
   - `template_key` (text, NOT NULL) — e.g. "1_3" (branch_template)
   - `template_num` (smallint, NOT NULL)
   - `judges_count` (int, NOT NULL)
   - `grand_sum` (numeric, NOT NULL, default 0) — sum of per-question averages
   - `score_100` (numeric, NOT NULL, default 0) — final score out of 100
   - `max_per_q` (int, NOT NULL)
   - `q_count` (int, NOT NULL)
   - `judge_details` (jsonb) — array of {name, total}
   - `completed` (boolean, NOT NULL, default true)
   - `completed_at` (timestamptz)

5. `session_scores` — per-judge, per-question scores (the detailed breakdown)
   - `id` (uuid, PK)
   - `session_id` (uuid, FK -> sessions, ON DELETE CASCADE)
   - `judge_id` (uuid, FK -> judges, ON DELETE CASCADE)
   - `q_index` (smallint, NOT NULL) — 0-based question index
   - `score_h` (numeric, NOT NULL, default 0) — memorization
   - `score_t` (numeric, NOT NULL, default 0) — tajweed
   - `score_l` (numeric, NOT NULL, default 0) — recitation
   - `score_f` (numeric, NOT NULL, default 0) — tafsir
   - `total` (numeric, NOT NULL, default 0)
   - UNIQUE (session_id, judge_id, q_index)

6. `branch_scores` — per-branch scoring configuration (one row per branch 1/2/3)
   - `id` (uuid, PK)
   - `branch` (smallint, UNIQUE, NOT NULL)
   - `score_h` (int, NOT NULL, default 60)
   - `score_t` (int, NOT NULL, default 20)
   - `score_l` (int, NOT NULL, default 10)
   - `score_f` (int, NOT NULL, default 10)

## Security (RLS)
- All tables have RLS enabled.
- This app uses a custom special-ID login (not Supabase auth), so the anon-key
  client must be able to read and write all competition data. Policies use
  `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)` because the
  data is intentionally shared among all logged-in platform users. Access control
  is enforced at the application layer (the login screen gates the UI).
- The `users` table (which holds login codes) is readable by anon so the login
  screen can validate a special ID, but NOT writable by anon (only via service
  role / SQL) to prevent users from creating their own login codes.

## Seed Data
- Inserts default `branch_scores` rows for branches 1, 2, 3.
- Inserts one default admin user with special_id "QC-ADMIN-001".
*/

-- ============================================================
-- USERS (login accounts)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  special_id text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Login screen must read users to validate the special ID
DROP POLICY IF EXISTS "anon_select_users" ON users;
CREATE POLICY "anon_select_users" ON users FOR SELECT
  TO anon, authenticated USING (true);

-- Anon must NOT be able to create/modify login accounts (service role only)
DROP POLICY IF EXISTS "anon_insert_users" ON users;
CREATE POLICY "anon_insert_users" ON users FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_users" ON users;
CREATE POLICY "anon_update_users" ON users FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- CONTESTANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS contestants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  national_id text,
  phone text,
  nationality text,
  branch smallint NOT NULL,
  institution text,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE contestants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_contestants" ON contestants;
CREATE POLICY "anon_select_contestants" ON contestants FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_contestants" ON contestants;
CREATE POLICY "anon_insert_contestants" ON contestants FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_contestants" ON contestants;
CREATE POLICY "anon_update_contestants" ON contestants FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_contestants" ON contestants;
CREATE POLICY "anon_delete_contestants" ON contestants FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- JUDGES
-- ============================================================
CREATE TABLE IF NOT EXISTS judges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  qualification text,
  specialty text,
  phone text,
  pin text,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE judges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_judges" ON judges;
CREATE POLICY "anon_select_judges" ON judges FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_judges" ON judges;
CREATE POLICY "anon_insert_judges" ON judges FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_judges" ON judges;
CREATE POLICY "anon_update_judges" ON judges FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_judges" ON judges;
CREATE POLICY "anon_delete_judges" ON judges FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- SESSIONS (completed scoring sessions)
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contestant_id uuid REFERENCES contestants(id) ON DELETE CASCADE,
  branch smallint NOT NULL,
  template_key text NOT NULL,
  template_num smallint NOT NULL,
  judges_count int NOT NULL,
  grand_sum numeric NOT NULL DEFAULT 0,
  score_100 numeric NOT NULL DEFAULT 0,
  max_per_q int NOT NULL,
  q_count int NOT NULL,
  judge_details jsonb,
  completed boolean NOT NULL DEFAULT true,
  completed_at timestamptz DEFAULT now()
);
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sessions" ON sessions;
CREATE POLICY "anon_select_sessions" ON sessions FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_sessions" ON sessions;
CREATE POLICY "anon_insert_sessions" ON sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_sessions" ON sessions;
CREATE POLICY "anon_update_sessions" ON sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_sessions" ON sessions;
CREATE POLICY "anon_delete_sessions" ON sessions FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- SESSION_SCORES (per-judge per-question breakdown)
-- ============================================================
CREATE TABLE IF NOT EXISTS session_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  judge_id uuid NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  q_index smallint NOT NULL,
  score_h numeric NOT NULL DEFAULT 0,
  score_t numeric NOT NULL DEFAULT 0,
  score_l numeric NOT NULL DEFAULT 0,
  score_f numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  UNIQUE (session_id, judge_id, q_index)
);
ALTER TABLE session_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_session_scores" ON session_scores;
CREATE POLICY "anon_select_session_scores" ON session_scores FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_session_scores" ON session_scores;
CREATE POLICY "anon_insert_session_scores" ON session_scores FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_session_scores" ON session_scores;
CREATE POLICY "anon_update_session_scores" ON session_scores FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_session_scores" ON session_scores;
CREATE POLICY "anon_delete_session_scores" ON session_scores FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- BRANCH_SCORES (scoring config per branch)
-- ============================================================
CREATE TABLE IF NOT EXISTS branch_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch smallint UNIQUE NOT NULL,
  score_h int NOT NULL DEFAULT 60,
  score_t int NOT NULL DEFAULT 20,
  score_l int NOT NULL DEFAULT 10,
  score_f int NOT NULL DEFAULT 10
);
ALTER TABLE branch_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_branch_scores" ON branch_scores;
CREATE POLICY "anon_select_branch_scores" ON branch_scores FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_branch_scores" ON branch_scores;
CREATE POLICY "anon_insert_branch_scores" ON branch_scores FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_branch_scores" ON branch_scores;
CREATE POLICY "anon_update_branch_scores" ON branch_scores FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_branch_scores" ON branch_scores;
CREATE POLICY "anon_delete_branch_scores" ON branch_scores FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO branch_scores (branch, score_h, score_t, score_l, score_f)
VALUES (1, 60, 20, 10, 10), (2, 60, 20, 10, 10), (3, 60, 20, 10, 10)
ON CONFLICT (branch) DO NOTHING;

INSERT INTO users (special_id, name, role)
VALUES ('QC-ADMIN-001', 'مدير المسابقة', 'admin')
ON CONFLICT (special_id) DO NOTHING;
