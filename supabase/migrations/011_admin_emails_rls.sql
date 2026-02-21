-- admin_emails 테이블에 RLS 활성화 (Supabase Advisors 권장 사항)
-- 다른 테이블의 RLS 정책에서 admin_emails를 참조하므로
-- 인증된 사용자 전체에 SELECT를 허용해야 정책 평가가 정상 작동함

ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자는 admin_emails 조회 가능 (RLS 정책 서브쿼리 평가에 필요)
CREATE POLICY "admin_emails_select_for_authenticated"
  ON public.admin_emails FOR SELECT
  TO authenticated
  USING (true);

-- INSERT/UPDATE/DELETE는 정책 없음 = API로 수정 불가 (SQL Editor로만 관리)
