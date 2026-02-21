-- 프로필에 팔로워 수 추가
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS follower_count INTEGER;

-- 캠페인에 팔로워 규모별 신청 가능 tier 추가 (JSONB 배열: under_10k, 10k_30k, 30k_50k, 50k_70k, 100k_plus)
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS follower_tiers JSONB DEFAULT '[]'::jsonb;
