'use client';

import { zhTW } from '@/messages/kol/zh-TW';

interface CampaignData {
  title: string;
  brand_name: string;
  payout_amount: number;
}

interface PayoutItem {
  id: string;
  applied_at: string;
  campaign: CampaignData | CampaignData[] | null;
}

interface PayoutHistoryListProps {
  items: PayoutItem[];
}

export function PayoutHistoryList({ items }: PayoutHistoryListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded border border-white/10 bg-white/5 p-12 text-center">
        <p className="text-white/50 font-mono">아직 지급 완료된 정산 내역이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded border border-white/10">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            <th className="text-left py-3 px-4 font-mono text-white/80">{zhTW.payoutDate}</th>
            <th className="text-left py-3 px-4 font-mono text-white/80">{zhTW.brand}</th>
            <th className="text-left py-3 px-4 font-mono text-white/80">{zhTW.missionTitle}</th>
            <th className="text-right py-3 px-4 font-mono text-white/80">{zhTW.amount} (TWD)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const c = Array.isArray(item.campaign) ? item.campaign[0] : item.campaign;
            return (
              <tr
                key={item.id}
                className="border-b border-white/5 hover:bg-white/5"
              >
                <td className="py-3 px-4 font-mono text-white/80">
                  {new Date(item.applied_at).toLocaleDateString('zh-TW')}
                </td>
                <td className="py-3 px-4 font-mono text-[#FF0000]">
                  {c?.brand_name ?? '-'}
                </td>
                <td className="py-3 px-4 font-mono">{c?.title ?? '-'}</td>
                <td className="py-3 px-4 font-mono text-right">
                  {(c?.payout_amount ?? 0).toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
