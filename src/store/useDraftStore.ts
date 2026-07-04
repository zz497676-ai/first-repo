import { create } from 'zustand'
import type { DraftState } from '../engine/types'

export const ALLY_SLOT_COUNT = 5
export const ENEMY_SLOT_COUNT = 5
export const BAN_SLOT_COUNT = 10

export type SlotSide = 'ally' | 'enemy' | 'ban'

export interface ActiveSlot {
  side: SlotSide
  index: number
}

interface DraftStore {
  allySlots: (string | null)[]
  enemySlots: (string | null)[]
  banSlots: (string | null)[]
  activeSlot: ActiveSlot | null
  setActiveSlot: (slot: ActiveSlot | null) => void
  assignHero: (heroId: string) => void
  clearSlot: (slot: ActiveSlot) => void
  resetDraft: () => void
}

function slotsFor(state: DraftStore, side: SlotSide): (string | null)[] {
  if (side === 'ally') return state.allySlots
  if (side === 'enemy') return state.enemySlots
  return state.banSlots
}

export const useDraftStore = create<DraftStore>((set, get) => ({
  allySlots: Array(ALLY_SLOT_COUNT).fill(null),
  enemySlots: Array(ENEMY_SLOT_COUNT).fill(null),
  banSlots: Array(BAN_SLOT_COUNT).fill(null),
  activeSlot: null,

  setActiveSlot: (slot) => set({ activeSlot: slot }),

  assignHero: (heroId) => {
    const active = get().activeSlot
    if (!active) return
    const key = active.side === 'ally' ? 'allySlots' : active.side === 'enemy' ? 'enemySlots' : 'banSlots'
    const slots = [...slotsFor(get(), active.side)]
    slots[active.index] = heroId
    set({ [key]: slots, activeSlot: null } as Partial<DraftStore>)
  },

  clearSlot: (slot) => {
    const key = slot.side === 'ally' ? 'allySlots' : slot.side === 'enemy' ? 'enemySlots' : 'banSlots'
    const slots = [...slotsFor(get(), slot.side)]
    slots[slot.index] = null
    set({ [key]: slots } as Partial<DraftStore>)
  },

  resetDraft: () =>
    set({
      allySlots: Array(ALLY_SLOT_COUNT).fill(null),
      enemySlots: Array(ENEMY_SLOT_COUNT).fill(null),
      banSlots: Array(BAN_SLOT_COUNT).fill(null),
      activeSlot: null,
    }),
}))

export function toDraftState(store: Pick<DraftStore, 'allySlots' | 'enemySlots' | 'banSlots'>): DraftState {
  return {
    allyPicks: store.allySlots.filter((id): id is string => id !== null),
    enemyPicks: store.enemySlots.filter((id): id is string => id !== null),
    bans: store.banSlots.filter((id): id is string => id !== null),
  }
}

export function isHeroTaken(store: Pick<DraftStore, 'allySlots' | 'enemySlots' | 'banSlots'>, heroId: string): boolean {
  return (
    store.allySlots.includes(heroId) || store.enemySlots.includes(heroId) || store.banSlots.includes(heroId)
  )
}
