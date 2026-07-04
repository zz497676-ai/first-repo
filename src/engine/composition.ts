import type { Role } from '../data/heroes.types'
import { getHero } from './loadData'
import type { CompositionScore } from './types'

const ROLE_LABEL: Record<Role, string> = {
  tank: '坦克',
  warrior: '战士',
  mage: '法师',
  marksman: '射手',
  assassin: '刺客',
  support: '辅助',
}

/**
 * Rule-based composition rationality score. Designed to work on partial teams
 * (1-4 picks) without false "missing role" warnings on slots that are simply
 * still empty — role-coverage warnings only fire once the team is close to full.
 */
export function scoreComposition(pickedHeroIds: string[]): CompositionScore {
  const heroes = pickedHeroIds.map(getHero).filter((h) => h !== undefined)
  const count = heroes.length

  const roleCoverage: Partial<Record<Role, number>> = {}
  const damageMix = { physical: 0, magic: 0, mixed: 0, none: 0 }
  let hasEngage = false
  let hasCC = false
  let hasPeel = false

  for (const hero of heroes) {
    for (const role of hero.roles) {
      roleCoverage[role] = (roleCoverage[role] ?? 0) + 1
    }
    damageMix[hero.damageType] += 1
    if (hero.tags.engage) hasEngage = true
    if (hero.tags.cc) hasCC = true
    if (hero.tags.peel) hasPeel = true
  }

  let score = 50
  const warnings: string[] = []

  for (const [role, roleCount] of Object.entries(roleCoverage) as [Role, number][]) {
    if (roleCount >= 3) {
      score -= 8
      warnings.push(`定位过于集中：${roleCount}个${ROLE_LABEL[role]}，缺少多样性`)
    }
  }

  if (count >= 4 && !roleCoverage.tank) {
    score -= 10
    warnings.push('缺少坦克，团战容易被集火击穿')
  }

  if (count >= 3 && !hasEngage) {
    score -= 8
    warnings.push('缺少开团先手手段')
  }

  if (count >= 3 && !hasCC) {
    score -= 6
    warnings.push('缺少硬控效果')
  }

  if (count >= 3) {
    if (damageMix.physical > 0 && damageMix.magic === 0 && damageMix.mixed === 0) {
      score -= 10
      warnings.push('伤害类型单一（全物理），容易被针对性出防御装')
    } else if (damageMix.magic > 0 && damageMix.physical === 0 && damageMix.mixed === 0) {
      score -= 10
      warnings.push('伤害类型单一（全法术），容易被针对性出防御装')
    }
  }

  const hasCarry = (roleCoverage.marksman ?? 0) + (roleCoverage.mage ?? 0) > 0
  if (count >= 4 && hasCarry && !hasPeel && !(roleCoverage.support ?? 0)) {
    score -= 5
    warnings.push('输出手缺乏保护，容易被单点击杀')
  }

  if (
    count >= 5 &&
    (roleCoverage.tank ?? 0) > 0 &&
    hasCC &&
    hasEngage &&
    damageMix.physical > 0 &&
    damageMix.magic > 0
  ) {
    score += 10
  }

  score = Math.max(0, Math.min(100, score))

  return { score, roleCoverage, damageMix, hasEngage, hasCC, hasPeel, warnings }
}
