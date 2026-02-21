'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { KOLApprovalTab } from '@/components/admin/KOLApprovalTab';
import { MissionManagerTab } from '@/components/admin/MissionManagerTab';
import { ApplicationReviewTab } from '@/components/admin/ApplicationReviewTab';
import { PayoutQueueTab } from '@/components/admin/PayoutQueueTab';
import { CompletedReviewTab } from '@/components/admin/CompletedReviewTab';
import { TierUpgradeTab } from '@/components/admin/TierUpgradeTab';
import { PayoutStatsTab } from '@/components/admin/PayoutStatsTab';
import { Users, Target, Banknote, UserCheck, FileCheck, Award, BarChart3 } from 'lucide-react';

const tabs = [
  { id: 'kol', label: 'KOL 승인 관리', icon: Users },
  { id: 'mission', label: '미션 매니저', icon: Target },
  { id: 'applications', label: '지원자 관리', icon: UserCheck },
  { id: 'completed', label: '완료 게시글 검토', icon: FileCheck },
  { id: 'payout', label: '정산 큐', icon: Banknote },
  { id: 'payout-stats', label: '정산 통계', icon: BarChart3 },
  { id: 'tier', label: '티어 승급 검수', icon: Award },
];

export default function AdminCodeseoulPage() {
  const [activeTab, setActiveTab] = useState('kol');

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-mono tracking-wider">
          codeseoul Admin
        </h1>
        <p className="text-white/60 text-sm mt-1 font-mono">
          관리자 전용 대시보드
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4 mb-8">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded font-mono text-sm transition-colors ${
              activeTab === id
                ? 'bg-[#FF0000] text-white'
                : 'border border-white/10 hover:border-[#FF0000]/50 text-white/80'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'kol' && <KOLApprovalTab />}
      {activeTab === 'mission' && <MissionManagerTab />}
      {activeTab === 'applications' && <ApplicationReviewTab />}
      {activeTab === 'completed' && <CompletedReviewTab />}
      {activeTab === 'payout' && <PayoutQueueTab />}
      {activeTab === 'payout-stats' && <PayoutStatsTab />}
      {activeTab === 'tier' && <TierUpgradeTab />}
    </AdminLayout>
  );
}
