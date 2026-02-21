'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { MissionDetailClient } from '@/components/dashboard/MissionDetailClient';
import { zhTW } from '@/messages/kol/zh-TW';
import type { Campaign } from '@/lib/codeseoul/types';

export default function MissionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [applicantsCount, setApplicantsCount] = useState(0);
  const [selectedCount, setSelectedCount] = useState(0);
  const [profileFollowerCount, setProfileFollowerCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      const { data: campaignData } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (!campaignData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setCampaign(campaignData as Campaign);

      const { data: { user } } = await supabase.auth.getUser();
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
        setAlreadyApplied(!!app);
        setIsSelected(!!app && ['selected', 'completed', 'confirmed', 'paid'].includes(app.status));
        setProfileFollowerCount((profile as { follower_count?: number })?.follower_count ?? null);
      }

      const { data: apps } = await supabase
        .from('applications')
        .select('status')
        .eq('campaign_id', id);
      setApplicantsCount(apps?.length ?? 0);
      setSelectedCount(apps?.filter((a) => ['selected', 'completed', 'paid'].includes(a.status)).length ?? 0);

      setLoading(false);
    };

    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-white/50 font-mono">{zhTW.noMissions}</p>
        <Link href="/dashboard" className="text-[#FF0000] hover:underline mt-4 inline-block font-mono">
          {zhTW.backToList}
        </Link>
      </div>
    );
  }

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
