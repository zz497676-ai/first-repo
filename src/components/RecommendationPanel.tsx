import { useMemo } from 'react'
import { useDraftStore, toDraftState } from '../store/useDraftStore'
import { heroes, getHero } from '../engine/loadData'
import { rankCandidates } from '../engine/recommend'

const TOP_N = 8

export function RecommendationPanel() {
  const allySlots = useDraftStore((s) => s.allySlots)
  const enemySlots = useDraftStore((s) => s.enemySlots)
  const banSlots = useDraftStore((s) => s.banSlots)

  const ranked = useMemo(() => {
    const draft = toDraftState({ allySlots, enemySlots, banSlots })
    return rankCandidates(draft, heroes).slice(0, TOP_N)
  }, [allySlots, enemySlots, banSlots])

  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col gap-3">
      <h2 className="font-semibold text-gray-800 dark:text-gray-100">推荐我方下一手</h2>
      <ul className="flex flex-col gap-2">
        {ranked.map((candidate, i) => {
          const hero = getHero(candidate.heroId)
          if (!hero) return null
          return (
            <li key={candidate.heroId} className="flex items-start gap-3 p-2 rounded bg-gray-50 dark:bg-gray-800/60">
              <span className="text-xs font-mono text-gray-400 pt-0.5">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800 dark:text-gray-100">{hero.name}</span>
                  <span className="text-xs font-mono text-gray-500">{candidate.totalScore.toFixed(1)} 分</span>
                </div>
                <ul className="mt-1 text-xs text-gray-500 dark:text-gray-400 list-disc list-inside">
                  {candidate.breakdown.map((line, idx) => (
                    <li key={idx}>{line}</li>
                  ))}
                </ul>
              </div>
            </li>
          )
        })}
        {ranked.length === 0 && <p className="text-sm text-gray-400">没有可选英雄了</p>}
      </ul>
    </div>
  )
}
