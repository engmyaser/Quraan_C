/*
# Tafsir & Quran Questions Tables

## Overview
Adds two new tables to let admins manage question banks:
1. `tafsir_questions` — 5 tafsir (interpretation) questions per branch/template
2. `quran_questions` — additional Quran recitation questions per branch/template

## New Tables

### `tafsir_questions`
- `id` (uuid, PK)
- `branch` (smallint, NOT NULL) — 1, 2, or 3
- `template_num` (smallint, NOT NULL) — template number within the branch
- `question_num` (smallint, NOT NULL) — 1 to 5
- `question_text` (text, NOT NULL) — the tafsir question
- `reference` (text) — optional reference (surah/verse)
- `answer_notes` (text) — optional expected answer notes
- `created_at` (timestamptz)
- UNIQUE (branch, template_num, question_num)

### `quran_questions`
- `id` (uuid, PK)
- `branch` (smallint, NOT NULL)
- `template_num` (smallint, NOT NULL)
- `question_num` (smallint, NOT NULL)
- `surah` (text, NOT NULL) — surah name
- `verse` (int, NOT NULL) — verse number
- `page` (int, NOT NULL) — mushaf page number
- `question_text` (text) — the verse text to recite
- `created_at` (timestamptz)
- UNIQUE (branch, template_num, question_num)

## Security
- RLS enabled on both tables.
- Policies use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)`
  because the data is shared among all logged-in platform users (same pattern as
  the existing tables).
*/

-- ============================================================
-- TAFSIR QUESTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS tafsir_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch smallint NOT NULL,
  template_num smallint NOT NULL,
  question_num smallint NOT NULL,
  question_text text NOT NULL,
  reference text,
  answer_notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (branch, template_num, question_num)
);
ALTER TABLE tafsir_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_tafsir_questions" ON tafsir_questions;
CREATE POLICY "anon_select_tafsir_questions" ON tafsir_questions FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_tafsir_questions" ON tafsir_questions;
CREATE POLICY "anon_insert_tafsir_questions" ON tafsir_questions FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_tafsir_questions" ON tafsir_questions;
CREATE POLICY "anon_update_tafsir_questions" ON tafsir_questions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_tafsir_questions" ON tafsir_questions;
CREATE POLICY "anon_delete_tafsir_questions" ON tafsir_questions FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- QURAN QUESTIONS (additional recitation questions)
-- ============================================================
CREATE TABLE IF NOT EXISTS quran_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch smallint NOT NULL,
  template_num smallint NOT NULL,
  question_num smallint NOT NULL,
  surah text NOT NULL,
  verse int NOT NULL,
  page int NOT NULL,
  question_text text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (branch, template_num, question_num)
);
ALTER TABLE quran_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_quran_questions" ON quran_questions;
CREATE POLICY "anon_select_quran_questions" ON quran_questions FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_quran_questions" ON quran_questions;
CREATE POLICY "anon_insert_quran_questions" ON quran_questions FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_quran_questions" ON quran_questions;
CREATE POLICY "anon_update_quran_questions" ON quran_questions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_quran_questions" ON quran_questions;
CREATE POLICY "anon_delete_quran_questions" ON quran_questions FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tafsir_branch_template ON tafsir_questions (branch, template_num);
CREATE INDEX IF NOT EXISTS idx_quran_branch_template ON quran_questions (branch, template_num);
