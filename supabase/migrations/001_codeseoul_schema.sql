-- codeseoul: Database schema and RLS policies
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  sns_link TEXT,
  bank_info JSONB DEFAULT '{"bank_name":"","account_number":"","account_holder":""}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  guide_content TEXT,
  guide_url TEXT,
  contact_line TEXT,
  contact_kakao TEXT,
  payout_amount INTEGER NOT NULL DEFAULT 0,
  recruitment_quota INTEGER,
  brand_image_url TEXT,
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kol_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'selected', 'completed', 'paid')),
  result_url TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(kol_id, campaign_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_applications_kol_id ON public.applications(kol_id);
CREATE INDEX IF NOT EXISTS idx_applications_campaign_id ON public.applications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);

-- Admin emails table (add your admin email: INSERT INTO admin_emails VALUES ('admin@yourdomain.com');)
CREATE TABLE IF NOT EXISTS public.admin_emails (
  email TEXT PRIMARY KEY
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: profiles
-- Users can read their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin can read all profiles
CREATE POLICY "profiles_select_all_for_admin"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admin_emails WHERE email = auth.jwt() ->> 'email')
    OR auth.uid() = id
  );

-- Admin can update any profile (for approval)
CREATE POLICY "profiles_update_for_admin"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admin_emails WHERE email = auth.jwt() ->> 'email')
    OR auth.uid() = id
  );

-- Allow insert on signup (trigger will handle)
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies: campaigns
-- Approved KOLs see active campaigns, Admin sees all
CREATE POLICY "campaigns_select"
  ON public.campaigns FOR SELECT
  USING (
    (status = 'active' AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.status = 'approved'))
    OR EXISTS (SELECT 1 FROM public.admin_emails WHERE email = auth.jwt() ->> 'email')
  );

-- Admin can insert/update/delete campaigns
CREATE POLICY "campaigns_admin_modify"
  ON public.campaigns FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_emails WHERE email = auth.jwt() ->> 'email'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_emails WHERE email = auth.jwt() ->> 'email'));

-- RLS Policies: applications
-- KOL can read own applications
CREATE POLICY "applications_select_own"
  ON public.applications FOR SELECT
  USING (auth.uid() = kol_id);

-- KOL can insert own application
CREATE POLICY "applications_insert_own"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = kol_id);

-- KOL can update own application (result_url, etc.)
CREATE POLICY "applications_update_own"
  ON public.applications FOR UPDATE
  USING (auth.uid() = kol_id);

-- Admin can read/update all applications
CREATE POLICY "applications_all_for_admin"
  ON public.applications FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_emails WHERE email = auth.jwt() ->> 'email'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_emails WHERE email = auth.jwt() ->> 'email'));

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, status)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'pending');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
