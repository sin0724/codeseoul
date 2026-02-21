'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PayoutHistoryList } from '@/components/dashboard/PayoutHistoryList';
import { zhTW } from '@/messages/kol/zh-TW';

interface PaidApplication {
  id: string;
  applied_at: string;
  campaign: { title: string; brand_name: string; payout_amount: number } | { title: string; brand_name: string; payout_amount: number }[];
}

export default function PayoutHistoryPage() {
  const [paidApplications, setPaidApplications] = useState<PaidApplication[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('applications')
        .select(`
          id,
          applied_at,
          campaign:campaigns(title, brand_name, payout_amount)
        `)
        .eq('kol_id', user.id)
        .eq('status', 'paid')
        .order('applied_at', { ascending: false });

      const apps = (data ?? []) as PaidApplication[];
      setPaidApplications(apps);
      
      const total = apps.reduce((sum, app) => {
        const c = Array.isArray(app.campaign) ? app.campaign[0] : app.campaign;
        return sum + (c?.payout_amount ?? 0);
      }, 0);
      setTotalPaid(total);
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
        {zhTW.payoutTitle}
      </h1>
      <p className="text-white/60 text-sm mb-4 font-mono">
        {zhTW.payoutDesc}
      </p>
      <div className="rounded border border-white/10 bg-white/5 p-6 mb-6">
        <p className="text-sm font-mono text-white/70">{zhTW.totalPaid}</p>
        <p className="text-2xl font-mono font-bold text-[#FF0000] mt-1">
          {totalPaid.toLocaleString()} TWD
        </p>
      </div>
      <PayoutHistoryList items={paidApplications} />
    </div>
  );
}
