-- applications에 'confirmed' 상태 추가 (광고주 컨펌 후 정산 대기)
ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE public.applications
  ADD CONSTRAINT applications_status_check
  CHECK (status IN ('applied', 'selected', 'completed', 'confirmed', 'paid'));
