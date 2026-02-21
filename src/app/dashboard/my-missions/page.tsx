import { createClient } from '@/lib/supabase/server';
import { MyMissionsList } from '@/components/dashboard/MyMissionsList';
import { AppliedSuccessBanner } from '@/components/dashboard/AppliedSuccessBanner';
import { zhTW } from '@/messages/kol/zh-TW';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default async function MyMissionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      campaign:campaigns(*)
    `)
    .eq('kol_id', user.id)
    .in('status', ['selected', 'completed', 'confirmed', 'paid'])
    .order('applied_at', { ascending: false });

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
      <Suspense fallback={null}>
        <AppliedSuccessBanner />
      </Suspense>
      <MyMissionsList applications={applications ?? []} />
    </div>
  );
}
