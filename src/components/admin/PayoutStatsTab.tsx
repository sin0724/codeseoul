'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BarChart3 } from 'lucide-react';

interface PayoutRow {
  brand_name: string;
  year: number;
  month: number | null;
  total_amount: number;
  count: number;
}

export function PayoutStatsTab() {
  const [mode, setMode] = useState<'monthly' | 'yearly' | 'brand'>('monthly');
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<PayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSum, setTotalSum] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: paid, error } = await supabase
        .from('applications')
        .select('id, applied_at, campaign:campaigns(brand_name, payout_amount)')
        .eq('status', 'paid');

        if (error) throw error;

        type ItemType = { brand_name: string; year: number; month: number; amount: number };
        const items: ItemType[] = (paid ?? []).map((a: { applied_at: string; campaign?: { brand_name: string; payout_amount: number } | { brand_name: string; payout_amount: number }[] | null }) => {
          const c = Array.isArray(a.campaign) ? a.campaign[0] : a.campaign;
          const amt = c?.payout_amount ?? 0;
          const d = new Date(a.applied_at);
          return {
            brand_name: c?.brand_name ?? '-',
            year: d.getFullYear(),
            month: d.getMonth() + 1,
            amount: amt,
          };
        });

      if (mode === 'monthly') {
        const filtered = items.filter((i) => i.year === year);
        const byMonth = filtered.reduce(
          (acc, i) => {
            const k = i.month ?? 0;
            if (!acc[k]) acc[k] = { total: 0, count: 0 };
            acc[k].total += i.amount;
            acc[k].count += 1;
            return acc;
          },
          {} as Record<number, { total: number; count: number }>
        );
        const rows: PayoutRow[] = Array.from({ length: 12 }, (_, i) => i + 1).map((m) => ({
          brand_name: '-',
          year,
          month: m,
          total_amount: byMonth[m]?.total ?? 0,
          count: byMonth[m]?.count ?? 0,
        }));
        setData(rows);
        setTotalSum(filtered.reduce((s, i) => s + i.amount, 0));
      } else if (mode === 'yearly') {
        const byYear = items.reduce(
          (acc, i) => {
            const k = i.year;
            if (!acc[k]) acc[k] = { total: 0, count: 0 };
            acc[k].total += i.amount;
            acc[k].count += 1;
            return acc;
          },
          {} as Record<number, { total: number; count: number }>
        );
        const years = [...new Set(items.map((i) => i.year))].sort((a, b) => a - b);
        const rows: PayoutRow[] = years.map((y) => ({
          brand_name: '-',
          year: y,
          month: null,
          total_amount: byYear[y]?.total ?? 0,
          count: byYear[y]?.count ?? 0,
        }));
        setData(rows);
        setTotalSum(items.reduce((s, i) => s + i.amount, 0));
      } else {
        const byBrand = items.reduce(
          (acc, i) => {
            const k = i.brand_name;
            if (!acc[k]) acc[k] = { total: 0, count: 0 };
            acc[k].total += i.amount;
            acc[k].count += 1;
            return acc;
          },
          {} as Record<string, { total: number; count: number }>
        );
        const brands = Object.keys(byBrand).filter((b) => b !== '-');
        const rows: PayoutRow[] = brands.map((b) => ({
          brand_name: b,
          year: 0,
          month: null,
          total_amount: byBrand[b]?.total ?? 0,
          count: byBrand[b]?.count ?? 0,
        }));
        rows.sort((a, b) => b.total_amount - a.total_amount);
        setData(rows);
        setTotalSum(items.reduce((s, i) => s + i.amount, 0));
      }
      } catch (err) {
        console.error('PayoutStatsTab fetch error:', err);
        alert(`데이터 로드 실패: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData().catch((err) => {
      console.error('PayoutStatsTab fetch error:', err);
      alert(`데이터 로드 실패: ${err instanceof Error ? err.message : String(err)}`);
    }).finally(() => setLoading(false));
  }, [mode, year]);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          {(['monthly', 'yearly', 'brand'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
                mode === m
                  ? 'bg-[#FF0000] text-white'
                  : 'border border-white/10 text-white/70 hover:bg-white/5'
              }`}
            >
              {m === 'monthly' ? '월별' : m === 'yearly' ? '연도별' : '브랜드별'}
            </button>
          ))}
        </div>
        {mode === 'monthly' && (
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
            className="rounded border border-white/20 bg-black/50 px-3 py-2 font-mono text-white"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="rounded border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-[#FF0000]" />
          <span className="font-mono font-bold text-white">총 지급 완료 금액</span>
        </div>
        <p className="text-3xl font-mono font-bold text-[#FF0000]">
          {loading ? '...' : totalSum.toLocaleString()} TWD
        </p>
      </div>

      {loading ? (
        <p className="text-white/60 font-mono">로딩 중...</p>
      ) : data.length === 0 ? (
        <div className="rounded border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-white/50 font-mono">지급 완료된 정산 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded border border-white/10">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {mode === 'brand' && (
                  <th className="text-left py-3 px-4 font-mono text-white/80">브랜드</th>
                )}
                {mode === 'monthly' && (
                  <th className="text-left py-3 px-4 font-mono text-white/80">월</th>
                )}
                {mode === 'yearly' && (
                  <th className="text-left py-3 px-4 font-mono text-white/80">연도</th>
                )}
                <th className="text-right py-3 px-4 font-mono text-white/80">건수</th>
                <th className="text-right py-3 px-4 font-mono text-white/80">금액 (TWD)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  {mode === 'brand' && (
                    <td className="py-3 px-4 font-mono text-[#FF0000]">{row.brand_name}</td>
                  )}
                  {mode === 'monthly' && row.month && (
                    <td className="py-3 px-4 font-mono">{row.month}월</td>
                  )}
                  {mode === 'yearly' && (
                    <td className="py-3 px-4 font-mono">{row.year}년</td>
                  )}
                  <td className="py-3 px-4 font-mono text-right">{row.count}건</td>
                  <td className="py-3 px-4 font-mono text-right">
                    {row.total_amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
