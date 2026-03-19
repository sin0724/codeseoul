'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Plus, Trash2, Check, ArrowUpCircle, Instagram } from 'lucide-react';
import { zhTW, t } from '@/messages/kol/zh-TW';
import type { Profile, SnsLink } from '@/lib/codeseoul/types';
import { parseFollowerCount } from '@/lib/codeseoul/follower-utils';
import { getProgramTierFromCount, getTierOrder, PROGRAM_TIERS } from '@/lib/codeseoul/tier-program';
import { TierBadge } from '@/components/dashboard/TierBadge';

interface ProfileFormProps {
  profile: Profile | null;
}

function getInstagramUrl(profile: Profile | null): string {
  if (!profile) return '';
  const links = (profile as { sns_links?: SnsLink[] }).sns_links;
  if (Array.isArray(links)) {
    const ig = links.find(l => l.label?.toLowerCase().includes('instagram') || l.url?.includes('instagram.com'));
    if (ig) return ig.url;
  }
  return '';
}

function getOtherSnsLinks(profile: Profile | null): SnsLink[] {
  if (!profile) return [];
  const links = (profile as { sns_links?: SnsLink[] }).sns_links;
  if (Array.isArray(links)) {
    return links.filter(l => !(l.label?.toLowerCase().includes('instagram') || l.url?.includes('instagram.com')));
  }
  if (profile.sns_link) return [{ label: 'SNS', url: profile.sns_link }];
  return [];
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [instagramUrl, setInstagramUrl] = useState(() => getInstagramUrl(profile));
  const [otherSnsLinks, setOtherSnsLinks] = useState<SnsLink[]>(() => getOtherSnsLinks(profile));
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [followerInput, setFollowerInput] = useState(
    profile?.follower_count != null ? String(profile.follower_count) : ''
  );
  const [lineId, setLineId] = useState(profile?.line_id ?? '');
  const [kakaoId, setKakaoId] = useState(profile?.kakao_id ?? '');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const parsedFollower = parseFollowerCount(followerInput);
  const eligibleTier = parsedFollower != null ? getProgramTierFromCount(parsedFollower) : null;
  const currentTier = profile?.tier ?? null;
  const hasPendingRequest = !!(profile?.tier_requested);
  const currentOrder = currentTier ? getTierOrder(currentTier) : -1;
  const canRequestUpgrade =
    eligibleTier &&
    getTierOrder(eligibleTier) > currentOrder &&
    !hasPendingRequest &&
    parsedFollower != null;

  useEffect(() => {
    setFullName(profile?.full_name ?? '');
    setInstagramUrl(getInstagramUrl(profile));
    setOtherSnsLinks(getOtherSnsLinks(profile));
    setFollowerInput(profile?.follower_count != null ? String(profile.follower_count) : '');
    setLineId(profile?.line_id ?? '');
    setKakaoId(profile?.kakao_id ?? '');
  }, [profile]);

  const addOtherSnsLink = () => {
    setOtherSnsLinks((prev) => [...prev, { label: 'SNS', url: '' }]);
  };

  const updateOtherSnsLink = (index: number, field: 'label' | 'url', value: string) => {
    setOtherSnsLinks((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l))
    );
  };

  const removeOtherSnsLink = (index: number) => {
    setOtherSnsLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const allSnsLinks: SnsLink[] = [];
      if (instagramUrl.trim()) {
        allSnsLinks.push({ label: 'Instagram', url: instagramUrl.trim() });
      }
      const validOthers = otherSnsLinks.filter((l) => l.url?.trim());
      allSnsLinks.push(...validOthers);

      const parsedFollower = parseFollowerCount(followerInput);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName || null,
          sns_links: allSnsLinks.length > 0 ? allSnsLinks : [],
          follower_count: parsedFollower ?? null,
          line_id: lineId.trim() || null,
          kakao_id: kakaoId.trim() || null,
        })
        .eq('id', user.id);
      if (error) {
        console.error('Profile save error:', error);
        setSaveError(zhTW.saveFailed);
        return;
      }
      setSaveSuccess(true);
      router.refresh();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Profile save exception:', err);
      setSaveError(zhTW.saveFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleTierUpgradeRequest = async () => {
    if (!canRequestUpgrade || !eligibleTier) return;
    setUpgradeLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from('profiles')
      .update({
        follower_count: parsedFollower,
        tier_requested: eligibleTier,
        tier_requested_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    setUpgradeLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {/* Instagram URL */}
      <div className="rounded-lg border-2 border-[#FF0000]/40 bg-gradient-to-b from-[#FF0000]/5 to-transparent p-5">
        <div className="flex items-center gap-2 mb-3">
          <Instagram className="w-5 h-5 text-[#FF0000]" />
          <label className="text-sm font-bold text-white font-mono">Instagram 連結</label>
        </div>
        <input
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
          placeholder="https://www.instagram.com/yourname"
          className="w-full rounded border border-[#FF0000]/30 bg-black/50 px-4 py-3 font-mono text-white placeholder:text-white/30 focus:border-[#FF0000] focus:outline-none focus:ring-1 focus:ring-[#FF0000]"
        />
      </div>

      {/* 팔로워 수 */}
      <div className="rounded-lg border-2 border-[#FF0000]/40 bg-gradient-to-b from-[#FF0000]/5 to-transparent p-5">
        <label className="block text-sm font-bold text-white mb-3 font-mono">{zhTW.followerCount}</label>
        <input
          value={followerInput}
          onChange={(e) => setFollowerInput(e.target.value)}
          placeholder={zhTW.followerPlaceholder}
          className="w-full rounded border border-[#FF0000]/30 bg-black/50 px-4 py-3 font-mono text-white placeholder:text-white/30 focus:border-[#FF0000] focus:outline-none focus:ring-1 focus:ring-[#FF0000]"
        />
        <p className="text-xs text-white/50 font-mono mt-2">{zhTW.followerNote}</p>
      </div>

      {/* 티어 프로그램 */}
      <div className="rounded border border-[#FF0000]/30 bg-[#FF0000]/5 p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-mono font-bold text-white">{zhTW.tierProgram}</h2>
          <Link href="/dashboard/tier-guide" className="text-xs text-[#FF0000] hover:underline font-mono">
            {zhTW.tierGuide}
          </Link>
        </div>
        <p className="text-xs text-white/60 font-mono mb-4">依粉絲數可申請升級。</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {PROGRAM_TIERS.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center rounded border border-white/10 bg-white/5 px-2 py-1 text-xs font-mono text-white/80"
              title={`${t.min.toLocaleString()} ~ ${t.max === Infinity ? '∞' : t.max.toLocaleString()}`}
            >
              {t.id}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {profile?.tier ? (
            <TierBadge tier={profile.tier} size="lg" />
          ) : (
            <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-mono text-white/60">
              {zhTW.tierUnassignedLong}
            </span>
          )}
          {hasPendingRequest ? (
            <span className="text-sm text-white/60 font-mono">
              {t('upgradePending', { from: profile?.tier_requested ?? '' })}
            </span>
          ) : canRequestUpgrade && eligibleTier ? (
            <button
              type="button"
              onClick={handleTierUpgradeRequest}
              disabled={upgradeLoading}
              className="inline-flex items-center gap-1.5 rounded border border-[#FF0000]/50 bg-[#FF0000]/20 px-3 py-1.5 text-sm font-mono text-[#FF0000] hover:bg-[#FF0000]/30 disabled:opacity-50"
            >
              <ArrowUpCircle className="w-4 h-4" />
              {upgradeLoading ? zhTW.upgradeRequesting : t('upgradeRequest', { from: currentTier ?? zhTW.tierUnassigned, to: eligibleTier })}
            </button>
          ) : null}
        </div>
      </div>

      {/* 저장 상태 */}
      {saveSuccess && (
        <div className="flex items-center gap-2 rounded border border-green-500/50 bg-green-500/10 px-4 py-2 text-green-400 font-mono text-sm">
          <Check className="w-4 h-4 shrink-0" />
          {zhTW.saved}
        </div>
      )}
      {saveError && (
        <div className="flex items-center gap-2 rounded border border-red-500/50 bg-red-500/10 px-4 py-2 text-red-400 font-mono text-sm">
          {saveError}
        </div>
      )}

      {/* 이름 */}
      <div>
        <label className="block text-sm text-white/80 mb-1 font-mono">{zhTW.name}</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white"
        />
      </div>

      {/* 연락처 */}
      <div className="rounded border border-white/10 bg-white/5 p-6 space-y-4">
        <h2 className="font-mono font-bold text-white">{zhTW.emergencyContact}</h2>
        <p className="text-xs text-white/50 font-mono">{zhTW.onboardingStepContactHint}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-white/80 mb-1 font-mono">{zhTW.lineId}</label>
            <input
              value={lineId}
              onChange={(e) => setLineId(e.target.value)}
              placeholder="예: line_id123"
              className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white placeholder:text-white/40"
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1 font-mono">{zhTW.kakaoId}</label>
            <input
              value={kakaoId}
              onChange={(e) => setKakaoId(e.target.value)}
              placeholder="예: kakao_id123"
              className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white placeholder:text-white/40"
            />
          </div>
        </div>
      </div>

      {/* 기타 SNS */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm text-white/60 font-mono">其他社群連結 (選填)</label>
          <button
            type="button"
            onClick={addOtherSnsLink}
            className="flex items-center gap-1 text-xs text-[#FF0000] hover:underline font-mono"
          >
            <Plus className="w-3 h-3" />
            {zhTW.add}
          </button>
        </div>
        <div className="space-y-2">
          {otherSnsLinks.map((link, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={link.label}
                onChange={(e) => updateOtherSnsLink(index, 'label', e.target.value)}
                placeholder="예: YouTube, TikTok"
                className="flex-1 min-w-0 rounded border border-white/20 bg-black/50 px-3 py-2 font-mono text-white text-sm placeholder:text-white/40"
              />
              <input
                type="text"
                value={link.url}
                onChange={(e) => updateOtherSnsLink(index, 'url', e.target.value)}
                placeholder="https://..."
                className="flex-[2] min-w-0 rounded border border-white/20 bg-black/50 px-3 py-2 font-mono text-white text-sm placeholder:text-white/40"
              />
              <button
                type="button"
                onClick={() => removeOtherSnsLink(index)}
                className="p-2 text-white/50 hover:text-[#FF0000] shrink-0"
                aria-label={zhTW.delete}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-[#FF0000] px-6 py-2 font-mono font-bold text-white hover:bg-[#cc0000] disabled:opacity-50"
      >
        {loading ? zhTW.saving : zhTW.save}
      </button>
    </form>
  );
}
