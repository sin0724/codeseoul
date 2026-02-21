'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Check, ExternalLink } from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';

interface CompletedItem {
  id: string;
  kol_id: string;
  campaign_id: string;
  status: string;
  result_url: string | null;
  applied_at: string;
  profile: { full_name: string | null } | { full_name: string | null }[] | null;
  campaign: {
    title: string;
    brand_name: string;
    payout_amount: number;
  } | {
    title: string;
    brand_name: string;
    payout_amount: number;
  }[] | null;
}

const PAGE_SIZE = 10;

export function CompletedReviewTab() {
  const [items, setItems] = useState<CompletedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const supabase = createClient();

  const fetchItems = async (p: number) => {
    const from = (p - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, count, error } = await supabase
      .from('applications')
      .select(
        `
        id, kol_id, campaign_id, status, result_url, applied_at,
        profile:profiles!kol_id(full_name),
        campaign:campaigns(title, brand_name, payout_amount)
      `,
        { count: 'exact' }
      )
      .eq('status', 'completed')
      .not('result_url', 'is', null)
      .order('applied_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    setItems((data ?? []) as CompletedItem[]);
    setTotalCount(count ?? 0);
  };

  useEffect(() => {
    setLoading(true);
    fetchItems(page)
      .catch((err) => {
        console.error('CompletedReviewTab fetch error:', err);
        alert(`데이터 로드 실패: ${err?.message ?? String(err)}`);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const refresh = () =>
    fetchItems(page)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

  const handleApprove = async (id: string) => {
    const { error } = await supabase.from('applications').update({ status: 'confirmed' }).eq('id', id);
    if (error) {
      alert(`정산 승인 실패: ${error.message}\n\nadmin_emails 테이블에 관리자 이메일이 등록되어 있는지 확인하세요.`);
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
        <p className="text-white/50 font-mono">검토 대기 중인 완료 게시글이 없습니다.</p>
        <p className="text-white/40 text-xs font-mono mt-2">KOL이 게시물 URL을 제출하면 이 목록에 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded border border-[#FF0000]/30 bg-[#FF0000]/5 px-4 py-3 font-mono text-sm mb-4">
        <p className="text-[#FF0000] font-medium">※ 안내</p>
        <p className="text-white/90 mt-1">게시글을 검토 후 광고주 컨펌을 받고 [정산 승인]하면 정산 큐로 이동합니다.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 font-mono text-white/80">브랜드명</th>
              <th className="text-left py-3 px-4 font-mono text-white/80">미션 제목</th>
              <th className="text-left py-3 px-4 font-mono text-white/80">KOL 이름</th>
              <th className="text-left py-3 px-4 font-mono text-white/80">게시글 링크</th>
              <th className="text-left py-3 px-4 font-mono text-white/80">정산금액</th>
              <th className="text-right py-3 px-4 font-mono text-white/80">액션</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const p = Array.isArray(item.profile) ? item.profile[0] : item.profile;
              const c = Array.isArray(item.campaign) ? item.campaign[0] : item.campaign;
              return (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="py-3 px-4 font-mono text-[#FF0000]">
                    {c?.brand_name ?? '-'}
                  </td>
                  <td className="py-3 px-4 font-mono">{c?.title ?? '-'}</td>
                  <td className="py-3 px-4 font-mono">{p?.full_name ?? '-'}</td>
                  <td className="py-3 px-4">
                    {item.result_url ? (
                      <a
                        href={item.result_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#FF0000] hover:underline font-mono text-xs max-w-[200px] truncate"
                      >
                        <ExternalLink className="w-4 h-4 shrink-0" />
                        {item.result_url}
                      </a>
                    ) : (
                      <span className="text-white/40">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {c?.payout_amount?.toLocaleString() ?? 0} TWD
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="rounded bg-[#FF0000] px-3 py-1.5 text-sm font-mono text-white hover:bg-[#cc0000] flex items-center gap-1 ml-auto"
                    >
                      <Check className="w-4 h-4" />
                      정산 승인
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
