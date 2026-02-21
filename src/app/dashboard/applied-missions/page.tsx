import { createClient } from '@/lib/supabase/server';
import { MyMissionsList } from '@/components/dashboard/MyMissionsList';
import { zhTW } from '@/messages/kol/zh-TW';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AppliedMissionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      campaign:campaigns(*)
    `)
    .eq('kol_id', user.id)
    .order('applied_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 font-mono tracking-wider">
        {zhTW.appliedMissions}
      </h1>
      <p className="text-white/60 text-sm mb-6 font-mono">
        包含已申請與入選任務的全覽。入選者請至「我的任務」查看聯絡方式並完成貼文提交。
      </p>
      <MyMissionsList applications={applications ?? []} emptyMessage={zhTW.noApplications} />
    </div>
  );
}
