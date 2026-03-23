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
import { AgentManagementTab } from '@/components/admin/AgentManagementTab';
import { AgentPerformanceTab } from '@/components/admin/AgentPerformanceTab';
import { Users, Target, Banknote, UserCheck, FileCheck, Award, BarChart3, UserPlus, TrendingUp } from 'lucide-react';

const tabs = [
  { id: 'kol', label: 'KOL 승인 관리', icon: Users },
  { id: 'mission', label: '미션 매니저', icon: Target },
  { id: 'applications', label: '지원자 관리', icon: UserCheck },
  { id: 'completed', label: '완료 게시글 검토', icon: FileCheck },
  { id: 'payout', label: '정산 큐', icon: Banknote },
  { id: 'payout-stats', label: '정산 통계', icon: BarChart3 },
  { id: 'tier', label: '티어 승급 검수', icon: Award },
  { id: 'agents', label: '에이전트 관리', icon: UserPlus },
  { id: 'agent-stats', label: '에이전트 실적', icon: TrendingUp },
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

      <div className="flex flex-wrap gap-2 border-b border-white/[0.06] pb-4 mb-8">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm transition-all ${
              activeTab === id
                ? 'bg-[#E11D48] text-white shadow-sm shadow-[#E11D48]/20'
                : 'border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-[#E11D48]/30 text-white/60 hover:text-white/90'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
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
      {activeTab === 'agents' && <AgentManagementTab />}
      {activeTab === 'agent-stats' && <AgentPerformanceTab />}
    </AdminLayout>
  );
}
