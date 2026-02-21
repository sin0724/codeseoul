import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PayoutHistoryList } from '@/components/dashboard/PayoutHistoryList';
import { zhTW } from '@/messages/kol/zh-TW';

export default async function PayoutHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: paidApplications } = await supabase
    .from('applications')
    .select(
      `
      id,
      applied_at,
      campaign:campaigns(title, brand_name, payout_amount)
    `
    )
    .eq('kol_id', user.id)
    .eq('status', 'paid')
    .order('applied_at', { ascending: false });

  const totalPaid =
    (paidApplications ?? []).reduce((sum, app) => {
      const c = Array.isArray(app.campaign) ? app.campaign[0] : app.campaign;
      return sum + (c?.payout_amount ?? 0);
    }, 0) ?? 0;

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
      <PayoutHistoryList items={paidApplications ?? []} />
    </div>
  );
}
