-- applications에 'rejected' 상태 추가 (지원 거절)
ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE public.applications
  ADD CONSTRAINT applications_status_check
  CHECK (status IN ('applied', 'selected', 'completed', 'confirmed', 'paid', 'rejected'));
