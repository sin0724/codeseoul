'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Users, UserCheck, CheckCircle } from 'lucide-react';
import type { Agent, Profile, Application, Campaign } from '@/lib/codeseoul/types';
import { Pagination } from '@/components/ui/Pagination';
import { CopyButton } from '@/components/ui/CopyButton';

const PAGE_SIZE = 10;

interface AgentStats {
  agent: Agent;
  totalKols: number;
  approvedKols: number;
  completedMissions: number;
}

interface KolWithApplications extends Profile {
  applications?: (Application & { campaign?: Campaign })[];
}

export function AgentPerformanceTab() {
  const [stats, setStats] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);
  const [expandedKols, setExpandedKols] = useState<KolWithApplications[]>([]);
  const [kolsLoading, setKolsLoading] = useState(false);
  const [expandedKolId, setExpandedKolId] = useState<string | null>(null);
  
  const supabase = createClient();

  const fetchData = async (p: number) => {
    const from = (p - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    
    const { data: agents, count, error } = await supabase
      .from('agents')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    if (!agents) return;
    
    const statsData: AgentStats[] = await Promise.all(
      agents.map(async (agent) => {
        const { count: totalKols } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('agent_id', agent.id);
        
        const { count: approvedKols } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('agent_id', agent.id)
          .eq('status', 'approved');
        
        const { data: kolIds } = await supabase
          .from('profiles')
          .select('id')
          .eq('agent_id', agent.id);
        
        let completedMissions = 0;
        if (kolIds && kolIds.length > 0) {
          const { count } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .in('kol_id', kolIds.map(k => k.id))
            .eq('status', 'completed');
          completedMissions = count ?? 0;
        }
        
        return {
          agent,
          totalKols: totalKols ?? 0,
          approvedKols: approvedKols ?? 0,
          completedMissions,
        };
      })
    );
    
    setStats(statsData);
    setTotalCount(count ?? 0);
  };

  useEffect(() => {
    setLoading(true);
    fetchData(page)
      .catch((err) => alert(`데이터 로드 실패: ${err.message}`))
      .finally(() => setLoading(false));
  }, [page]);

  const toggleExpand = async (agentId: string) => {
    if (expandedAgentId === agentId) {
      setExpandedAgentId(null);
      setExpandedKols([]);
      setExpandedKolId(null);
      return;
    }
    
    setExpandedAgentId(agentId);
    setExpandedKolId(null);
    setKolsLoading(true);
    
    try {
      const { data: kols } = await supabase
        .from('profiles')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });
      
      if (kols) {
        const kolsWithApps = await Promise.all(
          kols.map(async (kol) => {
            const { data: apps } = await supabase
              .from('applications')
              .select('*, campaign:campaigns(*)')
              .eq('kol_id', kol.id)
              .eq('status', 'completed');
            
            return { ...kol, applications: apps ?? [] } as KolWithApplications;
          })
        );
        setExpandedKols(kolsWithApps);
      }
    } catch (err) {
      console.error('KOL fetch error:', err);
    } finally {
      setKolsLoading(false);
    }
  };

  const toggleKolExpand = (kolId: string) => {
    setExpandedKolId(expandedKolId === kolId ? null : kolId);
  };

  const totals = stats.reduce(
    (acc, s) => ({
      totalKols: acc.totalKols + s.totalKols,
      approvedKols: acc.approvedKols + s.approvedKols,
      completedMissions: acc.completedMissions + s.completedMissions,
    }),
    { totalKols: 0, approvedKols: 0, completedMissions: 0 }
  );

  if (loading) return <p className="text-white/60 font-mono">로딩 중...</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-mono font-bold">에이전트 실적</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-white/60 text-sm font-mono mb-2">
            <Users className="w-4 h-4" />
            총 가입 KOL
          </div>
          <p className="text-2xl font-mono font-bold">{totals.totalKols}</p>
        </div>
        <div className="rounded border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-white/60 text-sm font-mono mb-2">
            <UserCheck className="w-4 h-4" />
            승인 KOL
          </div>
          <p className="text-2xl font-mono font-bold text-green-400">{totals.approvedKols}</p>
        </div>
        <div className="rounded border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-white/60 text-sm font-mono mb-2">
            <CheckCircle className="w-4 h-4" />
            완료 미션
          </div>
          <p className="text-2xl font-mono font-bold text-[#FF0000]">{totals.completedMissions}</p>
        </div>
      </div>

      {stats.length === 0 ? (
        <div className="rounded border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-white/50 font-mono">등록된 에이전트가 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 font-mono text-sm text-white/80">에이전트</th>
                  <th className="text-left py-3 px-4 font-mono text-sm text-white/80">코드</th>
                  <th className="text-center py-3 px-4 font-mono text-sm text-white/80">가입 KOL</th>
                  <th className="text-center py-3 px-4 font-mono text-sm text-white/80">승인 KOL</th>
                  <th className="text-center py-3 px-4 font-mono text-sm text-white/80">완료 미션</th>
                  <th className="text-center py-3 px-4 font-mono text-sm text-white/80">상세</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s) => (
                  <>
                    <motion.tr
                      key={s.agent.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`border-b border-white/5 hover:bg-white/5 cursor-pointer ${
                        expandedAgentId === s.agent.id ? 'bg-white/5' : ''
                      }`}
                      onClick={() => toggleExpand(s.agent.id)}
                    >
                      <td className="py-3 px-4 font-mono text-sm">
                        <div className="flex items-center gap-2">
                          {s.agent.name}
                          {s.agent.status === 'inactive' && (
                            <span className="px-1.5 py-0.5 rounded text-xs bg-gray-600/20 text-gray-400">
                              비활성
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-[#FF0000] font-bold">{s.agent.agent_code}</span>
                          <CopyButton text={s.agent.agent_code} />
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm text-center">{s.totalKols}</td>
                      <td className="py-3 px-4 font-mono text-sm text-center text-green-400">
                        {s.approvedKols}
                      </td>
                      <td className="py-3 px-4 font-mono text-sm text-center text-[#FF0000]">
                        {s.completedMissions}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {expandedAgentId === s.agent.id ? (
                          <ChevronUp className="w-4 h-4 inline text-white/60" />
                        ) : (
                          <ChevronDown className="w-4 h-4 inline text-white/60" />
                        )}
                      </td>
                    </motion.tr>
                    
                    <AnimatePresence>
                      {expandedAgentId === s.agent.id && (
                        <motion.tr
                          key={`${s.agent.id}-expanded`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <td colSpan={6} className="p-0">
                            <div className="bg-white/[0.02] border-t border-white/5 p-4">
                              {kolsLoading ? (
                                <p className="text-white/50 font-mono text-sm">로딩 중...</p>
                              ) : expandedKols.length === 0 ? (
                                <p className="text-white/50 font-mono text-sm">
                                  이 에이전트로 가입한 KOL이 없습니다.
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  <p className="text-white/60 font-mono text-xs mb-3">
                                    {s.agent.agent_code}로 가입한 KOL 목록
                                  </p>
                                  {expandedKols.map((kol) => (
                                    <div
                                      key={kol.id}
                                      className="border border-white/10 rounded bg-black/20"
                                    >
                                      <div
                                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleKolExpand(kol.id);
                                        }}
                                      >
                                        <div className="flex items-center gap-4">
                                          <span className="font-mono text-sm">{kol.full_name ?? kol.email}</span>
                                          <span className="text-white/40 font-mono text-xs">{kol.email}</span>
                                          <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                                            kol.status === 'approved'
                                              ? 'bg-green-600/20 text-green-400'
                                              : kol.status === 'rejected'
                                              ? 'bg-red-600/20 text-red-400'
                                              : 'bg-yellow-600/20 text-yellow-400'
                                          }`}>
                                            {kol.status === 'approved' ? '승인' : kol.status === 'rejected' ? '거절' : '대기'}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                          <span className="font-mono text-xs text-white/40">
                                            완료 미션: <span className="text-[#FF0000]">{kol.applications?.length ?? 0}</span>
                                          </span>
                                          {(kol.applications?.length ?? 0) > 0 && (
                                            expandedKolId === kol.id ? (
                                              <ChevronUp className="w-4 h-4 text-white/40" />
                                            ) : (
                                              <ChevronDown className="w-4 h-4 text-white/40" />
                                            )
                                          )}
                                        </div>
                                      </div>
                                      
                                      <AnimatePresence>
                                        {expandedKolId === kol.id && kol.applications && kol.applications.length > 0 && (
                                          <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="border-t border-white/5 p-3 bg-black/30"
                                          >
                                            <p className="text-white/50 font-mono text-xs mb-2">완료된 미션 목록:</p>
                                            <div className="space-y-1">
                                              {kol.applications.map((app) => (
                                                <div
                                                  key={app.id}
                                                  className="flex items-center justify-between text-xs font-mono py-1 px-2 rounded bg-white/5"
                                                >
                                                  <div className="flex items-center gap-3">
                                                    <span className="text-white/80">
                                                      {app.campaign?.title ?? '알 수 없는 미션'}
                                                    </span>
                                                    <span className="text-white/40">
                                                      {app.campaign?.brand_name}
                                                    </span>
                                                  </div>
                                                  {app.result_url && (
                                                    <a
                                                      href={app.result_url}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="text-[#FF0000] hover:underline"
                                                      onClick={(e) => e.stopPropagation()}
                                                    >
                                                      결과물 보기
                                                    </a>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </>
                ))}
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
        </>
      )}
    </div>
  );
}
