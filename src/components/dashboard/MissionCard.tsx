'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { Campaign } from '@/lib/codeseoul/types';
import { zhTW, formatFollowerTiersZh, t } from '@/messages/kol/zh-TW';

interface MissionCardProps {
  campaign: Campaign;
  index: number;
  applicantsCount?: number;
  selectedCount?: number;
}

export function MissionCard({
  campaign,
  index,
  applicantsCount = 0,
  selectedCount = 0,
}: MissionCardProps) {
  const deadline = campaign.deadline
    ? new Date(campaign.deadline).toLocaleDateString('zh-TW')
    : '-';
  const quota = campaign.recruitment_quota ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="h-full"
    >
      <Link href={`/dashboard/missions/${campaign.id}`} className="block h-full">
        <div className="group h-full min-h-[180px] rounded border border-white/10 bg-white/5 p-6 transition-all hover:border-[#FF0000]/50 hover:bg-[#FF0000]/5 flex flex-col">
          <div className="flex items-start justify-between gap-4 flex-1 min-h-0">
            {(campaign as { brand_image_url?: string }).brand_image_url && (
              <img
                src={(campaign as { brand_image_url?: string }).brand_image_url!}
                alt={campaign.brand_name}
                className="w-16 h-16 object-contain rounded border border-white/10 shrink-0"
              />
            )}
            <div className="min-w-0 flex-1 flex flex-col gap-2">
              <p className="text-xs text-[#FF0000] font-mono shrink-0">
                {campaign.brand_name}
              </p>
              <h2 className="font-bold text-white font-mono line-clamp-2 min-h-[2.75rem] shrink-0">
                {campaign.title}
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-0 text-sm text-white/60 shrink-0">
                <span className="whitespace-nowrap">{campaign.payout_amount.toLocaleString()} TWD</span>
                <span className="whitespace-nowrap">{zhTW.deadline}: {deadline}</span>
              </div>
              {campaign.follower_tiers && campaign.follower_tiers.length > 0 ? (
                <p className="text-xs text-[#FF0000]/90 font-mono shrink-0 min-h-[1.25rem]">
                  {zhTW.applyEligible}: {formatFollowerTiersZh(campaign.follower_tiers)}
                </p>
              ) : (
                <span className="block min-h-[1.25rem] shrink-0" aria-hidden />
              )}
              {(quota != null || applicantsCount > 0 || selectedCount > 0) ? (
                <p className="text-xs text-white/50 font-mono shrink-0 min-h-[1.25rem]">
                  {quota != null ? `${applicantsCount}/${quota}` : applicantsCount > 0 ? String(applicantsCount) : '-'}
                  {selectedCount > 0 && (
                    <span className="ml-2 text-[#FF0000]">{t('selectedCount', { n: selectedCount })}</span>
                  )}
                </p>
              ) : (
                <span className="block min-h-[1.25rem] shrink-0" aria-hidden />
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-[#FF0000] transition-colors shrink-0 mt-0.5" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
