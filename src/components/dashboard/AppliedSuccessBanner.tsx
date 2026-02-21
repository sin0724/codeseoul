'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { zhTW } from '@/messages/kol/zh-TW';

export function AppliedSuccessBanner() {
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (searchParams.get('applied') === '1') {
      setVisible(true);
      window.history.replaceState({}, '', '/dashboard/my-missions');
    }
  }, [searchParams]);

  if (!visible) return null;

  return (
    <div className="mb-6 rounded border border-[#FF0000]/30 bg-[#FF0000]/5 p-6 font-mono">
      <div className="flex gap-3">
        <Info className="w-5 h-5 text-[#FF0000] shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-white/90 font-medium mb-2">{zhTW.appliedBannerTitle}</p>
          <p className="text-white/70 mb-1">{zhTW.appliedBannerDesc}</p>
          <p className="text-white/70">
            入選者可於 <strong className="text-[#FF0000]">{zhTW.myMissions}</strong> 中查看。
          </p>
        </div>
      </div>
    </div>
  );
}
