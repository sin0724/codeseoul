'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MyMissionsList } from '@/components/dashboard/MyMissionsList';
import { AppliedSuccessBanner } from '@/components/dashboard/AppliedSuccessBanner';
import { zhTW } from '@/messages/kol/zh-TW';
import type { Application } from '@/lib/codeseoul/types';

interface AppWithCampaign extends Omit<Application, 'campaign'> {
  campaign?: {
    id: string;
    title: string;
    brand_name: string;
    payout_amount: number;
    guide_url?: string | null;
    guide_content?: string | null;
    contact_line?: string | null;
    contact_kakao?: string | null;
  };
}

export default function MyMissionsPage() {
  const [applications, setApplications] = useState<AppWithCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('applications')
        .select(`
          *,
          campaign:campaigns(*)
        `)
        .eq('kol_id', user.id)
        .in('status', ['selected', 'completed', 'confirmed', 'paid'])
        .order('applied_at', { ascending: false });

      setApplications(data ?? []);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 font-mono tracking-wider">
        {zhTW.myMissions}
      </h1>
      <p className="text-white/60 text-sm mb-4 font-mono">
        入選任務列表及進度查詢。
      </p>
      <div className="rounded border border-[#FF0000]/30 bg-[#FF0000]/5 px-4 py-3 mb-8 font-mono text-sm">
        <p className="text-[#FF0000] font-medium">※ 注意事項</p>
        <p className="text-white/90 mt-1">入選者請務必以各品牌聯絡方式<strong>與承辦人聯繫</strong>。</p>
      </div>
      <AppliedSuccessBanner />
      <MyMissionsList applications={applications} />
    </div>
  );
}
