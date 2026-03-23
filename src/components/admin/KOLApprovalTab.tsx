'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Check, X, ExternalLink, Pencil, Search } from 'lucide-react';
import type { Profile, ProgramTier } from '@/lib/codeseoul/types';
import { createNotification } from '@/lib/codeseoul/notifications';
import { Pagination } from '@/components/ui/Pagination';
import { PROGRAM_TIERS } from '@/lib/codeseoul/tier-program';

const PAGE_SIZE = 10;

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

type StatusFilter = 'pending' | 'approved' | 'rejected' | 'all';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'pending', label: '대기 중' },
  { value: 'approved', label: '승인됨' },
  { value: 'rejected', label: '거절됨' },
  { value: 'all', label: '전체' },
];

interface EditFormData {
  full_name: string;
  follower_count: string;
  tier: ProgramTier | '';
  line_id: string;
  kakao_id: string;
}

export function KOLApprovalTab() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<ProgramTier | ''>('');
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({ full_name: '', follower_count: '', tier: '', line_id: '', kakao_id: '' });
  const [editSaving, setEditSaving] = useState(false);
  const supabase = createClient();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 400);
  }, []);

  const fetchData = async (p: number, filter: StatusFilter, search: string, tier: ProgramTier | '') => {
    const from = (p - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });
    
    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    if (search.trim()) {
      query = query.or(`email.ilike.%${search.trim()}%,full_name.ilike.%${search.trim()}%`);
    }

    if (tier) {
      query = query.eq('tier', tier);
    }
    
    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) {
      console.error('Profiles fetch error:', error);
      throw new Error(`${error.message} (code: ${error.code})`);
    }
    setProfiles(data ?? []);
    setTotalCount(count ?? 0);
  };

  useEffect(() => {
    setLoading(true);
    fetchData(page, statusFilter, debouncedSearch, tierFilter)
      .catch((err) => {
        console.error('KOLApprovalTab fetch error:', err);
        alert(`데이터 로드 실패: ${err instanceof Error ? err.message : String(err)}`);
      })
      .finally(() => setLoading(false));
  }, [page, statusFilter, debouncedSearch, tierFilter]);

  const handleFilterChange = (filter: StatusFilter) => {
    setStatusFilter(filter);
    setPage(1);
  };

  const handleTierFilterChange = (tier: ProgramTier | '') => {
    setTierFilter(tier);
    setPage(1);
  };

  const openEditModal = (profile: Profile) => {
    setEditingProfile(profile);
    setEditForm({
      full_name: profile.full_name ?? '',
      follower_count: (profile as { follower_count?: number }).follower_count?.toString() ?? '',
      tier: ((profile as { tier?: ProgramTier }).tier as ProgramTier) ?? '',
      line_id: (profile as { line_id?: string }).line_id ?? '',
      kakao_id: (profile as { kakao_id?: string }).kakao_id ?? '',
    });
  };

  const handleEditSave = async () => {
    if (!editingProfile) return;
    setEditSaving(true);

    try {
      const followerNum = editForm.follower_count.trim() ? parseInt(editForm.follower_count.replace(/[^0-9]/g, ''), 10) : null;
      const updateData: Record<string, unknown> = {
        full_name: editForm.full_name.trim() || null,
        follower_count: isNaN(followerNum as number) ? null : followerNum,
        tier: editForm.tier || null,
        line_id: editForm.line_id.trim() || null,
        kakao_id: editForm.kakao_id.trim() || null,
      };

      const { error, data } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', editingProfile.id)
        .select();

      if (error) {
        alert(`수정 실패: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        alert('수정 실패: 업데이트된 행이 없습니다. RLS 정책을 확인하세요.');
        return;
      }

      setProfiles(prev => prev.map(p => p.id === editingProfile.id ? { ...p, ...updateData } as Profile : p));
      setEditingProfile(null);
    } catch (err) {
      alert(`수정 실패: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setEditSaving(false);
    }
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
            href={normalizeUrl(l.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#E11D48] hover:underline text-xs"
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
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleFilterChange(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              statusFilter === opt.value
                ? 'bg-[#E11D48] text-white shadow-sm shadow-[#E11D48]/20'
                : 'border border-white/[0.08] bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white/80'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="이메일 또는 이름으로 검색..."
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] pl-9 pr-4 py-2 font-mono text-sm text-white placeholder:text-white/30 focus:border-[#E11D48]/50 focus:outline-none focus:ring-1 focus:ring-[#E11D48]/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setDebouncedSearch(''); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <select
          value={tierFilter}
          onChange={(e) => handleTierFilterChange(e.target.value as ProgramTier | '')}
          className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 font-mono text-sm text-white focus:border-[#E11D48]/50 focus:outline-none focus:ring-1 focus:ring-[#E11D48]/20 transition-all"
        >
          <option value="">전체 티어</option>
          {PROGRAM_TIERS.map((t) => (
            <option key={t.id} value={t.id}>{t.id}</option>
          ))}
        </select>
        {(debouncedSearch || tierFilter) && (
          <span className="text-xs text-white/40 font-mono">
            {totalCount}건
          </span>
        )}
      </div>

      {profiles.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
          <p className="text-white/40 font-mono text-sm">
            {(debouncedSearch || tierFilter) ? (
              '검색 결과가 없습니다.'
            ) : (
              <>
                {statusFilter === 'pending' && '대기 중인 KOL이 없습니다.'}
                {statusFilter === 'approved' && '승인된 KOL이 없습니다.'}
                {statusFilter === 'rejected' && '거절된 KOL이 없습니다.'}
                {statusFilter === 'all' && '등록된 KOL이 없습니다.'}
              </>
            )}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="text-left py-3 px-4 font-mono text-xs text-white/40 uppercase tracking-wider">이메일</th>
                  <th className="text-left py-3 px-4 font-mono text-xs text-white/40 uppercase tracking-wider">이름</th>
                  <th className="text-left py-3 px-4 font-mono text-xs text-white/40 uppercase tracking-wider">팔로워</th>
                  <th className="text-left py-3 px-4 font-mono text-xs text-white/40 uppercase tracking-wider">티어</th>
                  <th className="text-left py-3 px-4 font-mono text-xs text-white/40 uppercase tracking-wider">SNS</th>
                  <th className="text-left py-3 px-4 font-mono text-xs text-white/40 uppercase tracking-wider">상태</th>
                  <th className="text-left py-3 px-4 font-mono text-xs text-white/40 uppercase tracking-wider">신청일</th>
                  <th className="text-right py-3 px-4 font-mono text-xs text-white/40 uppercase tracking-wider">액션</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 px-4 font-mono text-sm text-white/80">{p.email}</td>
                    <td className="py-3 px-4 font-mono text-sm">{p.full_name ?? '-'}</td>
                    <td className="py-3 px-4 font-mono text-sm text-white/70">
                      {(p as { follower_count?: number }).follower_count?.toLocaleString() ?? '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-sm font-bold text-[#E11D48]">
                      {(p as { tier?: string }).tier ?? '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-sm">{renderSnsLinks(p)}</td>
                    <td className="py-3 px-4 font-mono text-sm">{getStatusBadge(p.status)}</td>
                    <td className="py-3 px-4 font-mono text-sm text-white/40">{new Date(p.created_at).toLocaleDateString('ko-KR')}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-xs font-mono text-white/70 hover:bg-white/[0.08] hover:text-white transition-all"
                        >
                          <Pencil className="w-3 h-3" />
                          수정
                        </button>
                        {statusFilter === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(p.id)}
                              disabled={processingId !== null}
                              className="inline-flex items-center gap-1 rounded-lg bg-green-600/20 border border-green-600/30 px-2.5 py-1.5 text-xs font-mono text-green-400 hover:bg-green-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                              {processingId === p.id ? (
                                <span className="w-3 h-3 border border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                              {processingId === p.id ? '처리중' : '승인'}
                            </button>
                            <button
                              onClick={() => handleReject(p.id)}
                              disabled={processingId !== null}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#E11D48]/10 border border-[#E11D48]/30 px-2.5 py-1.5 text-xs font-mono text-[#E11D48] hover:bg-[#E11D48]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                              {processingId === p.id ? (
                                <span className="w-3 h-3 border border-[#E11D48]/30 border-t-[#E11D48] rounded-full animate-spin" />
                              ) : (
                                <X className="w-3 h-3" />
                              )}
                              {processingId === p.id ? '처리중' : '거절'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={Math.max(1, Math.ceil(totalCount / PAGE_SIZE))} onPageChange={setPage} totalItems={totalCount} pageSize={PAGE_SIZE} />
        </>
      )}

      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="relative w-full max-w-lg bg-[#0c0c0c] border border-white/[0.08] rounded-2xl shadow-2xl">
            <button
              onClick={() => setEditingProfile(null)}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 space-y-4">
              <div className="pb-2 border-b border-white/[0.06]">
                <h2 className="text-base font-bold font-mono text-white">KOL 정보 수정</h2>
                <p className="text-xs text-white/40 font-mono mt-0.5">{editingProfile.email}</p>
              </div>

              <div>
                <label className="block text-xs font-mono text-white/50 mb-1.5 uppercase tracking-wider">이름</label>
                <input
                  value={editForm.full_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 font-mono text-sm text-white focus:border-[#E11D48]/50 focus:outline-none focus:ring-1 focus:ring-[#E11D48]/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/50 mb-1.5 uppercase tracking-wider">팔로워 수</label>
                <input
                  value={editForm.follower_count}
                  onChange={(e) => setEditForm(prev => ({ ...prev, follower_count: e.target.value }))}
                  placeholder="예: 10000"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 font-mono text-sm text-white placeholder:text-white/30 focus:border-[#E11D48]/50 focus:outline-none focus:ring-1 focus:ring-[#E11D48]/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/50 mb-1.5 uppercase tracking-wider">티어</label>
                <select
                  value={editForm.tier}
                  onChange={(e) => setEditForm(prev => ({ ...prev, tier: e.target.value as ProgramTier | '' }))}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 font-mono text-sm text-white focus:border-[#E11D48]/50 focus:outline-none focus:ring-1 focus:ring-[#E11D48]/20 transition-all"
                >
                  <option value="">미지정</option>
                  {PROGRAM_TIERS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id} ({t.min.toLocaleString()} ~ {t.max === Infinity ? '∞' : t.max.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-mono text-white/50 mb-1.5 uppercase tracking-wider">LINE ID</label>
                  <input
                    value={editForm.line_id}
                    onChange={(e) => setEditForm(prev => ({ ...prev, line_id: e.target.value }))}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 font-mono text-sm text-white focus:border-[#E11D48]/50 focus:outline-none focus:ring-1 focus:ring-[#E11D48]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-white/50 mb-1.5 uppercase tracking-wider">KakaoTalk ID</label>
                  <input
                    value={editForm.kakao_id}
                    onChange={(e) => setEditForm(prev => ({ ...prev, kakao_id: e.target.value }))}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 font-mono text-sm text-white focus:border-[#E11D48]/50 focus:outline-none focus:ring-1 focus:ring-[#E11D48]/20 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditingProfile(null)}
                  className="flex-1 rounded-lg border border-white/[0.08] px-4 py-2 font-mono text-sm text-white/50 hover:bg-white/[0.04] transition-all"
                >
                  취소
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={editSaving}
                  className="flex-1 rounded-lg bg-[#E11D48] px-4 py-2 font-mono text-sm font-bold text-white hover:bg-[#BE123C] disabled:opacity-50 transition-all"
                >
                  {editSaving ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
