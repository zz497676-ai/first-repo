import { describe, expect, it } from 'vitest'
import heroesData from '../../src/data/heroes.json'
import countersData from '../../src/data/counters.json'
import type { HeroesData } from '../../src/data/heroes.types'
import type { CountersData } from '../../src/data/counters.types'
import { tierFromScore } from '../../src/data/heroes.types'

const heroes = (heroesData as HeroesData).heroes
const entries = (countersData as CountersData).entries

describe('heroes.json integrity', () => {
  it('has no duplicate hero ids', () => {
    const ids = heroes.map((h) => h.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has a tier label consistent with the strengthScore band for every hero', () => {
    for (const hero of heroes) {
      expect(tierFromScore(hero.strengthScore), `${hero.id}: tier=${hero.tier} score=${hero.strengthScore}`).toBe(
        hero.tier,
      )
    }
  })
})

describe('counters.json integrity', () => {
  const heroIds = new Set(heroes.map((h) => h.id))

  it('references only hero ids that exist in heroes.json', () => {
    for (const entry of entries) {
      expect(heroIds.has(entry.hero), `unknown hero id: ${entry.hero}`).toBe(true)
      expect(heroIds.has(entry.counters), `unknown counters target id: ${entry.counters}`).toBe(true)
    }
  })

  it('has no duplicate (hero, counters) pairs', () => {
    const pairs = entries.map((e) => `${e.hero}->${e.counters}`)
    expect(new Set(pairs).size).toBe(pairs.length)
  })

  it('keeps every strength value within the documented -3..+3 range', () => {
    for (const entry of entries) {
      expect(entry.strength).toBeGreaterThanOrEqual(-3)
      expect(entry.strength).toBeLessThanOrEqual(3)
    }
  })
})
