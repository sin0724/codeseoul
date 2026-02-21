/**
 * 팔로워 규모 관련 유틸리티
 * - 1만 미만, 1-3만, 3-5만, 5-7만, 10만 이상
 */
export type FollowerTier =
  | 'under_10k'   // 1만 미만
  | '10k_30k'     // 1-3만
  | '30k_50k'     // 3-5만
  | '50k_70k'     // 5-7만
  | '100k_plus';  // 10만 이상

export const FOLLOWER_TIERS: { id: FollowerTier; label: string; min: number; max: number }[] = [
  { id: 'under_10k', label: '1만 미만', min: 0, max: 9999 },
  { id: '10k_30k', label: '1-3만', min: 10000, max: 29999 },
  { id: '30k_50k', label: '3-5만', min: 30000, max: 49999 },
  { id: '50k_70k', label: '5-7만', min: 50000, max: 69999 },
  { id: '100k_plus', label: '10만 이상', min: 100000, max: Infinity },
];

export function getTierFromCount(count: number): FollowerTier | null {
  if (count < 0) return null;
  for (const t of FOLLOWER_TIERS) {
    if (count >= t.min && count <= t.max) return t.id;
  }
  // 7만~10만 구간은 별도 tier 없음 → 50k_70k로 처리 (7만-9.99만)
  if (count >= 70000 && count < 100000) return '50k_70k';
  return '100k_plus';
}

/** "1만", "10000", "10k" 등 입력을 숫자로 파싱 */
export function parseFollowerCount(input: string): number | null {
  const s = String(input || '').trim().replace(/\s/g, '').toLowerCase();
  if (!s) return null;
  const num = parseInt(s.replace(/[^0-9]/g, ''), 10);
  if (isNaN(num)) return null;
  if (s.includes('만') || s.includes('man')) return num * 10000;
  if (s.endsWith('k')) return num * 1000;
  return num;
}

/** 허용된 tier들 중 최대 팔로워 상한값 (이 이상이면 모두 신청 가능) */
function getMaxOfAllowedTiers(allowedTiers: FollowerTier[]): number {
  let max = 0;
  for (const id of allowedTiers) {
    const t = FOLLOWER_TIERS.find((x) => x.id === id);
    if (t && t.max !== Infinity) max = Math.max(max, t.max);
    else if (t) return Infinity; // 10만 이상 포함 시 상한 없음
  }
  return max;
}

/**
 * 팔로워 수로 신청 가능한지
 * - 해당 tier에 포함되면 신청 가능
 * - 허용된 최대 구간보다 팔로워가 많아도 신청 가능 (예: 1-3만 허용 시 3만1천, 5만도 신청 가능)
 * - 허용된 최소 구간보다 적으면 신청 불가 (예: 3-5만 허용 시 1.5만은 신청 불가)
 */
export function canApplyByFollower(
  followerCount: number | null,
  allowedTiers: FollowerTier[] | null | undefined
): boolean {
  if (!allowedTiers || allowedTiers.length === 0) return true; // 제한 없으면 모두 신청 가능
  if (followerCount == null || followerCount < 0) return false;
  const tier = getTierFromCount(followerCount);
  if (!tier) return false;
  // 1) 해당 tier가 허용 목록에 있으면 신청 가능
  if (allowedTiers.includes(tier)) return true;
  // 2) 허용된 tier들의 최대 상한보다 많으면 신청 가능 (그 이상 KOL은 모두 신청 가능)
  const maxAllowed = getMaxOfAllowedTiers(allowedTiers);
  return followerCount > maxAllowed;
}

/** 허용 tier들을 "1만 이상, 3-5만" 형태로 표시 */
export function formatFollowerTierLabels(tiers: FollowerTier[] | null | undefined): string {
  if (!tiers || tiers.length === 0) return '제한 없음';
  return tiers.map((id) => FOLLOWER_TIERS.find((t) => t.id === id)?.label ?? id).join(', ');
}
