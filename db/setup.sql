-- Supabase SQL Editor에서 실행 (Drizzle push 대안)
CREATE TYPE source_type AS ENUM ('text', 'youtube');
CREATE TYPE summary_status AS ENUM ('pending', 'completed', 'failed');

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  source_type source_type NOT NULL,
  original_content TEXT NOT NULL,
  summary_text TEXT,
  title TEXT,
  metadata TEXT,
  status summary_status NOT NULL DEFAULT 'pending',
  error_message TEXT,
  summary_options JSONB,
  schema_version TEXT DEFAULT 'v2',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS summaries_user_id_created_at_idx
  ON summaries (user_id, created_at DESC);

-- 이미 summaries 테이블이 있는 경우 (Epic 6 컬럼 추가)
ALTER TABLE public.summaries
  ADD COLUMN IF NOT EXISTS summary_options JSONB;

ALTER TABLE public.summaries
  ADD COLUMN IF NOT EXISTS schema_version TEXT DEFAULT 'v2';
