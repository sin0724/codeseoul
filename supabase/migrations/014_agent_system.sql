-- Agent System: 에이전트 관리 및 추천 코드 시스템
-- Run this in Supabase SQL Editor

-- 에이전트 테이블
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  agent_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_agents_code ON public.agents(agent_code);
CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents(status);

-- profiles 테이블에 에이전트 관련 컬럼 추가
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.agents(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS agent_code_used TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_at TIMESTAMPTZ;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_profiles_agent_id ON public.profiles(agent_id);

-- RLS 활성화
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- 에이전트 테이블 RLS 정책: 관리자만 모든 작업 가능
CREATE POLICY "agents_admin_select"
  ON public.agents FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.admin_emails WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "agents_admin_insert"
  ON public.agents FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_emails WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "agents_admin_update"
  ON public.agents FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.admin_emails WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "agents_admin_delete"
  ON public.agents FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.admin_emails WHERE email = auth.jwt() ->> 'email'));

-- 에이전트 코드 검증용 정책 (회원가입 시 코드 유효성 확인용 - 익명 접근 허용)
CREATE POLICY "agents_public_check_code"
  ON public.agents FOR SELECT
  USING (status = 'active');

-- handle_new_user 함수 수정: 에이전트 코드 처리 추가
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_agent_id UUID;
  v_agent_code TEXT;
BEGIN
  -- 메타데이터에서 에이전트 코드 추출
  v_agent_code := NEW.raw_user_meta_data->>'agent_code';
  
  -- 에이전트 코드가 있으면 에이전트 ID 조회
  IF v_agent_code IS NOT NULL AND v_agent_code != '' THEN
    SELECT id INTO v_agent_id
    FROM public.agents
    WHERE agent_code = v_agent_code AND status = 'active';
  END IF;
  
  -- 프로필 생성
  INSERT INTO public.profiles (id, email, full_name, status, agent_id, agent_code_used, referred_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'pending',
    v_agent_id,
    CASE WHEN v_agent_id IS NOT NULL THEN v_agent_code ELSE NULL END,
    CASE WHEN v_agent_id IS NOT NULL THEN NOW() ELSE NULL END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기존 트리거 재생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 에이전트 코드 생성 함수 (AGTA1B2 형식)
CREATE OR REPLACE FUNCTION public.generate_agent_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  code TEXT := 'AGT';
  i INT;
BEGIN
  FOR i IN 1..6 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;
