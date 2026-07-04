export type Role =
  | 'tank' // 坦克
  | 'warrior' // 战士
  | 'mage' // 法师
  | 'marksman' // 射手
  | 'assassin' // 刺客
  | 'support' // 辅助

export type DamageType = 'physical' | 'magic' | 'mixed' | 'none'

export type Tier = 'S+' | 'S' | 'A' | 'B' | 'C'

export interface HeroTags {
  /** Can reliably initiate fights (hard engage). */
  engage: boolean
  /** Has meaningful hard CC (stun/silence/knockup/root/fear). */
  cc: boolean
  /** Has peel/protect tools for a squishy backline ally. */
  peel: boolean
  /** Strong at range poke before a fight starts. */
  poke: boolean
  /** Significant self/lane sustain (regen/lifesteal-based kit). */
  sustain: boolean
}

export interface Hero {
  /** Stable slug id, used as the join key everywhere (never use `name` as a key). */
  id: string
  name: string
  nameEn?: string
  roles: Role[]
  damageType: DamageType
  tier: Tier
  /** 0-100, drives all scoring math; `tier` is a display label derived from bands over this. */
  strengthScore: number
  tags: HeroTags
  difficulty?: 1 | 2 | 3
  /** Text/color placeholder avatar since we have no licensed art assets yet. */
  iconPlaceholder: string
  patchNote?: string
}

export interface HeroesData {
  version: string
  patch: string
  disclaimer: string
  heroes: Hero[]
}

const TIER_BANDS: { min: number; tier: Tier }[] = [
  { min: 90, tier: 'S+' },
  { min: 80, tier: 'S' },
  { min: 65, tier: 'A' },
  { min: 50, tier: 'B' },
  { min: 0, tier: 'C' },
]

export function tierFromScore(strengthScore: number): Tier {
  const band = TIER_BANDS.find((b) => strengthScore >= b.min)
  return band ? band.tier : 'C'
}
