import { getCounterStrength } from './loadData'

/**
 * Net counter advantage of `candidateId` against a team of enemy picks:
 * sum of (candidate counters enemy) minus (enemy counters candidate) over all enemy picks.
 * Missing pairs default to 0 (neutral).
 */
export function counterScoreVsTeam(candidateId: string, enemyPicks: string[]): number {
  let net = 0
  for (const enemyId of enemyPicks) {
    net += getCounterStrength(candidateId, enemyId)
    net -= getCounterStrength(enemyId, candidateId)
  }
  return net
}
