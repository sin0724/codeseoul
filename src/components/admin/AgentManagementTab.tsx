'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Plus, Copy, Power, Pencil, X, Check } from 'lucide-react';
import type { Agent } from '@/lib/codeseoul/types';
import { Pagination } from '@/components/ui/Pagination';
import { CopyButton } from '@/components/ui/CopyButton';

const PAGE_SIZE = 10;

function generateAgentCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'AGT';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function AgentManagementTab() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  const supabase = createClient();

  const fetchData = async (p: number) => {
    const from = (p - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    
    const { data, count, error } = await supabase
      .from('agents')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) {
      console.error('Agents fetch error:', error);
      throw error;
    }
    
    setAgents(data ?? []);
    setTotalCount(count ?? 0);
  };

  useEffect(() => {
    setLoading(true);
    fetchData(page)
      .catch((err) => alert(`데이터 로드 실패: ${err.message}`))
      .finally(() => setLoading(false));
  }, [page]);

  const openAddModal = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormCode(generateAgentCode());
    setFormError(null);
    setEditingAgent(null);
    setShowAddModal(true);
  };

  const openEditModal = (agent: Agent) => {
    setFormName(agent.name);
    setFormEmail(agent.email ?? '');
    setFormPhone(agent.phone ?? '');
    setFormCode(agent.agent_code);
    setFormError(null);
    setEditingAgent(agent);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingAgent(null);
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      setFormError('이름을 입력하세요');
      return;
    }
    if (!formCode.trim()) {
      setFormError('에이전트 코드가 필요합니다');
      return;
    }
    
    setFormLoading(true);
    setFormError(null);
    
    try {
      if (editingAgent) {
        const { error } = await supabase
          .from('agents')
          .update({
            name: formName.trim(),
            email: formEmail.trim() || null,
            phone: formPhone.trim() || null,
          })
          .eq('id', editingAgent.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('agents')
          .insert({
            name: formName.trim(),
            email: formEmail.trim() || null,
            phone: formPhone.trim() || null,
            agent_code: formCode.toUpperCase().trim(),
            status: 'active',
          });
        
        if (error) {
          if (error.code === '23505') {
            setFormError('이미 존재하는 에이전트 코드입니다. 다시 생성해주세요.');
            setFormCode(generateAgentCode());
            return;
          }
          throw error;
        }
      }
      
      closeModal();
      await fetchData(page);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '저장 실패');
    } finally {
      setFormLoading(false);
    }
  };

  const toggleStatus = async (agent: Agent) => {
    if (processingId) return;
    setProcessingId(agent.id);
    
    const newStatus = agent.status === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await supabase
        .from('agents')
        .update({ status: newStatus })
        .eq('id', agent.id);
      
      if (error) throw error;
      
      setAgents(prev => prev.map(a => 
        a.id === agent.id ? { ...a, status: newStatus } : a
      ));
    } catch (err) {
      alert(`상태 변경 실패: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <p className="text-white/60 font-mono">로딩 중...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-mono font-bold">에이전트 관리</h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 rounded bg-[#FF0000] text-white font-mono text-sm hover:bg-[#cc0000] transition-colors"
        >
          <Plus className="w-4 h-4" />
          에이전트 등록
        </button>
      </div>

      {agents.length === 0 ? (
        <div className="rounded border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-white/50 font-mono">등록된 에이전트가 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 font-mono text-sm text-white/80">이름</th>
                  <th className="text-left py-3 px-4 font-mono text-sm text-white/80">코드</th>
                  <th className="text-left py-3 px-4 font-mono text-sm text-white/80">이메일</th>
                  <th className="text-left py-3 px-4 font-mono text-sm text-white/80">연락처</th>
                  <th className="text-left py-3 px-4 font-mono text-sm text-white/80">상태</th>
                  <th className="text-left py-3 px-4 font-mono text-sm text-white/80">등록일</th>
                  <th className="text-right py-3 px-4 font-mono text-sm text-white/80">액션</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <motion.tr
                    key={agent.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="py-3 px-4 font-mono text-sm">{agent.name}</td>
                    <td className="py-3 px-4 font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[#FF0000] font-bold">{agent.agent_code}</span>
                        <CopyButton text={agent.agent_code} />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-sm text-white/60">{agent.email ?? '-'}</td>
                    <td className="py-3 px-4 font-mono text-sm text-white/60">{agent.phone ?? '-'}</td>
                    <td className="py-3 px-4 font-mono text-sm">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        agent.status === 'active' 
                          ? 'bg-green-600/20 text-green-400' 
                          : 'bg-gray-600/20 text-gray-400'
                      }`}>
                        {agent.status === 'active' ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-sm text-white/60">
                      {new Date(agent.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(agent)}
                          className="p-2 rounded border border-white/10 hover:border-white/30 text-white/70 hover:text-white transition-colors"
                          title="수정"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus(agent)}
                          disabled={processingId !== null}
                          className={`p-2 rounded border transition-colors ${
                            agent.status === 'active'
                              ? 'border-yellow-500/30 hover:border-yellow-500 text-yellow-500'
                              : 'border-green-500/30 hover:border-green-500 text-green-500'
                          } disabled:opacity-50`}
                          title={agent.status === 'active' ? '비활성화' : '활성화'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-mono font-bold">
                {editingAgent ? '에이전트 수정' : '에이전트 등록'}
              </h3>
              <button onClick={closeModal} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-white/80 mb-2">
                  이름 <span className="text-[#FF0000]">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white focus:border-[#FF0000] focus:outline-none"
                  placeholder="에이전트 이름"
                />
              </div>

              <div>
                <label className="block text-sm font-mono text-white/80 mb-2">
                  에이전트 코드
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formCode}
                    readOnly
                    className="flex-1 rounded border border-white/20 bg-black/30 px-4 py-2 font-mono text-[#FF0000] font-bold cursor-not-allowed"
                  />
                  {!editingAgent && (
                    <button
                      type="button"
                      onClick={() => setFormCode(generateAgentCode())}
                      className="px-3 py-2 rounded border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-mono text-sm transition-colors"
                    >
                      재생성
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-mono text-white/80 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white focus:border-[#FF0000] focus:outline-none"
                  placeholder="agent@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-mono text-white/80 mb-2">
                  연락처
                </label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white focus:border-[#FF0000] focus:outline-none"
                  placeholder="010-0000-0000"
                />
              </div>

              {formError && (
                <p className="text-sm text-[#FF0000] font-mono">{formError}</p>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded border border-white/20 text-white/70 hover:text-white font-mono text-sm transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={formLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-[#FF0000] text-white font-mono text-sm hover:bg-[#cc0000] disabled:opacity-50 transition-colors"
                >
                  {formLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {formLoading ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
