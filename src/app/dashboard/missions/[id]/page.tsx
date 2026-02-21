import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { MissionDetailClient } from '@/components/dashboard/MissionDetailClient';
import { zhTW } from '@/messages/kol/zh-TW';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MissionDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .eq('status', 'active')
    .single();

  if (!campaign) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  let alreadyApplied = false;
  let isSelected = false;
  let profileFollowerCount: number | null = null;
  if (user) {
    const [{ data: app }, { data: profile }] = await Promise.all([
      supabase
        .from('applications')
        .select('id, status')
        .eq('kol_id', user.id)
        .eq('campaign_id', id)
        .single(),
      supabase.from('profiles').select('follower_count').eq('id', user.id).single(),
    ]);
    alreadyApplied = !!app;
    isSelected = !!app && ['selected', 'completed', 'confirmed', 'paid'].includes(app.status);
    profileFollowerCount = (profile as { follower_count?: number })?.follower_count ?? null;
  }

  const { data: apps } = await supabase
    .from('applications')
    .select('status')
    .eq('campaign_id', id);
  const applicantsCount = apps?.length ?? 0;
  const selectedCount = apps?.filter((a) => ['selected', 'completed', 'paid'].includes(a.status)).length ?? 0;

  return (
    <div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-6 font-mono"
      >
        <ArrowLeft className="w-4 h-4" />
        {zhTW.backToList}
      </Link>
      <MissionDetailClient
        campaign={campaign}
        alreadyApplied={alreadyApplied}
        isSelected={isSelected}
        applicantsCount={applicantsCount}
        selectedCount={selectedCount}
        profileFollowerCount={profileFollowerCount}
      />
    </div>
  );
}
