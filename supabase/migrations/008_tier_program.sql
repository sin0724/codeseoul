-- 티어 프로그램: tier(승인됨), tier_requested(승급 신청 중), tier_requested_at
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tier TEXT,
  ADD COLUMN IF NOT EXISTS tier_requested TEXT,
  ADD COLUMN IF NOT EXISTS tier_requested_at TIMESTAMPTZ;
