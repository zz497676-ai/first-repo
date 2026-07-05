import type { Role } from '../data/heroes.types'

export interface DraftState {
  allyPicks: string[]
  enemyPicks: string[]
  bans: string[]
}

export interface CandidateScore {
  heroId: string
  totalScore: number
  strengthContribution: number
  counterContribution: number
  compositionContribution: number
  breakdown: string[]
}

export interface CompositionScore {
  score: number
  roleCoverage: Partial<Record<Role, number>>
  damageMix: { physical: number; magic: number; mixed: number; none: number }
  hasEngage: boolean
  hasCC: boolean
  hasPeel: boolean
  warnings: string[]
}

export interface WinPrediction {
  allyWinProbability: number
  enemyWinProbability: number
  allyAggregateStrength: number
  enemyAggregateStrength: number
  allyCompositionScore: number
  enemyCompositionScore: number
  netCounterAdvantage: number
}
