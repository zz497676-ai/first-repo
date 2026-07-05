import { getHero } from '../engine/loadData'
import type { Role } from '../data/heroes.types'

const ROLE_COLOR: Record<Role, string> = {
  tank: 'bg-slate-500',
  warrior: 'bg-orange-500',
  mage: 'bg-violet-500',
  marksman: 'bg-amber-500',
  assassin: 'bg-rose-500',
  support: 'bg-emerald-500',
}

interface HeroSlotProps {
  heroId: string | null
  onClick: () => void
  onClear?: () => void
  size?: 'sm' | 'md'
}

export function HeroSlot({ heroId, onClick, onClear, size = 'md' }: HeroSlotProps) {
  const hero = heroId ? getHero(heroId) : undefined
  const dimensions = size === 'sm' ? 'w-12 h-12 text-xs' : 'w-16 h-16 text-sm'

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={onClick}
        className={`relative ${dimensions} rounded-full border-2 flex items-center justify-center font-semibold text-white transition
          ${hero ? `${ROLE_COLOR[hero.roles[0]]} border-transparent` : 'border-dashed border-gray-400 dark:border-gray-600 text-gray-400 hover:border-gray-500'}`}
      >
        {hero ? hero.iconPlaceholder : '+'}
        {hero && onClear && (
          <span
            role="button"
            aria-label="清除"
            onClick={(e) => {
              e.stopPropagation()
              onClear()
            }}
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gray-800 text-white text-[10px] flex items-center justify-center leading-none cursor-pointer after:absolute after:-inset-3 after:content-['']"
          >
            ×
          </span>
        )}
      </button>
      {size === 'md' && (
        <span className="text-[11px] text-gray-600 dark:text-gray-300 max-w-16 truncate">
          {hero ? hero.name : '空位'}
        </span>
      )}
    </div>
  )
}
