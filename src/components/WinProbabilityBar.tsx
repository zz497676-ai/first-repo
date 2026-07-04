import { useMemo } from 'react'
import { useDraftStore, toDraftState } from '../store/useDraftStore'
import { predictWinRate } from '../engine/winPrediction'

export function WinProbabilityBar() {
  const allySlots = useDraftStore((s) => s.allySlots)
  const enemySlots = useDraftStore((s) => s.enemySlots)
  const banSlots = useDraftStore((s) => s.banSlots)

  const prediction = useMemo(() => {
    const draft = toDraftState({ allySlots, enemySlots, banSlots })
    return predictWinRate(draft)
  }, [allySlots, enemySlots, banSlots])

  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">胜率预测</h3>
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono text-blue-600 dark:text-blue-400 w-14 text-right">
          {prediction.allyWinProbability.toFixed(0)}%
        </span>
        <div className="flex-1 h-4 rounded-full overflow-hidden flex bg-gray-200 dark:bg-gray-700">
          <div className="h-full bg-blue-500" style={{ width: `${prediction.allyWinProbability}%` }} />
          <div className="h-full bg-red-500" style={{ width: `${prediction.enemyWinProbability}%` }} />
        </div>
        <span className="text-sm font-mono text-red-600 dark:text-red-400 w-14">
          {prediction.enemyWinProbability.toFixed(0)}%
        </span>
      </div>
      <p className="text-[11px] text-gray-400">
        基于示例强度/克制/阵容数据的粗略估算，仅供参考，不代表真实胜率。
      </p>
    </div>
  )
}
