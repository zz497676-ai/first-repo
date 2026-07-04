import { useDraftStore, ALLY_SLOT_COUNT, ENEMY_SLOT_COUNT, BAN_SLOT_COUNT } from '../store/useDraftStore'
import { HeroSlot } from './HeroSlot'

export function DraftBoard() {
  const allySlots = useDraftStore((s) => s.allySlots)
  const enemySlots = useDraftStore((s) => s.enemySlots)
  const banSlots = useDraftStore((s) => s.banSlots)
  const setActiveSlot = useDraftStore((s) => s.setActiveSlot)
  const clearSlot = useDraftStore((s) => s.clearSlot)
  const resetDraft = useDraftStore((s) => s.resetDraft)

  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">选人板</h2>
        <button
          type="button"
          onClick={resetDraft}
          className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          重置
        </button>
      </div>

      <div>
        <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">我方（{ALLY_SLOT_COUNT}）</div>
        <div className="flex gap-3 flex-wrap">
          {allySlots.map((heroId, index) => (
            <HeroSlot
              key={index}
              heroId={heroId}
              onClick={() => setActiveSlot({ side: 'ally', index })}
              onClear={() => clearSlot({ side: 'ally', index })}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">敌方（{ENEMY_SLOT_COUNT}）</div>
        <div className="flex gap-3 flex-wrap">
          {enemySlots.map((heroId, index) => (
            <HeroSlot
              key={index}
              heroId={heroId}
              onClick={() => setActiveSlot({ side: 'enemy', index })}
              onClear={() => clearSlot({ side: 'enemy', index })}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Ban 位（最多 {BAN_SLOT_COUNT}）</div>
        <div className="flex gap-2 flex-wrap">
          {banSlots.map((heroId, index) => (
            <HeroSlot
              key={index}
              heroId={heroId}
              size="sm"
              onClick={() => setActiveSlot({ side: 'ban', index })}
              onClear={() => clearSlot({ side: 'ban', index })}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
