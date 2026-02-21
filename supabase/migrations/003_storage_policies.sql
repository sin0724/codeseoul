-- campaign-images 버킷용 Storage RLS 정책
-- Supabase SQL Editor에서 실행

-- 인증된 사용자 업로드 허용
CREATE POLICY "Allow authenticated uploads to campaign-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'campaign-images');

-- 인증된 사용자 업데이트 허용 (upsert 시 필요)
CREATE POLICY "Allow authenticated update campaign-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'campaign-images');

-- 공개 읽기 허용 (Public URL로 이미지 표시)
CREATE POLICY "Allow public read campaign-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'campaign-images');
