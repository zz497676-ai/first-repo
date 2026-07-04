import { useMemo } from 'react'
import { scoreComposition } from '../engine/composition'

interface CompositionGaugeProps {
  title: string
  pickedHeroIds: string[]
  barColorClass: string
}

export function CompositionGauge({ title, pickedHeroIds, barColorClass }: CompositionGaugeProps) {
  const result = useMemo(() => scoreComposition(pickedHeroIds), [pickedHeroIds])

  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title} 阵容合理度</h3>
        <span className="text-xs font-mono text-gray-500">{result.score.toFixed(0)} / 100</span>
      </div>
      <div className="w-full h-2 rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className={`h-full ${barColorClass} transition-all`}
          style={{ width: `${result.score}%` }}
        />
      </div>
      {result.warnings.length > 0 ? (
        <div className="flex flex-wrap gap-1 pt-1">
          {result.warnings.map((warning, i) => (
            <span
              key={i}
              className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
            >
              {warning}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-gray-400 pt-1">暂无明显问题</p>
      )}
    </div>
  )
}
