'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Check, ExternalLink } from 'lucide-react';
import { createNotification } from '@/lib/codeseoul/notifications';
import { Pagination } from '@/components/ui/Pagination';

interface SnsLinkItem {
  label: string;
  url: string;
}

interface AppWithProfile {
  id: string;
  kol_id: string;
  campaign_id: string;
  status: string;
  applied_at: string;
  profile: {
    full_name: string | null;
    email: string;
    follower_count?: number | null;
    tier?: string | null;
    sns_link?: string | null;
    sns_links?: SnsLinkItem[];
  } | {
    full_name: string | null;
    email: string;
    follower_count?: number | null;
    tier?: string | null;
    sns_link?: string | null;
    sns_links?: SnsLinkItem[];
  }[] | null;
  campaign: { title: string; brand_name: string } | { title: string; brand_name: string }[] | null;
}

const PAGE_SIZE = 10;

export function ApplicationReviewTab() {
  const [applications, setApplications] = useState<AppWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const supabase = createClient();

  const fetchApps = async (p: number) => {
    const from = (p - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, count, error } = await supabase
      .from('applications')
      .select(
        `
        id, kol_id, campaign_id, status, applied_at,
        profile:profiles!kol_id(full_name, email, follower_count, tier, sns_link, sns_links),
        campaign:campaigns(title, brand_name)
      `,
        { count: 'exact' }
      )
      .eq('status', 'applied')
      .order('applied_at', { ascending: true })
      .range(from, to);
    if (error) throw error;
    setApplications((data as unknown as AppWithProfile[]) ?? []);
    setTotalCount(count ?? 0);
  };

  useEffect(() => {
    setLoading(true);
    fetchApps(page)
      .catch((err) => {
        console.error('ApplicationReviewTab fetch error:', err);
        alert(`데이터 로드 실패: ${err?.message ?? String(err)}\n\nadmin_emails 테이블에 관리자 이메일이 등록되어 있는지 확인하세요.`);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const refresh = () =>
    fetchApps(page)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

  const handleSelect = async (id: string, kolId: string, campaignTitle?: string) => {
    const { error } = await supabase.from('applications').update({ status: 'selected' }).eq('id', id);
    if (error) {
      alert(`선정 실패: ${error.message}\n\nadmin_emails 테이블에 관리자 이메일이 등록되어 있는지 확인하세요.`);
      return;
    }
    await createNotification(
      supabase,
      kolId,
      'mission_selected',
      '您已被選中參與任務',
      campaignTitle ? `您已被選中參與「${campaignTitle}」任務，請至「我的任務」查看詳情。` : undefined
    );
    await refresh();
  };

  if (loading) return <p className="text-white/60 font-mono">로딩 중...</p>;

  if (applications.length === 0) {
    return (
      <div className="rounded border border-white/10 bg-white/5 p-12 text-center">
        <p className="text-white/50 font-mono">검토 대기 중인 지원이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/60 font-mono mb-4">
        지원을 검토한 후 선정 시 [선정] 버튼을 클릭하세요. 선정된 KOL만 캠페인을 진행할 수 있습니다.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 font-mono text-white/80">미션</th>
              <th className="text-left py-3 px-4 font-mono text-white/80">KOL</th>
              <th className="text-left py-3 px-4 font-mono text-white/80">팔로워</th>
              <th className="text-left py-3 px-4 font-mono text-white/80">티어</th>
              <th className="text-left py-3 px-4 font-mono text-white/80">SNS URL</th>
              <th className="text-left py-3 px-4 font-mono text-white/80">지원일</th>
              <th className="text-right py-3 px-4 font-mono text-white/80">액션</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => {
              const p = Array.isArray(app.profile) ? app.profile[0] : app.profile;
              const c = Array.isArray(app.campaign) ? app.campaign[0] : app.campaign;
              return (
                <motion.tr
                  key={app.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="py-3 px-4 font-mono">
                    {c?.title} ({c?.brand_name})
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {p?.full_name ?? '-'} ({p?.email})
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {p?.follower_count != null
                      ? p.follower_count.toLocaleString()
                      : '-'}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className="text-[#FF0000]">{p?.tier ?? '-'}</span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {(() => {
                      const links = (p?.sns_links as SnsLinkItem[] | undefined) ?? [];
                      const fallback = p?.sns_link ? [{ label: 'SNS', url: p.sns_link }] : [];
                      const list = links.length > 0 ? links : fallback;
                      if (list.length === 0) return <span className="text-white/40">-</span>;
                      return (
                        <div className="flex flex-wrap gap-2">
                          {list.filter((l) => l.url?.trim()).map((l, i) => (
                            <a
                              key={i}
                              href={l.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#FF0000] hover:underline"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              {l.label || 'SNS'}
                            </a>
                          ))}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="py-3 px-4 font-mono text-white/60">
                    {new Date(app.applied_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleSelect(app.id, app.kol_id, c?.title)}
                      className="inline-flex items-center gap-1 rounded bg-[#FF0000] px-3 py-1.5 text-sm font-mono text-white hover:bg-[#cc0000]"
                    >
                      <Check className="w-4 h-4" />
                      선정
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        totalPages={Math.max(1, Math.ceil(totalCount / PAGE_SIZE))}
        onPageChange={setPage}
        totalItems={totalCount}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
