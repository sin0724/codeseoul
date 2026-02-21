-- 알림 테이블 (KOL용 사이트 내 알림)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- KOL은 자신의 알림만 조회/수정
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin은 알림 생성 (admin_emails 테이블에 관리자 이메일 등록 필요)
CREATE POLICY "notifications_insert_for_admin"
  ON public.notifications FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_emails a WHERE a.email = (auth.jwt() ->> 'email'))
  );
