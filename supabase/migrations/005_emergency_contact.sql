-- 비상연락처 (라인아이디, 카카오톡 아이디)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS line_id TEXT,
  ADD COLUMN IF NOT EXISTS kakao_id TEXT;
