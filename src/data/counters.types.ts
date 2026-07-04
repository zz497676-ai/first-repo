/**
 * Directed, sparse counter relationship: positive `strength` means `hero`
 * has an advantage against `counters` (missing pairs are neutral = 0).
 * Not symmetric — B→A is not derived from A→B and must be listed separately if known.
 */
export interface CounterEntry {
  hero: string
  counters: string
  strength: number // -3..+3
  note?: string
}

export interface CountersData {
  version: string
  disclaimer: string
  entries: CounterEntry[]
}
