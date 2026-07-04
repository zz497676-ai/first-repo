import { getHero } from './loadData'
import { counterScoreVsTeam } from './counterScore'
import { scoreComposition } from './composition'
import type { DraftState, WinPrediction } from './types'

/**
 * Heuristic linear blend, not a trained model — tune these after manual
 * playtesting (see plan verification section 6.1).
 */
export const WIN_PREDICTION_WEIGHTS = {
  strength: 0.5,
  counter: 1.5,
  composition: 0.3,
  scale: 0.3,
}

const MIN_WIN_PROBABILITY = 5
const MAX_WIN_PROBABILITY = 95

function meanStrength(pickedHeroIds: string[]): number {
  const scores = pickedHeroIds.map((id) => getHero(id)?.strengthScore).filter((s): s is number => s !== undefined)
  if (scores.length === 0) return 0
  return scores.reduce((a, b) => a + b, 0) / scores.length
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function predictWinRate(draft: DraftState): WinPrediction {
  const { allyPicks, enemyPicks } = draft

  if (allyPicks.length === 0 && enemyPicks.length === 0) {
    return {
      allyWinProbability: 50,
      enemyWinProbability: 50,
      allyAggregateStrength: 0,
      enemyAggregateStrength: 0,
      allyCompositionScore: scoreComposition([]).score,
      enemyCompositionScore: scoreComposition([]).score,
      netCounterAdvantage: 0,
    }
  }

  const allyAggregateStrength = meanStrength(allyPicks)
  const enemyAggregateStrength = meanStrength(enemyPicks)
  const strengthDelta = allyAggregateStrength - enemyAggregateStrength

  const netCounterAdvantage = allyPicks.reduce(
    (sum, allyId) => sum + counterScoreVsTeam(allyId, enemyPicks),
    0,
  )

  const allyCompositionScore = scoreComposition(allyPicks).score
  const enemyCompositionScore = scoreComposition(enemyPicks).score
  const compDelta = allyCompositionScore - enemyCompositionScore

  const rawAdvantage =
    WIN_PREDICTION_WEIGHTS.strength * strengthDelta +
    WIN_PREDICTION_WEIGHTS.counter * netCounterAdvantage +
    WIN_PREDICTION_WEIGHTS.composition * compDelta

  const allyWinProbability = clamp(
    50 + rawAdvantage * WIN_PREDICTION_WEIGHTS.scale,
    MIN_WIN_PROBABILITY,
    MAX_WIN_PROBABILITY,
  )

  return {
    allyWinProbability,
    enemyWinProbability: 100 - allyWinProbability,
    allyAggregateStrength,
    enemyAggregateStrength,
    allyCompositionScore,
    enemyCompositionScore,
    netCounterAdvantage,
  }
}
