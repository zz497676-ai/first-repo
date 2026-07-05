import heroesData from '../data/heroes.json'
import countersData from '../data/counters.json'
import type { Hero, HeroesData } from '../data/heroes.types'
import type { CounterEntry, CountersData } from '../data/counters.types'

export const heroes: Hero[] = (heroesData as HeroesData).heroes
export const heroesById: Map<string, Hero> = new Map(heroes.map((h) => [h.id, h]))

export const counterEntries: CounterEntry[] = (countersData as CountersData).entries

/** heroId -> targetId -> strength */
export const counterMap: Map<string, Map<string, number>> = (() => {
  const map = new Map<string, Map<string, number>>()
  for (const entry of counterEntries) {
    if (!map.has(entry.hero)) map.set(entry.hero, new Map())
    map.get(entry.hero)!.set(entry.counters, entry.strength)
  }
  return map
})()

export function getCounterStrength(heroId: string, targetId: string): number {
  return counterMap.get(heroId)?.get(targetId) ?? 0
}

export function getHero(heroId: string): Hero | undefined {
  return heroesById.get(heroId)
}
