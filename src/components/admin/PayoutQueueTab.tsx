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
      <div className="rounded border border-white/10 bg-white/5 p-12 text-center">
        <p className="text-white/50 font-mono">정산 대기 중인 건이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-4 font-mono text-white/80">브랜드명</th>
            <th className="text-left py-3 px-4 font-mono text-white/80">게시글 링크</th>
            <th className="text-left py-3 px-4 font-mono text-white/80">KOL 이름</th>
            <th className="text-left py-3 px-4 font-mono text-white/80">수취인 영문</th>
            <th className="text-left py-3 px-4 font-mono text-white/80">영문주소</th>
            <th className="text-left py-3 px-4 font-mono text-white/80">전화번호</th>
            <th className="text-left py-3 px-4 font-mono text-white/80">은행 영문 명칭</th>
            <th className="text-left py-3 px-4 font-mono text-white/80">SWIFT (BIC)</th>
            <th className="text-left py-3 px-4 font-mono text-white/80">은행 주소</th>
            <th className="text-left py-3 px-4 font-mono text-white/80">계좌번호</th>
            <th className="text-left py-3 px-4 font-mono text-white/80">IBAN</th>
            <th className="text-left py-3 px-4 font-mono text-white/80">정산금액</th>
            <th className="text-right py-3 px-4 font-mono text-white/80">액션</th>
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
                className="border-b border-white/5 hover:bg-white/5"
              >
                <td className="py-3 px-4 font-mono text-[#FF0000]">
                  {c?.brand_name ?? '-'}
                </td>
                <td className="py-3 px-4 max-w-[160px] overflow-hidden align-top">
                  {item.result_url ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={item.result_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-[#FF0000] hover:underline whitespace-nowrap shrink-0"
                        title={item.result_url}
                      >
                        링크 열기
                      </a>
                      <CopyButton text={item.result_url} label="복사" className="!text-xs shrink-0" />
                    </div>
                  ) : (
                    <span className="text-white/40">-</span>
                  )}
                </td>
                <td className="py-3 px-4 font-mono">
                  {p?.full_name ?? '-'}
                </td>
                <td className="py-3 px-4 font-mono">{beneficiary}</td>
                <td className="py-3 px-4 font-mono text-xs">{bank.address_english || '-'}</td>
                <td className="py-3 px-4 font-mono text-xs">{bank.phone_number || '-'}</td>
                <td className="py-3 px-4 font-mono">{bank.bank_name || '-'}</td>
                <td className="py-3 px-4 font-mono">{bank.swift_code || '-'}</td>
                <td className="py-3 px-4 font-mono text-xs">{bank.bank_address || '-'}</td>
                <td className="py-3 px-4 font-mono">{bank.account_number || '-'}</td>
                <td className="py-3 px-4 font-mono text-xs">{bank.iban || '-'}</td>
                <td className="py-3 px-4 font-mono">{amount.toLocaleString()} TWD</td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handlePaid(item.id, item.kol_id, amount, c?.brand_name)}
                    className="rounded bg-green-600/80 px-3 py-1.5 text-sm font-mono text-white hover:bg-green-600"
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
