'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Check, X, ExternalLink } from 'lucide-react';
import type { Profile } from '@/lib/codeseoul/types';
import { createNotification } from '@/lib/codeseoul/notifications';
import { Pagination } from '@/components/ui/Pagination';

const PAGE_SIZE = 10;

type StatusFilter = 'pending' | 'approved' | 'rejected' | 'all';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'pending', label: '대기 중' },
  { value: 'approved', label: '승인됨' },
  { value: 'rejected', label: '거절됨' },
  { value: 'all', label: '전체' },
];

export function KOLApprovalTab() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const supabase = createClient();

  const fetchData = async (p: number, filter: StatusFilter) => {
    const from = (p - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current admin user:', user?.email);
    
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });
    
    if (filter !== 'all') {
      query = query.eq('status', filter);
    }
    
    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);
    
    console.log('Profiles fetch result:', { data, count, error });
    
    if (error) {
      console.error('Profiles fetch error:', error);
      throw new Error(`${error.message} (code: ${error.code})`);
    }
    setProfiles(data ?? []);
    setTotalCount(count ?? 0);
  };

  useEffect(() => {
    setLoading(true);
    fetchData(page, statusFilter)
      .catch((err) => {
        console.error('KOLApprovalTab fetch error:', err);
        alert(`데이터 로드 실패: ${err instanceof Error ? err.message : String(err)}`);
      })
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  const handleFilterChange = (filter: StatusFilter) => {
    setStatusFilter(filter);
    setPage(1);
  };

  const handleApprove = async (id: string) => {
    if (processingId) return;
    setProcessingId(id);
    
    try {
      const { error, data, count } = await supabase
        .from('profiles')
        .update({ status: 'approved' })
        .eq('id', id)
        .select();
      
      console.log('Approve result:', { error, data, count, id });
      
      if (error) {
        alert(`승인 실패: ${error.message}`);
        return;
      }
      
      if (!data || data.length === 0) {
        alert('승인 실패: 업데이트된 행이 없습니다. RLS 정책을 확인하세요.');
        return;
      }
      
      setProfiles(prev => prev.filter(p => p.id !== id));
      setTotalCount(prev => Math.max(0, prev - 1));
      
      try {
        await createNotification(supabase, id, 'kol_approved', '註冊已通過審核', '現在您可以申請任務了。');
      } catch (notifErr) {
        console.warn('Notification failed:', notifErr);
      }
    } catch (err) {
      alert(`승인 실패: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (processingId) return;
    setProcessingId(id);
    
    try {
      const { error, data, count } = await supabase
        .from('profiles')
        .update({ status: 'rejected' })
        .eq('id', id)
        .select();
      
      console.log('Reject result:', { error, data, count, id });
      
      if (error) {
        alert(`거절 실패: ${error.message}`);
        return;
      }
      
      if (!data || data.length === 0) {
        alert('거절 실패: 업데이트된 행이 없습니다. RLS 정책을 확인하세요.');
        return;
      }
      
      setProfiles(prev => prev.filter(p => p.id !== id));
      setTotalCount(prev => Math.max(0, prev - 1));
      
      try {
        await createNotification(supabase, id, 'kol_rejected', '註冊審核未通過', '如有疑問，請與我們聯繫。');
      } catch (notifErr) {
        console.warn('Notification failed:', notifErr);
      }
    } catch (err) {
      alert(`거절 실패: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-0.5 rounded text-xs font-mono bg-green-600/20 text-green-400">승인됨</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded text-xs font-mono bg-red-600/20 text-red-400">거절됨</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-mono bg-yellow-600/20 text-yellow-400">대기 중</span>;
    }
  };

  const renderSnsLinks = (profile: Profile) => {
    const links = (profile as { sns_links?: { label: string; url: string }[] }).sns_links ?? [];
    const fallback = profile.sns_link ? [{ label: 'SNS', url: profile.sns_link }] : [];
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
            className="inline-flex items-center gap-1 text-[#FF0000] hover:underline text-xs"
          >
            <ExternalLink className="w-3 h-3" />
            {l.label || 'SNS'}
          </a>
        ))}
      </div>
    );
  };

  if (loading) return <p className="text-white/60 font-mono">로딩 중...</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
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

      {profiles.length === 0 ? (
        <div className="rounded border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-white/50 font-mono">
            {statusFilter === 'pending' && '대기 중인 KOL이 없습니다.'}
            {statusFilter === 'approved' && '승인된 KOL이 없습니다.'}
            {statusFilter === 'rejected' && '거절된 KOL이 없습니다.'}
            {statusFilter === 'all' && '등록된 KOL이 없습니다.'}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 font-mono text-sm text-white/80">이메일</th>
                  <th className="text-left py-3 px-4 font-mono text-sm text-white/80">이름</th>
                  <th className="text-left py-3 px-4 font-mono text-sm text-white/80">팔로워</th>
                  <th className="text-left py-3 px-4 font-mono text-sm text-white/80">티어</th>
                  <th className="text-left py-3 px-4 font-mono text-sm text-white/80">SNS</th>
                  <th className="text-left py-3 px-4 font-mono text-sm text-white/80">상태</th>
                  <th className="text-left py-3 px-4 font-mono text-sm text-white/80">신청일</th>
                  {statusFilter === 'pending' && (
                    <th className="text-right py-3 px-4 font-mono text-sm text-white/80">액션</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 font-mono text-sm">{p.email}</td>
                    <td className="py-3 px-4 font-mono text-sm">{p.full_name ?? '-'}</td>
                    <td className="py-3 px-4 font-mono text-sm">
                      {(p as { follower_count?: number }).follower_count?.toLocaleString() ?? '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-sm text-[#FF0000]">
                      {(p as { tier?: string }).tier ?? '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-sm">{renderSnsLinks(p)}</td>
                    <td className="py-3 px-4 font-mono text-sm">{getStatusBadge(p.status)}</td>
                    <td className="py-3 px-4 font-mono text-sm text-white/60">{new Date(p.created_at).toLocaleDateString('ko-KR')}</td>
                    {statusFilter === 'pending' && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleApprove(p.id)} 
                            disabled={processingId !== null}
                            className="inline-flex items-center gap-1 rounded bg-green-600/80 px-3 py-1.5 text-sm font-mono text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingId === p.id ? (
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            {processingId === p.id ? '처리중...' : '승인'}
                          </button>
                          <button 
                            onClick={() => handleReject(p.id)} 
                            disabled={processingId !== null}
                            className="inline-flex items-center gap-1 rounded bg-[#FF0000]/80 px-3 py-1.5 text-sm font-mono text-white hover:bg-[#FF0000] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingId === p.id ? (
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            {processingId === p.id ? '처리중...' : '거절'}
                          </button>
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={Math.max(1, Math.ceil(totalCount / PAGE_SIZE))} onPageChange={setPage} totalItems={totalCount} pageSize={PAGE_SIZE} />
        </>
      )}
    </div>
  );
}
