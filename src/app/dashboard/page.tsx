import { createClient } from '@/lib/supabase/server';
import { MissionCard } from '@/components/dashboard/MissionCard';
import { TierBadge } from '@/components/dashboard/TierBadge';
import { DashboardPagination } from '@/components/dashboard/DashboardPagination';
import { zhTW } from '@/messages/kol/zh-TW';

const PAGE_SIZE = 12;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params?.page ?? '1', 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from('profiles').select('full_name, tier').eq('id', user.id).single()
    : { data: null };

  const { data: campaigns, count } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact' })
    .eq('status', 'active')
    .order('deadline', { ascending: true })
    .range(from, to);

  const campaignIds = (campaigns ?? []).map((c) => c.id);
  const { data: applications } = campaignIds.length > 0
    ? await supabase
        .from('applications')
        .select('campaign_id, status')
        .in('campaign_id', campaignIds)
    : { data: [] as { campaign_id: string; status: string }[] };

  const counts = (applications ?? []).reduce(
    (acc, app) => {
      if (!acc[app.campaign_id]) {
        acc[app.campaign_id] = { applicants: 0, selected: 0 };
      }
      acc[app.campaign_id].applicants += 1;
      if (app.status === 'selected' || app.status === 'completed' || app.status === 'paid') {
        acc[app.campaign_id].selected += 1;
      }
      return acc;
    },
    {} as Record<string, { applicants: number; selected: number }>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-wider">
            {zhTW.dashboardTitle}
          </h1>
          <p className="text-white/60 text-sm mt-1 font-mono">
            {zhTW.dashboardDesc}
          </p>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            {profile?.full_name && (
              <span className="text-white/80 font-mono text-sm">{profile.full_name}</span>
            )}
            {profile?.tier ? (
              <TierBadge tier={profile.tier} size="md" />
            ) : (
              <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-mono text-white/50">
                {zhTW.tierUnassigned}
              </span>
            )}
          </div>
        )}
      </div>
      {!campaigns || campaigns.length === 0 ? (
        <div className="rounded border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-white/50 font-mono">{zhTW.noMissions}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {campaigns!.map((campaign, i) => (
              <MissionCard
                key={campaign.id}
                campaign={campaign}
                index={i}
                applicantsCount={counts[campaign.id]?.applicants ?? 0}
                selectedCount={counts[campaign.id]?.selected ?? 0}
              />
            ))}
          </div>
          <DashboardPagination
            page={page}
            totalPages={Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE))}
            totalItems={count ?? 0}
            pageSize={PAGE_SIZE}
          />
        </>
      )}
    </div>
  );
}
