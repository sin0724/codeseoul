-- notifications 테이블 생성
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- RLS 활성화
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 알림만 조회/수정 가능
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- 관리자는 모든 알림 생성 가능 (서버 사이드에서 알림 생성)
CREATE POLICY "notifications_insert_for_admin"
  ON public.notifications FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_emails WHERE email = auth.jwt() ->> 'email')
  );

-- 실시간 기능 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
