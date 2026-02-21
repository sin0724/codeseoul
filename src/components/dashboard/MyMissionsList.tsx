'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { MessageCircle, ExternalLink, FileText, X } from 'lucide-react';
import { CopyButton } from '@/components/ui/CopyButton';
import { zhTW } from '@/messages/kol/zh-TW';
import type { Application } from '@/lib/codeseoul/types';

interface AppWithCampaign extends Omit<Application, 'campaign'> {
  campaign?: {
    id: string;
    title: string;
    brand_name: string;
    payout_amount: number;
    guide_url?: string | null;
    guide_content?: string | null;
    contact_line?: string | null;
    contact_kakao?: string | null;
  };
}

interface MyMissionsListProps {
  applications: AppWithCampaign[];
  emptyMessage?: string;
}

const statusLabel: Record<string, string> = {
  applied: zhTW.statusApplied,
  selected: zhTW.statusSelected,
  completed: zhTW.statusCompleted,
  confirmed: zhTW.statusConfirmed,
  paid: zhTW.statusPaid,
};

export function MyMissionsList({ applications: initialApplications, emptyMessage }: MyMissionsListProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState('');
  const [guideModalAppId, setGuideModalAppId] = useState<string | null>(null);
  const [submitLoadingId, setSubmitLoadingId] = useState<string | null>(null);
  const supabase = createClient();

  const hasGuide = (app: AppWithCampaign) =>
    !!(app.campaign?.guide_url?.trim() || app.campaign?.guide_content?.trim());

  const handleSubmitResult = async (applicationId: string) => {
    const url = resultUrl.trim();
    if (!url) return;
    setSubmitLoadingId(applicationId);
    
    try {
      const { error, data } = await supabase
        .from('applications')
        .update({ result_url: url, status: 'completed' })
        .eq('id', applicationId)
        .select('id');
      
      if (error) throw new Error(error.message);
      if (!data || data.length === 0) throw new Error('업데이트 실패');
      
      // 상태 직접 업데이트 (서버 새로고침 없이 즉시 반영)
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: 'completed', result_url: url } 
            : app
        )
      );
      setEditingId(null);
      setResultUrl('');
    } catch (err) {
      alert(`${zhTW.submitFailed}: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSubmitLoadingId(null);
    }
  };

  if (!applications || applications.length === 0) {
    return (
      <div className="rounded border border-white/10 bg-white/5 p-12 text-center">
        <p className="text-white/50 font-mono">{emptyMessage ?? zhTW.noSelectedMissions}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <motion.div
          key={app.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded border border-white/10 bg-white/5 p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-[#FF0000] font-mono">
                {app.campaign?.brand_name}
              </p>
              <h2 className="font-bold font-mono">{app.campaign?.title}</h2>
              <p className="text-sm text-white/60 mt-1">
                {app.campaign?.payout_amount?.toLocaleString()} TWD ·{' '}
                <span
                  className={
                    app.status === 'selected'
                      ? 'text-[#FF0000]'
                      : app.status === 'paid'
                        ? 'text-green-500'
                        : ''
                  }
                >
                  {statusLabel[app.status] ?? app.status}
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              {/* 1. 라인·카카오톡 맨 위 */}
              {app.status === 'selected' && (app.campaign?.contact_line || app.campaign?.contact_kakao) && (
                <div className="flex gap-2">
                  {app.campaign.contact_line && (
                    <a
                      href={app.campaign.contact_line.startsWith('http') ? app.campaign.contact_line : `https://line.me/ti/p/${app.campaign.contact_line}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded border border-[#FF0000]/50 bg-[#FF0000]/10 px-3 py-2 text-sm text-[#FF0000] hover:bg-[#FF0000]/20 font-mono transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {zhTW.line}
                    </a>
                  )}
                  {app.campaign.contact_kakao && (
                    <div className="inline-flex items-center gap-2 rounded border border-[#FF0000]/50 bg-[#FF0000]/10 px-3 py-2 text-sm font-mono">
                      <span className="text-[#FF0000]">{zhTW.kakao}</span>
                      <span className="text-white/90">{app.campaign.contact_kakao}</span>
                      <CopyButton text={app.campaign.contact_kakao} label={zhTW.copy} className="!border-[#FF0000]/30 !text-[#FF0000]" />
                    </div>
                  )}
                </div>
              )}

              {/* 2. 가이드 보기, 가이드 내용, 게시물 URL 제출 (선정된 인원만) */}
              <div className="flex flex-wrap gap-2 items-center">
                {hasGuide(app) && app.status !== 'applied' && (
                  <>
                    {app.campaign?.guide_url?.trim() && (
                      <a
                        href={app.campaign.guide_url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded border border-[#FF0000]/50 bg-[#FF0000]/10 px-3 py-2 text-sm text-[#FF0000] hover:bg-[#FF0000]/20 font-mono transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {zhTW.viewGuide}
                      </a>
                    )}
                    {app.campaign?.guide_content?.trim() && !app.campaign?.guide_url?.trim() && (
                      <button
                        type="button"
                        onClick={() => setGuideModalAppId(app.id)}
                        className="inline-flex items-center gap-1.5 rounded border border-[#FF0000]/50 bg-[#FF0000]/10 px-3 py-2 text-sm text-[#FF0000] hover:bg-[#FF0000]/20 font-mono transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        {zhTW.viewGuide}
                      </button>
                    )}
                    {app.campaign?.guide_content?.trim() && app.campaign?.guide_url?.trim() && (
                      <button
                        type="button"
                        onClick={() => setGuideModalAppId(app.id)}
                        className="inline-flex items-center gap-1.5 rounded border border-white/30 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10 font-mono transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        {zhTW.guideContent}
                      </button>
                    )}
                  </>
                )}
                {app.status === 'selected' && !app.result_url && (
                  editingId === app.id ? (
                    <div className="flex flex-wrap gap-2 items-center">
                      <input
                        id={`result-url-${app.id}`}
                        name="result_url"
                        type="url"
                        value={resultUrl}
                        onChange={(e) => setResultUrl(e.target.value)}
                        placeholder={zhTW.postUrlPlaceholder}
                        autoComplete="url"
                        className="min-w-[200px] rounded border border-white/20 bg-black/50 px-3 py-2 text-sm font-mono text-white placeholder:text-white/40 focus:border-[#FF0000] focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSubmitResult(app.id)}
                          disabled={submitLoadingId === app.id}
                          className="rounded bg-[#FF0000] px-3 py-2 text-sm font-mono text-white hover:bg-[#cc0000] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitLoadingId === app.id ? zhTW.submitting : zhTW.submit}
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setResultUrl('');
                          }}
                          className="rounded border border-white/20 px-3 py-2 text-sm font-mono text-white/80 hover:bg-white/10"
                        >
                          {zhTW.cancel}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingId(app.id)}
                      className="inline-flex items-center gap-1.5 rounded border border-[#FF0000]/50 bg-[#FF0000]/10 px-3 py-2 text-sm text-[#FF0000] hover:bg-[#FF0000]/20 font-mono transition-colors"
                    >
                      {zhTW.postUrlSubmit}
                    </button>
                  )
                )}
              </div>

              {app.result_url && (
                <a
                  href={app.result_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-[#FF0000] font-mono"
                >
                  <ExternalLink className="w-4 h-4" />
                  {zhTW.submittedUrl}
                </a>
              )}
            </div>
          </div>
        </motion.div>
      ))}

      {/* 가이드 내용 모달 */}
      {guideModalAppId && (() => {
        const app = applications.find((a) => a.id === guideModalAppId);
        const content = app?.campaign?.guide_content?.trim();
        if (!content) return null;
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setGuideModalAppId(null)}
          >
            <div
              className="max-h-[80vh] w-full max-w-lg overflow-auto rounded border border-white/20 bg-black p-6 font-mono"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white">{zhTW.guideContent}</h3>
                <button
                  type="button"
                  onClick={() => setGuideModalAppId(null)}
                  className="p-1 text-white/60 hover:text-white"
                  aria-label={zhTW.close}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm text-white/90">{content}</p>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
