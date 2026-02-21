/**
 * 팔로워별 티어 프로그램
 * - INSIDER → OPERATIVE → ELITE → PRESTIGE → AUTHORITY → SOVEREIGN → IMPERIAL → THE ICON
 */
export type ProgramTier =
  | 'INSIDER'      // < 10,000
  | 'OPERATIVE'    // 10,000 ~ 30,000
  | 'ELITE'        // 30,000 ~ 50,000
  | 'PRESTIGE'     // 50,000 ~ 100,000
  | 'AUTHORITY'    // 100,000 ~ 200,000
  | 'SOVEREIGN'    // 200,000 ~ 300,000
  | 'IMPERIAL'     // 300,000 ~ 500,000
  | 'THE ICON';   // 500,000+

export const PROGRAM_TIERS: { id: ProgramTier; min: number; max: number }[] = [
  { id: 'INSIDER', min: 0, max: 9999 },
  { id: 'OPERATIVE', min: 10000, max: 29999 },
  { id: 'ELITE', min: 30000, max: 49999 },
  { id: 'PRESTIGE', min: 50000, max: 99999 },
  { id: 'AUTHORITY', min: 100000, max: 199999 },
  { id: 'SOVEREIGN', min: 200000, max: 299999 },
  { id: 'IMPERIAL', min: 300000, max: 499999 },
  { id: 'THE ICON', min: 500000, max: Infinity },
];

export function getProgramTierFromCount(count: number): ProgramTier | null {
  if (count < 0) return null;
  for (const t of PROGRAM_TIERS) {
    if (count >= t.min && count <= t.max) return t.id;
  }
  return 'THE ICON';
}

export function getTierInfo(tier: ProgramTier | null | undefined) {
  if (!tier) return null;
  return PROGRAM_TIERS.find((t) => t.id === tier) ?? null;
}

/** 티어 순서(인덱스) - 승급 비교용 */
export function getTierOrder(tier: ProgramTier): number {
  const idx = PROGRAM_TIERS.findIndex((t) => t.id === tier);
  return idx >= 0 ? idx : -1;
}
