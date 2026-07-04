import { afterEach, describe, expect, it } from 'vitest'
import { predictWinRate, WIN_PREDICTION_WEIGHTS } from '../../src/engine/winPrediction'

describe('predictWinRate', () => {
  it('returns exactly 50/50 when both teams are empty', () => {
    const result = predictWinRate({ allyPicks: [], enemyPicks: [], bans: [] })
    expect(result.allyWinProbability).toBe(50)
    expect(result.enemyWinProbability).toBe(50)
  })

  it('never decreases win probability when swapping in a strictly stronger hero (all else equal)', () => {
    // luban7 (strengthScore 62) vs hanxin (strengthScore 91); single-pick teams keep
    // composition identical (baseline, no penalties trigger below 3 picks) and the
    // enemy is empty so counter contribution is 0 in both cases.
    const weaker = predictWinRate({ allyPicks: ['luban7'], enemyPicks: [], bans: [] })
    const stronger = predictWinRate({ allyPicks: ['hanxin'], enemyPicks: [], bans: [] })
    expect(stronger.allyWinProbability).toBeGreaterThan(weaker.allyWinProbability)
  })

  it('clamps the output within [5, 95] even for extreme inputs', () => {
    const originalScale = WIN_PREDICTION_WEIGHTS.scale
    WIN_PREDICTION_WEIGHTS.scale = 1000
    try {
      const result = predictWinRate({ allyPicks: ['hanxin'], enemyPicks: ['luban7'], bans: [] })
      expect(result.allyWinProbability).toBe(95)
      expect(result.enemyWinProbability).toBe(5)
    } finally {
      WIN_PREDICTION_WEIGHTS.scale = originalScale
    }
  })

  it('lets counter advantage move the result when strength is held equal', () => {
    // caocao and luna both have strengthScore 78; luna counters zhugeliang (+2), caocao does not.
    const withCounterEdge = predictWinRate({ allyPicks: ['luna'], enemyPicks: ['zhugeliang'], bans: [] })
    const withoutCounterEdge = predictWinRate({ allyPicks: ['caocao'], enemyPicks: ['zhugeliang'], bans: [] })
    expect(withCounterEdge.allyWinProbability).toBeGreaterThan(withoutCounterEdge.allyWinProbability)
  })

  it('lets composition score move the result when strength and counters are held equal', () => {
    // Both trios have mean strengthScore exactly 77 and an empty (neutral) enemy team,
    // so only the composition score differs between them.
    const diverseComp = predictWinRate({
      allyPicks: ['baiqi', 'direnjie', 'daji'],
      enemyPicks: [],
      bans: [],
    })
    const stackedComp = predictWinRate({
      allyPicks: ['houyi', 'sunshangxiang', 'direnjie'],
      enemyPicks: [],
      bans: [],
    })
    expect(diverseComp.allyAggregateStrength).toBe(stackedComp.allyAggregateStrength)
    expect(diverseComp.allyWinProbability).toBeGreaterThan(stackedComp.allyWinProbability)
  })
})
