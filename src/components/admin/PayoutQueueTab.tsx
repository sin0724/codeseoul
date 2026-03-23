'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CopyButton } from '@/components/ui/CopyButton';
import { createNotification } from '@/lib/codeseoul/notifications';
import { motion } from 'framer-motion';
import { Pagination } from '@/components/ui/Pagination';

interface ProfileData {
  full_name: string | null;
  bank_info: {
    beneficiary_name?: string;
    address_english?: string;
    phone_number?: string;
    bank_name?: string;
    swift_code?: string;
    bank_address?: string;
    account_number?: string;
    iban?: string;
    // 하위 호환
    account_holder?: string;
  };
}

interface PayoutItem {
  id: string;
  kol_id: string;
  campaign_id: string;
  status: string;
  result_url: string | null;
  profile: ProfileData | ProfileData[] | null;
  campaign: {
    payout_amount: number;
    brand_name: string;
    title: string;
  } | {
    payout_amount: number;
    brand_name: string;
    title: string;
  }[] | null;
}

const PAGE_SIZE = 10;

export function PayoutQueueTab() {
  const [items, setItems] = useState<PayoutItem[]>([]);
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
        id,
        kol_id,
        campaign_id,
        status,
        result_url,
        profile:profiles!kol_id(full_name, bank_info),
        campaign:campaigns(payout_amount, brand_name, title)
      `,
        { count: 'exact' }
      )
      .eq('status', 'confirmed')
      .order('applied_at', { ascending: true })
      .range(from, to);
    if (error) throw error;
    setItems(((data ?? []) as PayoutItem[]));
    setTotalCount(count ?? 0);
  };

  useEffect(() => {
    setLoading(true);
    fetchItems(page)
      .catch((err) => {
        console.error('PayoutQueueTab fetch error:', err);
        alert(`데이터 로드 실패: ${err?.message ?? String(err)}`);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const refresh = () =>
    fetchItems(page)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

  const handlePaid = async (id: string, kolId: string, amount: number, brandName?: string) => {
    const { error } = await supabase.from('applications').update({ status: 'paid' }).eq('id', id);
    if (error) {
      alert(`지급 완료 처리 실패: ${error.message}\n\nadmin_emails 테이블에 관리자 이메일이 등록되어 있는지 확인하세요.`);
      return;
    }
    await createNotification(
      supabase,
      kolId,
      'payout_completed',
      '款項已匯出',
      brandName ? `${brandName} ${amount.toLocaleString()} TWD 已完成撥款` : `${amount.toLocaleString()} TWD 已完成撥款`
    );
    await refresh();
  };

  if (loading) {
    return <p className="text-white/60 font-mono">로딩 중...</p>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
        <p className="text-white/40 font-mono text-sm">정산 대기 중인 건이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/[0.06] bg-white/[0.02]">
            <th className="text-left py-3 px-4 font-mono text-xs text-white/40 uppercase tracking-wider">브랜드명</th>
            <th className="text-left py-3 px-4 font-mono text-xs text-white/40 uppercase tracking-wider">게시글</th>
            <th className="text-left py-3 px-4 font-mono text-xs text-white/40 uppercase tracking-wider">KOL</th>
            <th className="text-left py-3 px-4 font-mono text-xs text-white/40 uppercase tracking-wider">수취인</th>
            <th className="text-left py-3 px-4 font-mono text-xs text-white/40 uppercase tracking-wider">영문주소</th>
            <th className="text-left py-3 px-4 font-mono text-xs text-white/40 uppercase tracking-wider">전화</th>
            <th className="text-left py-3 px-4 font-mono text-xs text-white/40 uppercase tracking-wider">은행</th>
            <th className="text-left py-3 px-4 font-mono text-xs text-white/40 uppercase tracking-wider">SWIFT</th>
            <th className="text-left py-3 px-4 font-mono text-xs text-white/40 uppercase tracking-wider">은행주소</th>
            <th className="text-left py-3 px-4 font-mono text-xs text-white/40 uppercase tracking-wider">계좌번호</th>
            <th className="text-left py-3 px-4 font-mono text-xs text-white/40 uppercase tracking-wider">IBAN</th>
            <th className="text-left py-3 px-4 font-mono text-xs text-white/40 uppercase tracking-wider">금액</th>
            <th className="text-right py-3 px-4 font-mono text-xs text-white/40 uppercase tracking-wider">액션</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const p = Array.isArray(item.profile) ? item.profile[0] : item.profile;
            const c = Array.isArray(item.campaign) ? item.campaign[0] : item.campaign;
            const bank = p?.bank_info ?? {};
            const beneficiary = bank.beneficiary_name ?? bank.account_holder ?? '-';
            const amount = c?.payout_amount ?? 0;
            return (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors"
              >
                <td className="py-3 px-4 font-mono font-bold text-[#E11D48]">
                  {c?.brand_name ?? '-'}
                </td>
                <td className="py-3 px-4 max-w-[160px] overflow-hidden align-top">
                  {item.result_url ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={item.result_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-[#E11D48] hover:underline whitespace-nowrap shrink-0"
                        title={item.result_url}
                      >
                        링크 열기
                      </a>
                      <CopyButton text={item.result_url} label="복사" className="!text-xs shrink-0" />
                    </div>
                  ) : (
                    <span className="text-white/30">-</span>
                  )}
                </td>
                <td className="py-3 px-4 font-mono text-white/80">
                  {p?.full_name ?? '-'}
                </td>
                <td className="py-3 px-4 font-mono text-white/80">{beneficiary}</td>
                <td className="py-3 px-4 font-mono text-xs text-white/60">{bank.address_english || '-'}</td>
                <td className="py-3 px-4 font-mono text-xs text-white/60">{bank.phone_number || '-'}</td>
                <td className="py-3 px-4 font-mono text-white/80">{bank.bank_name || '-'}</td>
                <td className="py-3 px-4 font-mono text-white/80">{bank.swift_code || '-'}</td>
                <td className="py-3 px-4 font-mono text-xs text-white/60">{bank.bank_address || '-'}</td>
                <td className="py-3 px-4 font-mono text-white/80">{bank.account_number || '-'}</td>
                <td className="py-3 px-4 font-mono text-xs text-white/60">{bank.iban || '-'}</td>
                <td className="py-3 px-4 font-mono font-bold">{amount.toLocaleString()} TWD</td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handlePaid(item.id, item.kol_id, amount, c?.brand_name)}
                    className="rounded-lg bg-green-600/20 border border-green-600/30 px-3 py-1.5 text-xs font-mono text-green-400 hover:bg-green-600/30 transition-all"
                  >
                    지급 완료
                  </button>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
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
