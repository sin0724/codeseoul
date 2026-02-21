'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Plus, Trash2, Check, ArrowUpCircle } from 'lucide-react';
import { zhTW, t } from '@/messages/kol/zh-TW';
import type { Profile, SnsLink } from '@/lib/codeseoul/types';
import { parseFollowerCount } from '@/lib/codeseoul/follower-utils';
import { getProgramTierFromCount, getTierOrder, PROGRAM_TIERS } from '@/lib/codeseoul/tier-program';
import { TierBadge } from '@/components/dashboard/TierBadge';

interface ProfileFormProps {
  profile: Profile | null;
}

function parseSnsLinks(profile: Profile | null): SnsLink[] {
  if (!profile) return [];
  const links = (profile as { sns_links?: SnsLink[] }).sns_links;
  if (Array.isArray(links) && links.length > 0) return links;
  if (profile.sns_link) return [{ label: 'SNS', url: profile.sns_link }];
  return [];
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [snsLinks, setSnsLinks] = useState<SnsLink[]>(() => parseSnsLinks(profile));
  const [followerInput, setFollowerInput] = useState(
    profile?.follower_count != null ? String(profile.follower_count) : ''
  );
  const [lineId, setLineId] = useState(profile?.line_id ?? '');
  const [kakaoId, setKakaoId] = useState(profile?.kakao_id ?? '');
  const [beneficiaryName, setBeneficiaryName] = useState(profile?.bank_info?.beneficiary_name ?? '');
  const [addressEnglish, setAddressEnglish] = useState(profile?.bank_info?.address_english ?? '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.bank_info?.phone_number ?? '');
  const [bankName, setBankName] = useState(profile?.bank_info?.bank_name ?? '');
  const [swiftCode, setSwiftCode] = useState(profile?.bank_info?.swift_code ?? '');
  const [bankAddress, setBankAddress] = useState(profile?.bank_info?.bank_address ?? '');
  const [accountNumber, setAccountNumber] = useState(
    profile?.bank_info?.account_number ?? ''
  );
  const [iban, setIban] = useState(profile?.bank_info?.iban ?? '');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const parsedFollower = parseFollowerCount(followerInput);
  const eligibleTier = parsedFollower != null ? getProgramTierFromCount(parsedFollower) : null;
  const currentTier = profile?.tier ?? null;
  const hasPendingRequest = !!(profile?.tier_requested);
  const currentOrder = currentTier ? getTierOrder(currentTier) : -1;
  // 팔로워 규모 수정 시, 입력값 기준 티어가 현재 승인 티어보다 높으면 승급 신청 버튼 표시
  const canRequestUpgrade =
    eligibleTier &&
    getTierOrder(eligibleTier) > currentOrder &&
    !hasPendingRequest &&
    parsedFollower != null;

  useEffect(() => {
    setFullName(profile?.full_name ?? '');
    setSnsLinks(parseSnsLinks(profile));
    setFollowerInput(profile?.follower_count != null ? String(profile.follower_count) : '');
    setLineId(profile?.line_id ?? '');
    setKakaoId(profile?.kakao_id ?? '');
    setBeneficiaryName(profile?.bank_info?.beneficiary_name ?? '');
    setAddressEnglish(profile?.bank_info?.address_english ?? '');
    setPhoneNumber(profile?.bank_info?.phone_number ?? '');
    setBankName(profile?.bank_info?.bank_name ?? '');
    setSwiftCode(profile?.bank_info?.swift_code ?? '');
    setBankAddress(profile?.bank_info?.bank_address ?? '');
    setAccountNumber(profile?.bank_info?.account_number ?? '');
    setIban(profile?.bank_info?.iban ?? '');
  }, [profile]);

  const addSnsLink = () => {
    setSnsLinks((prev) => [...prev, { label: 'SNS', url: '' }]);
  };

  const updateSnsLink = (index: number, field: 'label' | 'url', value: string) => {
    setSnsLinks((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l))
    );
  };

  const removeSnsLink = (index: number) => {
    setSnsLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaveSuccess(false);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const validLinks = snsLinks.filter((l) => l.url?.trim());
    const parsedFollower = parseFollowerCount(followerInput);
    await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        sns_links: validLinks.length > 0 ? validLinks : [],
        follower_count: parsedFollower ?? null,
        line_id: lineId.trim() || null,
        kakao_id: kakaoId.trim() || null,
        bank_info: {
          beneficiary_name: beneficiaryName,
          address_english: addressEnglish,
          phone_number: phoneNumber,
          bank_name: bankName,
          swift_code: swiftCode.trim() || '',
          bank_address: bankAddress,
          account_number: accountNumber,
          iban: iban.trim() || undefined,
        },
      })
      .eq('id', user.id);
    setLoading(false);
    setSaveSuccess(true);
    router.refresh();
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTierUpgradeRequest = async () => {
    if (!canRequestUpgrade || !eligibleTier) return;
    setUpgradeLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // 승급 신청 시 변경된 팔로워 수도 함께 저장 (관리자 검토용)
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
      <div>
        <label className="block text-sm text-white/80 mb-1 font-mono">{zhTW.followerCount}</label>
        <input
          value={followerInput}
          onChange={(e) => setFollowerInput(e.target.value)}
          placeholder={zhTW.followerPlaceholder}
          className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white placeholder:text-white/40"
        />
        <p className="text-xs text-white/50 font-mono mt-1">
          {zhTW.followerNote}
        </p>
      </div>
      <div className="rounded border border-[#FF0000]/30 bg-[#FF0000]/5 p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-mono font-bold text-white">{zhTW.tierProgram}</h2>
          <Link
            href="/dashboard/tier-guide"
            className="text-xs text-[#FF0000] hover:underline font-mono"
          >
            {zhTW.tierGuide}
          </Link>
        </div>
        <p className="text-xs text-white/60 font-mono mb-4">
          依粉絲數可申請升級。
        </p>
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTierUpgradeRequest}
                disabled={upgradeLoading}
                className="inline-flex items-center gap-1.5 rounded border border-[#FF0000]/50 bg-[#FF0000]/20 px-3 py-1.5 text-sm font-mono text-[#FF0000] hover:bg-[#FF0000]/30 disabled:opacity-50"
              >
                <ArrowUpCircle className="w-4 h-4" />
                {upgradeLoading ? zhTW.upgradeRequesting : t('upgradeRequest', { from: currentTier ?? zhTW.tierUnassigned, to: eligibleTier })}
              </button>
            </div>
          ) : null}
        </div>
      </div>
      {saveSuccess && (
        <div className="flex items-center gap-2 rounded border border-green-500/50 bg-green-500/10 px-4 py-2 text-green-400 font-mono text-sm">
          <Check className="w-4 h-4 shrink-0" />
          {zhTW.saved}
        </div>
      )}
      <div>
        <label className="block text-sm text-white/80 mb-1 font-mono">{zhTW.name}</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm text-white/80 font-mono">{zhTW.snsLinks}</label>
          <button
            type="button"
            onClick={addSnsLink}
            className="flex items-center gap-1 text-xs text-[#FF0000] hover:underline font-mono"
          >
            <Plus className="w-3 h-3" />
            {zhTW.add}
          </button>
        </div>
        <div className="space-y-2">
          {snsLinks.map((link, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={link.label}
                onChange={(e) => updateSnsLink(index, 'label', e.target.value)}
                placeholder="예: Instagram"
                className="flex-1 min-w-0 rounded border border-white/20 bg-black/50 px-3 py-2 font-mono text-white text-sm placeholder:text-white/40"
              />
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateSnsLink(index, 'url', e.target.value)}
                placeholder="https://..."
                className="flex-[2] min-w-0 rounded border border-white/20 bg-black/50 px-3 py-2 font-mono text-white text-sm placeholder:text-white/40"
              />
              <button
                type="button"
                onClick={() => removeSnsLink(index)}
                className="p-2 text-white/50 hover:text-[#FF0000] shrink-0"
                aria-label={zhTW.delete}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded border border-white/10 bg-white/5 p-6 space-y-4">
        <h2 className="font-mono font-bold text-white">{zhTW.emergencyContact}</h2>
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
      <div className="rounded border border-white/10 bg-white/5 p-6 space-y-4">
        <h2 className="font-mono font-bold text-white">{zhTW.bankInfo}</h2>
        <div className="rounded border border-[#FF0000]/30 bg-[#FF0000]/5 px-4 py-3 font-mono text-sm">
          <p className="text-[#FF0000] font-medium">※ 注意</p>
          <p className="text-white/90 mt-1">{zhTW.bankNote}</p>
        </div>
        <div>
          <label className="block text-sm text-white/80 mb-1 font-mono">{zhTW.beneficiaryName}</label>
          <input
            value={beneficiaryName}
            onChange={(e) => setBeneficiaryName(e.target.value)}
            placeholder="e.g. WANG MING-CHEN"
            className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white placeholder:text-white/40"
          />
        </div>
        <div>
          <label className="block text-sm text-white/80 mb-1 font-mono">{zhTW.addressEnglish}</label>
          <input
            value={addressEnglish}
            onChange={(e) => setAddressEnglish(e.target.value)}
            placeholder="e.g. No.123, Section 1, Zhongxiao E. Rd., Taipei, Taiwan"
            className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white placeholder:text-white/40"
          />
        </div>
        <div>
          <label className="block text-sm text-white/80 mb-1 font-mono">{zhTW.phoneNumber}</label>
          <input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="e.g. +886-2-12345678"
            className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white placeholder:text-white/40"
          />
        </div>
        <div>
          <label className="block text-sm text-white/80 mb-1 font-mono">{zhTW.bankName}</label>
          <input
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="e.g. CTBC Bank"
            className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white placeholder:text-white/40"
          />
        </div>
        <div>
          <label className="block text-sm text-white/80 mb-1 font-mono">{zhTW.swiftCode}</label>
          <input
            value={swiftCode}
            onChange={(e) => setSwiftCode(e.target.value.toUpperCase())}
            placeholder="e.g. CTCBTWTP"
            className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white placeholder:text-white/40"
          />
        </div>
        <div>
          <label className="block text-sm text-white/80 mb-1 font-mono">{zhTW.bankAddress}</label>
          <input
            value={bankAddress}
            onChange={(e) => setBankAddress(e.target.value)}
            placeholder="e.g. No.123, Xinyi Rd., Taipei, Taiwan"
            className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white placeholder:text-white/40"
          />
        </div>
        <div>
          <label className="block text-sm text-white/80 mb-1 font-mono">{zhTW.accountNumber}</label>
          <input
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="e.g. 12345678901234"
            className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white placeholder:text-white/40"
          />
        </div>
        <div>
          <label className="block text-sm text-white/80 mb-1 font-mono">{zhTW.iban}</label>
          <input
            value={iban}
            onChange={(e) => setIban(e.target.value.toUpperCase())}
            placeholder="e.g. TW1234567890123456789012 (if applicable)"
            className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white placeholder:text-white/40"
          />
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
