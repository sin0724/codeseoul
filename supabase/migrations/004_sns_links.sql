-- SNS 링크 여러개 지원: sns_links JSONB 추가
-- 형식: [{"label": "Instagram", "url": "https://..."}, ...]

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS sns_links JSONB DEFAULT '[]'::jsonb;

-- 기존 sns_link 데이터 마이그레이션
UPDATE public.profiles
SET sns_links = jsonb_build_array(jsonb_build_object('label', 'SNS', 'url', sns_link))
WHERE sns_link IS NOT NULL AND sns_link != '' AND (sns_links IS NULL OR sns_links = '[]'::jsonb);
