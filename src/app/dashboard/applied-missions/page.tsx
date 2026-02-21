'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MyMissionsList } from '@/components/dashboard/MyMissionsList';
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

export default function AppliedMissionsPage() {
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
        {zhTW.appliedMissions}
      </h1>
      <p className="text-white/60 text-sm mb-6 font-mono">
        包含已申請與入選任務的全覽。入選者請至「我的任務」查看聯絡方式並完成貼文提交。
      </p>
      <MyMissionsList applications={applications} emptyMessage={zhTW.noApplications} />
    </div>
  );
}
