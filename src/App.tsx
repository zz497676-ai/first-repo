import { useDraftStore } from './store/useDraftStore'
import { DraftBoard } from './components/DraftBoard'
import { HeroPicker } from './components/HeroPicker'
import { RecommendationPanel } from './components/RecommendationPanel'
import { CompositionGauge } from './components/CompositionGauge'
import { WinProbabilityBar } from './components/WinProbabilityBar'

function App() {
  const allySlots = useDraftStore((s) => s.allySlots)
  const enemySlots = useDraftStore((s) => s.enemySlots)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-5xl mx-auto p-4 md:p-8 flex flex-col gap-4">
        <header>
          <h1 className="text-xl md:text-2xl font-bold">王者荣耀选人辅助（示例数据）</h1>
          <p className="text-xs text-gray-500 mt-1">
            点击选人板的位置手动选择英雄，克制关系/阵容评分/胜率预测会实时更新。
          </p>
        </header>

        <DraftBoard />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CompositionGauge title="我方" pickedHeroIds={allySlots.filter((h): h is string => h !== null)} barColorClass="bg-blue-500" />
          <CompositionGauge title="敌方" pickedHeroIds={enemySlots.filter((h): h is string => h !== null)} barColorClass="bg-red-500" />
        </div>

        <WinProbabilityBar />

        <RecommendationPanel />
      </div>

      <HeroPicker />
    </div>
  )
}

export default App
