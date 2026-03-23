'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Instagram, Youtube, Calendar, Users } from 'lucide-react';
import type { Campaign } from '@/lib/codeseoul/types';
import { zhTW, formatFollowerTiersZh, t } from '@/messages/kol/zh-TW';

function PlatformBadge({ platform }: { platform?: string | null }) {
  if (platform === 'youtube') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-xs font-mono tracking-wide border border-red-500/20">
        <Youtube className="w-3 h-3" />
        YouTube
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-400 text-xs font-mono tracking-wide border border-pink-500/20">
      <Instagram className="w-3 h-3" />
      Instagram
    </span>
  );
}

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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: 'easeOut' }}
      className="h-full"
    >
      <Link href={`/dashboard/missions/${campaign.id}`} className="block h-full group">
        <div className="glass-card rounded-xl p-5 h-full min-h-[200px] flex flex-col cursor-pointer">

          {/* 상단: 브랜드 이미지 + 플랫폼 배지 */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              {(campaign as { brand_image_url?: string }).brand_image_url ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 group-hover:border-[#E11D48]/30 transition-colors flex-shrink-0 bg-white/5">
                  <img
                    src={(campaign as { brand_image_url?: string }).brand_image_url!}
                    alt={campaign.brand_name}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg border border-white/10 bg-white/5 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-xs font-mono text-[#E11D48] tracking-wider uppercase truncate">
                  {campaign.brand_name}
                </p>
                <div className="mt-0.5">
                  <PlatformBadge platform={campaign.platform} />
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/25 group-hover:text-[#E11D48]/70 transition-colors flex-shrink-0 mt-1" />
          </div>

          {/* 미션 제목 */}
          <h2 className="text-sm font-semibold text-white leading-snug line-clamp-2 mb-3 flex-1">
            {campaign.title}
          </h2>

          {/* 하단 메타 정보 */}
          <div className="space-y-2 mt-auto">
            {/* 원고료 */}
            <div className="flex items-center justify-between">
              <span className="text-lg font-mono font-bold text-[#E11D48]">
                {campaign.payout_amount.toLocaleString()}
                <span className="text-xs text-[#E11D48]/70 ml-1">TWD</span>
              </span>
            </div>

            <div className="h-px bg-white/5" />

            {/* 마감일 + 지원자 수 */}
            <div className="flex items-center gap-3 text-xs text-white/40">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span className="font-mono">{deadline}</span>
              </span>
              {(quota != null || applicantsCount > 0) && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span className="font-mono">
                    {quota != null ? `${applicantsCount}/${quota}` : applicantsCount}
                    {selectedCount > 0 && (
                      <span className="text-[#E11D48]/80 ml-1">{t('selectedCount', { n: selectedCount })}</span>
                    )}
                  </span>
                </span>
              )}
            </div>

            {/* 팔로워 티어 요건 */}
            {campaign.follower_tiers && campaign.follower_tiers.length > 0 && (
              <p className="text-xs font-mono text-[#E11D48]/60 truncate">
                {zhTW.applyEligible}: {formatFollowerTiersZh(campaign.follower_tiers)}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
