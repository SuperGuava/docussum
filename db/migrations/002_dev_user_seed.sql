-- Tech Spec 예시 SQL로 summaries.user_id → users FK를 둔 경우에만 필요
-- Drizzle setup.sql만 쓴 경우 이 파일은 건너뛰어도 됩니다.

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL DEFAULT 'dev@local.test',
  credits INT DEFAULT 999,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.users (id, email, credits)
VALUES (
  '00000000-0000-4000-8000-000000000001',
  'dev@local.test',
  999
)
ON CONFLICT (id) DO NOTHING;
