'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { createNotification } from '@/lib/codeseoul/notifications';
import { getTierInfo } from '@/lib/codeseoul/tier-program';
import { Pagination } from '@/components/ui/Pagination';
import type { ProgramTier } from '@/lib/codeseoul/types';

interface TierRequest {
  id: string;
  full_name: string | null;
  email: string;
  follower_count: number | null;
  tier: ProgramTier | null;
  tier_requested: ProgramTier | null;
  tier_requested_at: string | null;
}

const PAGE_SIZE = 10;

export function TierUpgradeTab() {
  const [items, setItems] = useState<TierRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const supabase = createClient();

  const fetchItems = async (p: number) => {
    const from = (p - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, count, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, follower_count, tier, tier_requested, tier_requested_at', { count: 'exact' })
      .not('tier_requested', 'is', null)
      .eq('status', 'approved')
      .order('tier_requested_at', { ascending: true })
      .range(from, to);
    if (error) throw error;
    setItems((data ?? []) as TierRequest[]);
    setTotalCount(count ?? 0);
  };

  useEffect(() => {
    setLoading(true);
    fetchItems(page)
      .catch((err) => {
        console.error('TierUpgradeTab fetch error:', err);
        alert(`데이터 로드 실패: ${err?.message ?? String(err)}`);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const refresh = () =>
    fetchItems(page)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

  const handleApprove = async (userId: string, requestedTier: ProgramTier) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        tier: requestedTier,
        tier_requested: null,
        tier_requested_at: null,
      })
      .eq('id', userId);
    if (error) {
      alert(`승급 승인 실패: ${error.message}\n\nadmin_emails 테이블에 관리자 이메일이 등록되어 있는지 확인하세요.`);
      return;
    }
    await createNotification(
      supabase,
      userId,
      'tier_approved',
      '等級已升級',
      `已升級至 ${requestedTier} 等級。`
    );
    await refresh();
  };

  const handleReject = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        tier_requested: null,
        tier_requested_at: null,
      })
      .eq('id', userId);
    if (error) {
      alert(`반려 실패: ${error.message}\n\nadmin_emails 테이블에 관리자 이메일이 등록되어 있는지 확인하세요.`);
      return;
    }
    await refresh();
  };

  if (loading) {
    return <p className="text-white/60 font-mono">로딩 중...</p>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded border border-white/10 bg-white/5 p-12 text-center">
        <p className="text-white/50 font-mono">승급 검토 대기 건이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded border border-[#FF0000]/30 bg-[#FF0000]/5 px-4 py-3 font-mono text-sm mb-4">
        <p className="text-[#FF0000] font-medium">※ 안내</p>
        <p className="text-white/90 mt-1">KOL의 팔로워 수와 요청 티어를 확인 후 승인 또는 반려해 주세요.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 font-mono text-white/80">KOL</th>
              <th className="text-left py-3 px-4 font-mono text-white/80">팔로워</th>
              <th className="text-left py-3 px-4 font-mono text-white/80">현재 티어</th>
              <th className="text-left py-3 px-4 font-mono text-white/80">요청 티어</th>
              <th className="text-left py-3 px-4 font-mono text-white/80">신청일</th>
              <th className="text-right py-3 px-4 font-mono text-white/80">액션</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const currentInfo = getTierInfo(item.tier);
              const requestedInfo = getTierInfo(item.tier_requested);
              return (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-mono">{item.full_name ?? '-'}</p>
                      <p className="text-xs text-white/50 font-mono">{item.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {item.follower_count != null
                      ? item.follower_count.toLocaleString()
                      : '-'}
                  </td>
                  <td className="py-3 px-4">
                    {currentInfo ? (
                      <span className="font-mono">{currentInfo.id}</span>
                    ) : (
                      <span className="text-white/50">미부여</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {requestedInfo ? (
                      <span className="font-mono text-[#FF0000]">{requestedInfo.id}</span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-white/60 text-xs">
                    {item.tier_requested_at
                      ? new Date(item.tier_requested_at).toLocaleDateString('ko-KR')
                      : '-'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleApprove(item.id, item.tier_requested!)}
                        className="flex items-center gap-1 rounded bg-green-600/80 px-2 py-1.5 text-xs font-mono text-white hover:bg-green-600"
                      >
                        <Check className="w-4 h-4" />
                        승인
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        className="flex items-center gap-1 rounded border border-white/20 px-2 py-1.5 text-xs font-mono text-white/70 hover:bg-white/10"
                      >
                        <X className="w-4 h-4" />
                        반려
                      </button>
                    </div>
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
