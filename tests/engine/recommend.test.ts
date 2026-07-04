import { describe, expect, it } from 'vitest'
import { rankCandidates } from '../../src/engine/recommend'
import { heroes } from '../../src/engine/loadData'

describe('rankCandidates', () => {
  it('excludes banned and already-picked heroes from the candidate list', () => {
    const draft = { allyPicks: ['lianpo'], enemyPicks: ['hanxin'], bans: ['libai'] }
    const ranked = rankCandidates(draft, heroes)
    const ids = ranked.map((c) => c.heroId)
    expect(ids).not.toContain('lianpo')
    expect(ids).not.toContain('hanxin')
    expect(ids).not.toContain('libai')
    expect(ids.length).toBe(heroes.length - 3)
  })

  it('ranks a hero with a strong counter advantage above a similarly-strong hero without one', () => {
    // caocao and luna both have strengthScore 78; luna counters zhugeliang (+2), caocao does not.
    const draft = { allyPicks: [], enemyPicks: ['zhugeliang'], bans: [] }
    const ranked = rankCandidates(draft, heroes)
    const lunaRank = ranked.findIndex((c) => c.heroId === 'luna')
    const caocaoRank = ranked.findIndex((c) => c.heroId === 'caocao')
    expect(lunaRank).toBeLessThan(caocaoRank)
  })

  it('always attaches a non-empty breakdown for every candidate', () => {
    const draft = { allyPicks: [], enemyPicks: [], bans: [] }
    const ranked = rankCandidates(draft, heroes)
    expect(ranked.length).toBeGreaterThan(0)
    for (const candidate of ranked) {
      expect(candidate.breakdown.length).toBeGreaterThan(0)
    }
  })
})
