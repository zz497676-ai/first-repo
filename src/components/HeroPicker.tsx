import { useMemo, useState } from 'react'
import { heroes } from '../engine/loadData'
import type { Role } from '../data/heroes.types'
import { useDraftStore, isHeroTaken } from '../store/useDraftStore'

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'tank', label: '坦克' },
  { value: 'warrior', label: '战士' },
  { value: 'mage', label: '法师' },
  { value: 'marksman', label: '射手' },
  { value: 'assassin', label: '刺客' },
  { value: 'support', label: '辅助' },
]

export function HeroPicker() {
  const activeSlot = useDraftStore((s) => s.activeSlot)
  const setActiveSlot = useDraftStore((s) => s.setActiveSlot)
  const assignHero = useDraftStore((s) => s.assignHero)
  const allySlots = useDraftStore((s) => s.allySlots)
  const enemySlots = useDraftStore((s) => s.enemySlots)
  const banSlots = useDraftStore((s) => s.banSlots)

  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return heroes.filter((hero) => {
      if (isHeroTaken({ allySlots, enemySlots, banSlots }, hero.id)) return false
      if (roleFilter && !hero.roles.includes(roleFilter)) return false
      if (!q) return true
      return (
        hero.name.toLowerCase().includes(q) ||
        hero.nameEn?.toLowerCase().includes(q) ||
        hero.id.toLowerCase().includes(q)
      )
    })
  }, [query, roleFilter, allySlots, enemySlots, banSlots])

  if (!activeSlot) return null

  const slotLabel = activeSlot.side === 'ally' ? '我方' : activeSlot.side === 'enemy' ? '敌方' : 'Ban'

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col p-4 gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">
            为 {slotLabel} 第 {activeSlot.index + 1} 位选择英雄
          </h3>
          <button
            type="button"
            onClick={() => setActiveSlot(null)}
            className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          >
            关闭
          </button>
        </div>

        <input
          autoFocus
          type="text"
          placeholder="搜索英雄名字 / 拼音"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-100"
        />

        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setRoleFilter(null)}
            className={`text-xs px-2 py-1 rounded-full border ${
              roleFilter === null ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'
            }`}
          >
            全部
          </button>
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRoleFilter(opt.value)}
              className={`text-xs px-2 py-1 rounded-full border ${
                roleFilter === opt.value ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
          {filtered.map((hero) => (
            <button
              key={hero.id}
              type="button"
              onClick={() => assignHero(hero.id)}
              className="flex flex-col items-center gap-1 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="w-10 h-10 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-semibold">
                {hero.iconPlaceholder}
              </span>
              <span className="text-xs text-gray-700 dark:text-gray-200 truncate max-w-full">{hero.name}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-sm text-gray-400 text-center py-6">没有匹配的英雄</p>
          )}
        </div>
      </div>
    </div>
  )
}
