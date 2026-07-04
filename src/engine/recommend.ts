import type { Hero } from '../data/heroes.types'
import { counterScoreVsTeam } from './counterScore'
import { scoreComposition } from './composition'
import type { CandidateScore, DraftState } from './types'

const STRENGTH_WEIGHT = 0.4
const COUNTER_WEIGHT = 3
const COMPOSITION_WEIGHT = 0.5

/**
 * Ranks every hero not yet banned/picked as a candidate for the ally's next
 * pick, given the current draft state. Cheap enough to call on every state
 * change (at most a few dozen candidates, O(picks) work each).
 */
export function rankCandidates(draft: DraftState, allHeroes: Hero[]): CandidateScore[] {
  const unavailable = new Set([...draft.bans, ...draft.allyPicks, ...draft.enemyPicks])
  const candidates = allHeroes.filter((h) => !unavailable.has(h.id))

  const baseAllyComposition = scoreComposition(draft.allyPicks).score

  const scored: CandidateScore[] = candidates.map((hero) => {
    const strengthContribution = hero.strengthScore * STRENGTH_WEIGHT

    const rawCounter = counterScoreVsTeam(hero.id, draft.enemyPicks)
    const counterContribution = rawCounter * COUNTER_WEIGHT

    const newAllyComposition = scoreComposition([...draft.allyPicks, hero.id]).score
    const compositionContribution = (newAllyComposition - baseAllyComposition) * COMPOSITION_WEIGHT

    const totalScore = strengthContribution + counterContribution + compositionContribution

    const breakdown: string[] = [`英雄强度：${hero.tier}（${hero.strengthScore}）`]
    if (rawCounter > 0) {
      breakdown.push(`对当前敌方阵容有克制优势（净克制值 +${rawCounter}）`)
    } else if (rawCounter < 0) {
      breakdown.push(`被当前敌方阵容克制，需谨慎（净克制值 ${rawCounter}）`)
    }
    if (compositionContribution > 0) {
      breakdown.push('有助于改善己方阵容（补齐定位/伤害类型）')
    } else if (compositionContribution < 0) {
      breakdown.push('可能加剧己方阵容问题（定位重复/伤害类型单一）')
    }

    return { heroId: hero.id, totalScore, strengthContribution, counterContribution, compositionContribution, breakdown }
  })

  return scored.sort((a, b) => b.totalScore - a.totalScore)
}
