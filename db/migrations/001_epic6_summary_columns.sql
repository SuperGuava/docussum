-- Epic 6: 기존 summaries 테이블에 컬럼 추가
-- Supabase SQL Editor에서 실행하거나: pnpm db:push

ALTER TABLE public.summaries
  ADD COLUMN IF NOT EXISTS summary_options JSONB;

ALTER TABLE public.summaries
  ADD COLUMN IF NOT EXISTS schema_version TEXT DEFAULT 'v2';
