'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Calendar, Plus, List, Trash2, Search, CalendarPlus } from 'lucide-react';
import type { Campaign, FollowerTier } from '@/lib/codeseoul/types';
import { FOLLOWER_TIERS } from '@/lib/codeseoul/follower-utils';
import { Pagination } from '@/components/ui/Pagination';

const defaultCampaign: {
  title: string;
  brand_name: string;
  guide_content: string;
  guide_url: string;
  contact_line: string;
  contact_kakao: string;
  payout_amount: number;
  recruitment_quota: number;
  deadline: string;
  status: 'active' | 'closed';
  brand_image_url: string;
  follower_tiers: FollowerTier[];
} = {
  title: '',
  brand_name: '',
  guide_content: '',
  guide_url: '',
  contact_line: '',
  contact_kakao: '',
  payout_amount: 0,
  recruitment_quota: 0,
  deadline: '',
  status: 'active',
  brand_image_url: '',
  follower_tiers: [],
};

const BRAND_IMAGE_SIZE = { width: 200, height: 200 };

export function MissionManagerTab() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [form, setForm] = useState(defaultCampaign);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<'register' | 'list'>('register');
  const [searchQuery, setSearchQuery] = useState('');
  const [extendCampaignId, setExtendCampaignId] = useState<string | null>(null);
  const [extendDate, setExtendDate] = useState('');
  const [brandImageFile, setBrandImageFile] = useState<File | null>(null);
  const [brandImagePreview, setBrandImagePreview] = useState<string | null>(null);
  const [campaignPage, setCampaignPage] = useState(1);
  const supabase = createClient();

  const CAMPAIGN_PAGE_SIZE = 10;

  const fetchCampaigns = async () => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    setCampaigns(data ?? []);
  };

  useEffect(() => {
    setLoading(true);
    fetchCampaigns()
      .catch((err) => {
        console.error('MissionManagerTab fetch error:', err);
        alert(`데이터 로드 실패: ${err?.message ?? String(err)}\n\nadmin_emails 테이블에 관리자 이메일이 등록되어 있는지 확인하세요.`);
      })
      .finally(() => setLoading(false));
  }, []);

  const uploadBrandImage = async (): Promise<string | null> => {
    if (!brandImageFile) return form.brand_image_url || null;
    const ext = brandImageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
    const allowedExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!allowedExt.includes(ext)) {
      alert('지원 형식: JPG, PNG, GIF, WebP');
      return null;
    }
    const fileName = `brand-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage
      .from('campaign-images')
      .upload(fileName, brandImageFile, { upsert: true, contentType: brandImageFile.type });
    if (error) {
      console.error('Storage upload error:', error);
      throw new Error(error.message);
    }
    const { data: urlData } = supabase.storage.from('campaign-images').getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let brandImageUrl: string | null = (form as { brand_image_url?: string }).brand_image_url ?? null;
    if (brandImageFile) {
      try {
        brandImageUrl = await uploadBrandImage();
        if (!brandImageUrl) {
          alert(
            '이미지 업로드에 실패했습니다.\n' +
            '1) 버킷 이름이 campaign-images 인지 확인\n' +
            '2) Supabase SQL Editor에서 003_storage_policies.sql 실행'
          );
          return;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(err);
        alert(`이미지 업로드 오류: ${msg}\nStorage RLS 정책을 추가했는지 확인하세요.`);
        return;
      }
    }
    const { brand_image_url: _, ...rest } = form;
    const payload = {
      ...rest,
      payout_amount: Number(form.payout_amount) || 0,
      recruitment_quota: Number(form.recruitment_quota) || null,
      deadline: form.deadline || null,
      guide_content: form.guide_content || null,
      guide_url: form.guide_url || null,
      contact_line: form.contact_line || null,
      contact_kakao: form.contact_kakao || null,
      brand_image_url: brandImageUrl,
      follower_tiers: form.follower_tiers ?? [],
    };
    const { error } = editingId
      ? await supabase.from('campaigns').update(payload).eq('id', editingId)
      : await supabase.from('campaigns').insert(payload);

    if (error) {
      console.error('Campaign save error:', error);
      alert(
        `미션 저장 실패: ${error.message}\n\n` +
        'admin_emails 테이블에 관리자 이메일이 등록되어 있는지 확인하세요.\n' +
        'Supabase SQL Editor에서 실행: INSERT INTO admin_emails (email) VALUES (\'your@email.com\');'
      );
      return;
    }

    setEditingId(null);
    setForm(defaultCampaign);
    setBrandImageFile(null);
    setBrandImagePreview(null);
    fetchCampaigns();
    setSubTab('list');
  };

  const handleEdit = (c: Campaign) => {
    const cExt = c as { brand_image_url?: string; recruitment_quota?: number; contact_line?: string; contact_kakao?: string; follower_tiers?: FollowerTier[] };
    setEditingId(c.id);
    setForm({
      ...defaultCampaign,
      title: c.title,
      brand_name: c.brand_name,
      guide_content: c.guide_content ?? '',
      guide_url: c.guide_url ?? '',
      contact_line: cExt.contact_line ?? '',
      contact_kakao: cExt.contact_kakao ?? '',
      payout_amount: c.payout_amount,
      recruitment_quota: cExt.recruitment_quota ?? 0,
      deadline: c.deadline ?? '',
      status: c.status,
      brand_image_url: cExt.brand_image_url ?? '',
      follower_tiers: cExt.follower_tiers ?? [],
    });
    setBrandImagePreview(cExt.brand_image_url ?? null);
    setBrandImageFile(null);
    setSubTab('register');
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(defaultCampaign);
    setBrandImageFile(null);
    setBrandImagePreview(null);
  };

  const filteredCampaigns = campaigns.filter(
    (c) =>
      !searchQuery.trim() ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      c.brand_name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );
  const paginatedCampaigns = filteredCampaigns.slice(
    (campaignPage - 1) * CAMPAIGN_PAGE_SIZE,
    campaignPage * CAMPAIGN_PAGE_SIZE
  );

  const handleExtendDeadline = async (id: string) => {
    if (!extendDate) {
      alert('연장할 마감일을 선택해 주세요.');
      return;
    }
    const { error } = await supabase.from('campaigns').update({ deadline: extendDate }).eq('id', id);
    if (error) {
      alert(`마감일 연장 실패: ${error.message}`);
      return;
    }
    setExtendCampaignId(null);
    setExtendDate('');
    fetchCampaigns();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 미션을 삭제하시겠습니까? 관련 지원 내역도 함께 삭제됩니다.`)) return;
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error) {
      alert(`삭제 실패: ${error.message}`);
      return;
    }
    if (editingId === id) handleCancel();
    fetchCampaigns();
  };

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('이미지는 2MB 이하여야 합니다.');
        return;
      }
      setBrandImageFile(file);
      setBrandImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setSubTab('register')}
          className={`flex items-center gap-2 px-4 py-2 rounded font-mono text-sm transition-colors ${
            subTab === 'register' ? 'bg-[#FF0000] text-white' : 'border border-white/10 text-white/70 hover:bg-white/5'
          }`}
        >
          <Plus className="w-4 h-4" />
          새 미션 등록
        </button>
        <button
          onClick={() => setSubTab('list')}
          className={`flex items-center gap-2 px-4 py-2 rounded font-mono text-sm transition-colors ${
            subTab === 'list' ? 'bg-[#FF0000] text-white' : 'border border-white/10 text-white/70 hover:bg-white/5'
          }`}
        >
          <List className="w-4 h-4" />
          등록된 미션
        </button>
      </div>

      {subTab === 'register' ? (
        <form onSubmit={handleSubmit} className="space-y-4 rounded border border-white/10 bg-white/5 p-6">
          <h2 className="font-mono font-bold text-white">
            {editingId ? '미션 수정' : '새 미션 등록'}
          </h2>

          <div>
            <label className="block text-sm text-white/80 mb-1 font-mono">브랜드 로고/대표 이미지 (200×200 권장, 2MB 이하)</label>
            <div className="flex items-start gap-4">
              <div className="w-[120px] h-[120px] rounded border border-white/20 bg-black/50 flex items-center justify-center overflow-hidden shrink-0">
                {brandImagePreview ? (
                  <img src={brandImagePreview} alt="브랜드 이미지" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-white/40 text-xs font-mono">이미지 없음</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="text-sm font-mono text-white/80 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#FF0000] file:text-white file:text-sm"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-white/80 mb-1 font-mono">제목</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                className="w-full rounded border border-white/20 bg-black/50 px-3 py-2 font-mono text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-1 font-mono">브랜드명</label>
              <input
                value={form.brand_name}
                onChange={(e) => setForm((f) => ({ ...f, brand_name: e.target.value }))}
                required
                className="w-full rounded border border-white/20 bg-black/50 px-3 py-2 font-mono text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1 font-mono">가이드 내용</label>
            <textarea
              value={form.guide_content}
              onChange={(e) => setForm((f) => ({ ...f, guide_content: e.target.value }))}
              rows={4}
              className="w-full rounded border border-white/20 bg-black/50 px-3 py-2 font-mono text-white"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-white/80 mb-1 font-mono">가이드 URL</label>
              <input
                type="url"
                value={form.guide_url}
                onChange={(e) => setForm((f) => ({ ...f, guide_url: e.target.value }))}
                className="w-full rounded border border-white/20 bg-black/50 px-3 py-2 font-mono text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-1 font-mono">정산금액 (TWD)</label>
              <input
                type="number"
                value={form.payout_amount || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, payout_amount: Number(e.target.value) || 0 }))
                }
                required
                min={0}
                className="w-full rounded border border-white/20 bg-black/50 px-3 py-2 font-mono text-white"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-sm text-white/80 mb-1 font-mono flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                마감일 (달력 선택)
              </label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                className="w-full rounded border border-white/20 bg-black/50 px-3 py-2 font-mono text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-1 font-mono">모집 인원</label>
              <input
                type="number"
                value={form.recruitment_quota || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, recruitment_quota: Number(e.target.value) || 0 }))
                }
                min={0}
                placeholder="선택"
                className="w-full rounded border border-white/20 bg-black/50 px-3 py-2 font-mono text-white placeholder:text-white/40"
              />
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-1 font-mono">상태</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as 'active' | 'closed',
                  }))
                }
                className="w-full rounded border border-white/20 bg-black/50 px-3 py-2 font-mono text-white"
              >
                <option value="active">active</option>
                <option value="closed">closed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-2 font-mono">신청 가능 팔로워 규모 (중복 선택)</label>
            <div className="flex flex-wrap gap-3">
              {FOLLOWER_TIERS.map((t) => (
                <label key={t.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.follower_tiers?.includes(t.id) ?? false}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...(form.follower_tiers ?? []), t.id]
                        : (form.follower_tiers ?? []).filter((x) => x !== t.id);
                      setForm((f) => ({ ...f, follower_tiers: next }));
                    }}
                    className="rounded border-white/30"
                  />
                  <span className="text-sm font-mono text-white/80">{t.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-white/80 mb-1 font-mono">라인 연락처</label>
              <input
                value={form.contact_line}
                onChange={(e) => setForm((f) => ({ ...f, contact_line: e.target.value }))}
                placeholder="URL 또는 ID"
                className="w-full rounded border border-white/20 bg-black/50 px-3 py-2 font-mono text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-1 font-mono">카카오톡 연락처</label>
              <input
                value={form.contact_kakao}
                onChange={(e) => setForm((f) => ({ ...f, contact_kakao: e.target.value }))}
                placeholder="URL 또는 ID"
                className="w-full rounded border border-white/20 bg-black/50 px-3 py-2 font-mono text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded bg-[#FF0000] px-4 py-2 font-mono font-bold text-white hover:bg-[#cc0000]"
            >
              {editingId ? '수정' : '등록'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="rounded border border-white/20 px-4 py-2 font-mono text-white/80 hover:bg-white/10"
              >
                취소
              </button>
            )}
          </div>
        </form>
      ) : (
        <div>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="제목 또는 브랜드명으로 검색"
                className="w-full rounded border border-white/20 bg-black/50 pl-9 pr-4 py-2 font-mono text-white text-sm placeholder:text-white/40"
              />
            </div>
          </div>
          {loading ? (
            <p className="text-white/60 font-mono">로딩 중...</p>
          ) : filteredCampaigns.length === 0 ? (
            <div className="rounded border border-white/10 bg-white/5 p-12 text-center">
              <p className="text-white/50 font-mono">
                {searchQuery.trim() ? '검색 결과가 없습니다.' : '등록된 미션이 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {paginatedCampaigns.map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center gap-4">
                    {(c as { brand_image_url?: string }).brand_image_url && (
                      <img
                        src={(c as { brand_image_url?: string }).brand_image_url!}
                        alt={c.brand_name}
                        className="w-12 h-12 object-contain rounded border border-white/10"
                      />
                    )}
                    <div>
                      <p className="font-mono font-bold">{c.title}</p>
                      <p className="text-sm text-white/60 font-mono">
                        {c.brand_name} · {c.payout_amount.toLocaleString()} TWD ·{' '}
                        <span
                          className={
                            c.status === 'active' ? 'text-green-500' : 'text-white/50'
                          }
                        >
                          {c.status}
                        </span>
                        {c.deadline && (
                          <span className="ml-2">
                            · 마감: {new Date(c.deadline).toLocaleDateString('ko-KR')}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    {extendCampaignId === c.id ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="date"
                          value={extendDate}
                          onChange={(e) => setExtendDate(e.target.value)}
                          className="rounded border border-white/20 bg-black/50 px-2 py-1 font-mono text-white text-sm"
                        />
                        <button
                          onClick={() => handleExtendDeadline(c.id)}
                          className="rounded bg-[#FF0000] px-2 py-1 text-sm font-mono text-white hover:bg-[#cc0000]"
                        >
                          연장
                        </button>
                        <button
                          onClick={() => {
                            setExtendCampaignId(null);
                            setExtendDate('');
                          }}
                          className="rounded border border-white/20 px-2 py-1 text-sm font-mono text-white/70 hover:bg-white/10"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setExtendCampaignId(c.id);
                          setExtendDate(c.deadline ?? '');
                        }}
                        className="flex items-center gap-1 rounded border border-white/20 px-2 py-1 text-sm text-white/60 font-mono hover:bg-white/10"
                        title="마감일 연장"
                      >
                        <CalendarPlus className="w-4 h-4" />
                        마감 연장
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(c)}
                      className="rounded border border-[#FF0000]/50 px-3 py-1 text-sm text-[#FF0000] font-mono hover:bg-[#FF0000]/10"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.title)}
                      className="flex items-center gap-1 rounded border border-white/20 px-3 py-1 text-sm text-white/60 font-mono hover:bg-[#FF0000]/20 hover:text-[#FF0000] hover:border-[#FF0000]/50"
                    >
                      <Trash2 className="w-4 h-4" />
                      삭제
                    </button>
                  </div>
                </motion.div>
              ))}
              <Pagination
                page={campaignPage}
                totalPages={Math.max(1, Math.ceil(filteredCampaigns.length / CAMPAIGN_PAGE_SIZE))}
                onPageChange={(p) => setCampaignPage(p)}
                totalItems={filteredCampaigns.length}
                pageSize={CAMPAIGN_PAGE_SIZE}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
