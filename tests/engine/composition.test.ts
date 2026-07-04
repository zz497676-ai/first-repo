import { describe, expect, it } from 'vitest'
import { scoreComposition } from '../../src/engine/composition'

describe('scoreComposition', () => {
  it('is neutral with no warnings for an empty team', () => {
    const result = scoreComposition([])
    expect(result.score).toBe(50)
    expect(result.warnings).toEqual([])
    expect(result.hasEngage).toBe(false)
    expect(result.hasCC).toBe(false)
  })

  it('does not over-warn about missing roles on a partial (1-pick) team', () => {
    const result = scoreComposition(['libai'])
    expect(result.warnings).toEqual([])
    expect(result.score).toBe(50)
  })

  it('warns about missing tank / engage / CC once the team is close to full', () => {
    // luban7, houyi (marksman, no engage/cc), zhugeliang, shangguanwaner (mage, no engage/cc)
    const result = scoreComposition(['luban7', 'houyi', 'zhugeliang', 'shangguanwaner'])
    expect(result.warnings).toContain('缺少坦克，团战容易被集火击穿')
    expect(result.warnings).toContain('缺少开团先手手段')
    expect(result.warnings).toContain('缺少硬控效果')
    // damage mix has both physical (2) and magic (2), so no damage-mix warning expected
    expect(result.warnings.some((w) => w.includes('伤害类型单一'))).toBe(false)
  })

  it('penalizes over-stacking one role (3+ of the same role)', () => {
    const result = scoreComposition(['houyi', 'luban7', 'sunshangxiang'])
    expect(result.warnings.some((w) => w.includes('定位过于集中'))).toBe(true)
    expect(result.roleCoverage.marksman).toBe(3)
  })

  it('warns when damage type is all-physical', () => {
    const result = scoreComposition(['houyi', 'guanyu', 'lubu'])
    expect(result.warnings).toContain('伤害类型单一（全物理），容易被针对性出防御装')
  })

  it('scores a well-rounded 5-pick team above the neutral baseline with no warnings', () => {
    const result = scoreComposition(['lianpo', 'lubu', 'angela', 'houyi', 'caiwenji'])
    expect(result.warnings).toEqual([])
    expect(result.score).toBeGreaterThan(50)
  })

  it('clamps the score within [0, 100]', () => {
    const badTeam = scoreComposition(['houyi', 'luban7', 'sunshangxiang', 'huangzhong', 'direnjie'])
    expect(badTeam.score).toBeGreaterThanOrEqual(0)
    expect(badTeam.score).toBeLessThanOrEqual(100)
  })
})
