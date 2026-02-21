'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { Profile } from '@/lib/codeseoul/types';
import { createNotification } from '@/lib/codeseoul/notifications';
import { Pagination } from '@/components/ui/Pagination';

const PAGE_SIZE = 10;

export function KOLApprovalTab() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const supabase = createClient();

  const fetchData = async (p: number) => {
    const from = (p - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    setProfiles(data ?? []);
    setTotalCount(count ?? 0);
  };

  useEffect(() => {
    setLoading(true);
    fetchData(page)
      .catch((err) => {
        console.error('KOLApprovalTab fetch error:', err);
        alert(`데이터 로드 실패: ${err instanceof Error ? err.message : String(err)}`);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const handleApprove = async (id: string) => {
    if (processingId) return;
    setProcessingId(id);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'approved' })
        .eq('id', id);
      
      if (error) {
        alert(`승인 실패: ${error.message}`);
        return;
      }
      
      setProfiles(prev => prev.filter(p => p.id !== id));
      setTotalCount(prev => Math.max(0, prev - 1));
      
      await createNotification(supabase, id, 'kol_approved', '註冊已通過審核', '現在您可以申請任務了。');
    } catch (err) {
      alert(`승인 실패: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (processingId) return;
    setProcessingId(id);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'rejected' })
        .eq('id', id);
      
      if (error) {
        alert(`거절 실패: ${error.message}`);
        return;
      }
      
      setProfiles(prev => prev.filter(p => p.id !== id));
      setTotalCount(prev => Math.max(0, prev - 1));
      
      await createNotification(supabase, id, 'kol_rejected', '註冊審核未通過', '如有疑問，請與我們聯繫。');
    } catch (err) {
      alert(`거절 실패: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <p className="text-white/60 font-mono">로딩 중...</p>;

  if (profiles.length === 0) {
    return (
      <div className="rounded border border-white/10 bg-white/5 p-12 text-center">
        <p className="text-white/50 font-mono">대기 중인 KOL이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-4 font-mono text-sm text-white/80">이메일</th>
            <th className="text-left py-3 px-4 font-mono text-sm text-white/80">이름</th>
            <th className="text-left py-3 px-4 font-mono text-sm text-white/80">신청일</th>
            <th className="text-right py-3 px-4 font-mono text-sm text-white/80">액션</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((p) => (
            <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-white/5 hover:bg-white/5">
              <td className="py-3 px-4 font-mono text-sm">{p.email}</td>
              <td className="py-3 px-4 font-mono text-sm">{p.full_name ?? '-'}</td>
              <td className="py-3 px-4 font-mono text-sm text-white/60">{new Date(p.created_at).toLocaleDateString('ko-KR')}</td>
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => handleApprove(p.id)} 
                    disabled={processingId !== null}
                    className="inline-flex items-center gap-1 rounded bg-green-600/80 px-3 py-1.5 text-sm font-mono text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingId === p.id ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {processingId === p.id ? '처리중...' : '승인'}
                  </button>
                  <button 
                    onClick={() => handleReject(p.id)} 
                    disabled={processingId !== null}
                    className="inline-flex items-center gap-1 rounded bg-[#FF0000]/80 px-3 py-1.5 text-sm font-mono text-white hover:bg-[#FF0000] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingId === p.id ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    {processingId === p.id ? '처리중...' : '거절'}
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
      <Pagination page={page} totalPages={Math.max(1, Math.ceil(totalCount / PAGE_SIZE))} onPageChange={setPage} totalItems={totalCount} pageSize={PAGE_SIZE} />
    </div>
  );
}
