'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import type { Campaign } from '@/lib/codeseoul/types';
import { canApplyByFollower } from '@/lib/codeseoul/follower-utils';
import { zhTW, formatFollowerTiersZh, t } from '@/messages/kol/zh-TW';

interface MissionDetailClientProps {
  campaign: Campaign;
  alreadyApplied?: boolean;
  isSelected?: boolean;
  applicantsCount?: number;
  selectedCount?: number;
  profileFollowerCount?: number | null;
}

export function MissionDetailClient({
  campaign,
  alreadyApplied = false,
  isSelected = false,
  applicantsCount = 0,
  selectedCount = 0,
  profileFollowerCount = null,
}: MissionDetailClientProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const allowedTiers = campaign.follower_tiers ?? [];
  const hasFollowerRestriction = allowedTiers.length > 0;
  const canApply = !hasFollowerRestriction || canApplyByFollower(profileFollowerCount, allowedTiers);
  const showFollowerWarning = hasFollowerRestriction && !canApply;

  const deadline = campaign.deadline
    ? new Date(campaign.deadline).toLocaleDateString('zh-TW')
    : '-';

  const handleApply = async () => {
    if (!canApply) return;
    setLoading(true);
    const doApply = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('請先登入');
      const { error } = await supabase.from('applications').insert({
        kol_id: user.id,
        campaign_id: campaign.id,
        status: 'applied',
      });
      if (error) throw error;
      router.push('/dashboard/my-missions?applied=1');
      router.refresh();
    };
    doApply()
      .catch((err) => {
        console.error('MissionDetailClient apply error:', err);
        alert(`${zhTW.applyFailed}: ${err instanceof Error ? err.message : String(err)}`);
      })
      .finally(() => setLoading(false));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex gap-4">
        {(campaign as { brand_image_url?: string }).brand_image_url && (
          <img
            src={(campaign as { brand_image_url?: string }).brand_image_url!}
            alt={campaign.brand_name}
            className="w-24 h-24 object-contain rounded border border-white/10 shrink-0"
          />
        )}
        <div>
        <p className="text-sm text-[#FF0000] font-mono mb-1">{campaign.brand_name}</p>
        <h1 className="text-2xl font-bold font-mono">{campaign.title}</h1>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/60">
          <span>{campaign.payout_amount.toLocaleString()} TWD</span>
          <span>{zhTW.deadline}: {deadline}</span>
        </div>
        {((campaign.recruitment_quota != null) || applicantsCount > 0) && (
          <p className="mt-2 text-xs text-white/50 font-mono">
            {campaign.recruitment_quota != null
              ? `${applicantsCount}/${campaign.recruitment_quota}`
              : applicantsCount}
            {selectedCount > 0 && (
              <span className="ml-2 text-[#FF0000]">{t('selectedCount', { n: selectedCount })}</span>
            )}
          </p>
        )}
        {hasFollowerRestriction && (
          <p className="mt-2 text-xs text-[#FF0000]/90 font-mono">
            {zhTW.applyEligible}: {formatFollowerTiersZh(allowedTiers)}
          </p>
        )}
        </div>
      </div>

      {showFollowerWarning && (
        <div className="rounded border border-[#FF0000]/50 bg-[#FF0000]/10 px-4 py-3 font-mono text-sm">
          <p className="text-[#FF0000] font-medium">{zhTW.followerRequirementNotMet}</p>
          <p className="text-white/90 mt-1">
            {zhTW.followerRequirementDesc.replace('{tiers}', formatFollowerTiersZh(allowedTiers))}
            {profileFollowerCount == null && ` ${zhTW.followerRequirementProfile}`}
            {profileFollowerCount != null && ` ${t('followerRequirementCurrent', { count: profileFollowerCount >= 10000 ? `${Math.floor(profileFollowerCount / 10000)}萬` : profileFollowerCount.toLocaleString() })}`}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
        {!alreadyApplied && (
          <button
            onClick={handleApply}
            disabled={loading || !canApply}
            className="rounded bg-[#FF0000] px-6 py-3 font-mono font-bold text-white transition-colors hover:bg-[#cc0000] disabled:opacity-50 disabled:cursor-not-allowed w-fit shrink-0"
          >
            {loading ? zhTW.applying : canApply ? zhTW.apply : zhTW.cannotApply}
          </button>
        )}
      </div>

      {alreadyApplied && (
        <div className="rounded border border-[#FF0000]/30 bg-[#FF0000]/5 p-6 font-mono text-sm">
          <p className="text-white/90 font-medium mb-2">{zhTW.appliedTitle}</p>
          <p className="text-white/70 mb-2">{zhTW.appliedDesc}</p>
          <p className="text-white/70">
            入選者可於{' '}
            <a href="/dashboard/my-missions" className="text-[#FF0000] hover:underline font-medium">
              {zhTW.myMissions}
            </a>
            {' '}中查看。
          </p>
        </div>
      )}
    </motion.div>
  );
}
