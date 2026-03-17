'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Check, X, ExternalLink } from 'lucide-react';
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

type AppStatusFilter = 'applied' | 'selected' | 'rejected' | 'all';

const APP_STATUS_OPTIONS: { value: AppStatusFilter; label: string }[] = [
  { value: 'applied', label: '대기 중' },
  { value: 'selected', label: '선정됨' },
  { value: 'rejected', label: '거절됨' },
  { value: 'all', label: '전체' },
];

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function getAppStatusBadge(status: string) {
  switch (status) {
    case 'applied':
      return <span className="px-2 py-0.5 rounded text-xs font-mono bg-yellow-600/20 text-yellow-400">대기 중</span>;
    case 'selected':
      return <span className="px-2 py-0.5 rounded text-xs font-mono bg-green-600/20 text-green-400">선정됨</span>;
    case 'rejected':
      return <span className="px-2 py-0.5 rounded text-xs font-mono bg-red-600/20 text-red-400">거절됨</span>;
    case 'completed':
      return <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-600/20 text-blue-400">완료</span>;
    case 'confirmed':
      return <span className="px-2 py-0.5 rounded text-xs font-mono bg-purple-600/20 text-purple-400">정산 대기</span>;
    case 'paid':
      return <span className="px-2 py-0.5 rounded text-xs font-mono bg-emerald-600/20 text-emerald-400">지급 완료</span>;
    default:
      return <span className="px-2 py-0.5 rounded text-xs font-mono bg-white/10 text-white/60">{status}</span>;
  }
}

export function ApplicationReviewTab() {
  const [applications, setApplications] = useState<AppWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<AppStatusFilter>('applied');
  const supabase = createClient();

  const fetchApps = async (p: number, filter: AppStatusFilter) => {
    const from = (p - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    let query = supabase
      .from('applications')
      .select(
        `
        id, kol_id, campaign_id, status, applied_at,
        profile:profiles!kol_id(full_name, email, follower_count, tier, sns_link, sns_links),
        campaign:campaigns(title, brand_name)
      `,
        { count: 'exact' }
      );

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, count, error } = await query
      .order('applied_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    setApplications((data as unknown as AppWithProfile[]) ?? []);
    setTotalCount(count ?? 0);
  };

  useEffect(() => {
    setLoading(true);
    fetchApps(page, statusFilter)
      .catch((err) => {
        console.error('ApplicationReviewTab fetch error:', err);
        alert(`데이터 로드 실패: ${err?.message ?? String(err)}\n\nadmin_emails 테이블에 관리자 이메일이 등록되어 있는지 확인하세요.`);
      })
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  const handleFilterChange = (filter: AppStatusFilter) => {
    setStatusFilter(filter);
    setPage(1);
  };

  const refresh = () =>
    fetchApps(page, statusFilter)
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

  const handleReject = async (id: string, kolId: string, campaignTitle?: string) => {
    if (!confirm('정말로 이 지원을 거절하시겠습니까?')) return;
    
    const { error } = await supabase.from('applications').update({ status: 'rejected' }).eq('id', id);
    if (error) {
      alert(`거절 실패: ${error.message}\n\nadmin_emails 테이블에 관리자 이메일이 등록되어 있는지 확인하세요.`);
      return;
    }
    await createNotification(
      supabase,
      kolId,
      'mission_rejected',
      '任務申請未通過',
      campaignTitle ? `很抱歉，您申請的「${campaignTitle}」任務未通過審核。` : undefined
    );
    await refresh();
  };

  if (loading) return <p className="text-white/60 font-mono">로딩 중...</p>;

  const emptyMessages: Record<AppStatusFilter, string> = {
    applied: '검토 대기 중인 지원이 없습니다.',
    selected: '선정된 지원자가 없습니다.',
    rejected: '거절된 지원자가 없습니다.',
    all: '지원 내역이 없습니다.',
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {APP_STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleFilterChange(opt.value)}
            className={`px-3 py-1.5 rounded text-sm font-mono transition-colors ${
              statusFilter === opt.value
                ? 'bg-[#FF0000] text-white'
                : 'border border-white/10 text-white/70 hover:border-white/30'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-white/60 font-mono mb-4">
        {statusFilter === 'applied' && '지원을 검토한 후 [선정] 또는 [거절] 버튼을 클릭하세요. 선정된 KOL만 캠페인을 진행할 수 있습니다.'}
        {statusFilter === 'selected' && '선정된 KOL 목록입니다. 선정된 KOL은 미션을 진행할 수 있습니다.'}
        {statusFilter === 'rejected' && '거절된 지원 목록입니다.'}
        {statusFilter === 'all' && '모든 지원 내역을 확인할 수 있습니다.'}
      </p>

      {applications.length === 0 ? (
        <div className="rounded border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-white/50 font-mono">{emptyMessages[statusFilter]}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 font-mono text-white/80">미션</th>
                  <th className="text-left py-3 px-4 font-mono text-white/80">KOL</th>
                  <th className="text-left py-3 px-4 font-mono text-white/80">팔로워</th>
                  <th className="text-left py-3 px-4 font-mono text-white/80">티어</th>
                  <th className="text-left py-3 px-4 font-mono text-white/80">SNS URL</th>
                  <th className="text-left py-3 px-4 font-mono text-white/80">상태</th>
                  <th className="text-left py-3 px-4 font-mono text-white/80">지원일</th>
                  {statusFilter === 'applied' && (
                    <th className="text-right py-3 px-4 font-mono text-white/80">액션</th>
                  )}
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
                                  href={normalizeUrl(l.url)}
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
                      <td className="py-3 px-4 font-mono">
                        {getAppStatusBadge(app.status)}
                      </td>
                      <td className="py-3 px-4 font-mono text-white/60">
                        {new Date(app.applied_at).toLocaleDateString('ko-KR')}
                      </td>
                      {statusFilter === 'applied' && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleSelect(app.id, app.kol_id, c?.title)}
                              className="inline-flex items-center gap-1 rounded bg-[#FF0000] px-3 py-1.5 text-sm font-mono text-white hover:bg-[#cc0000]"
                            >
                              <Check className="w-4 h-4" />
                              선정
                            </button>
                            <button
                              onClick={() => handleReject(app.id, app.kol_id, c?.title)}
                              className="inline-flex items-center gap-1 rounded bg-white/10 px-3 py-1.5 text-sm font-mono text-white/80 hover:bg-white/20 border border-white/20"
                            >
                              <X className="w-4 h-4" />
                              거절
                            </button>
                          </div>
                        </td>
                      )}
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
        </>
      )}
    </div>
  );
}
