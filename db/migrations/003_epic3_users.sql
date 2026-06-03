-- Epic 3: public.users (Supabase Table Editor에서 확인)
-- SQL Editor에서 실행하거나: pnpm db:push

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 기존 로그인 사용자를 users에 반영 (이미 auth.users에 있는 경우)
-- INSERT INTO public.users (id, email, credits)
-- SELECT id, email, 3 FROM auth.users
-- ON CONFLICT (id) DO NOTHING;
