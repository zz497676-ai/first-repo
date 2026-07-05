import { describe, expect, it } from 'vitest'
import { counterScoreVsTeam } from '../../src/engine/counterScore'

describe('counterScoreVsTeam', () => {
  it('returns 0 for an unlisted (neutral) pair', () => {
    expect(counterScoreVsTeam('chengyaojin', ['sunbin'])).toBe(0)
  })

  it('returns the known net value for a single known counter pair', () => {
    // hanxin -> shangguanwaner: +3, shangguanwaner -> hanxin: -1 => net = 3 - (-1) = 4
    expect(counterScoreVsTeam('hanxin', ['shangguanwaner'])).toBe(4)
  })

  it('accounts for both directions independently when both are listed with different magnitudes', () => {
    // ake -> caiwenji: +3, caiwenji -> ake: -1
    // net for ake vs [caiwenji] = strength(ake->caiwenji) - strength(caiwenji->ake) = 3 - (-1) = 4
    expect(counterScoreVsTeam('ake', ['caiwenji'])).toBe(4)
    // net for caiwenji vs [ake] = strength(caiwenji->ake) - strength(ake->caiwenji) = -1 - 3 = -4
    expect(counterScoreVsTeam('caiwenji', ['ake'])).toBe(-4)
  })

  it('sums net advantage across multiple enemy picks', () => {
    // hanxin -> shangguanwaner: +3, shangguanwaner -> hanxin: -1 => 4
    // hanxin -> houyi: +2, houyi -> hanxin: -1 => 3
    // total = 4 + 3 = 7
    expect(counterScoreVsTeam('hanxin', ['shangguanwaner', 'houyi'])).toBe(7)
  })

  it('returns 0 against an empty enemy team', () => {
    expect(counterScoreVsTeam('hanxin', [])).toBe(0)
  })
})
