-- campaigns 테이블에 recruitment_quota, brand_image_url 컬럼 추가
ALTER TABLE public.campaigns 
  ADD COLUMN IF NOT EXISTS recruitment_quota INTEGER,
  ADD COLUMN IF NOT EXISTS brand_image_url TEXT;

-- Storage bucket for campaign images (Supabase Dashboard > Storage에서 생성 가능)
-- 또는: INSERT INTO storage.buckets (id, name, public) VALUES ('campaign-images', 'campaign-images', true);
