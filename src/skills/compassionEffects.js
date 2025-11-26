/**
 * 同情天赋效果实现
 * 
 * 所有效果的计算算法详见: /SKILL_EFFECTS_SPEC.md
 * - SE-COMPASSION-01: 反对者出现概率降低
 * - SE-COMPASSION-02: 穷国向富国传播加成
 * - SE-COMPASSION-03: 好人事件增强（荆棘王冠）
 * - SE-COMPASSION-04: 固化国家事件优化
 */

/**
 * SE-COMPASSION-01: 获取反对者概率修正
 * @returns {number} 概率修正系数（0.5 = 降低50%）
 */
export function getOpponentProbabilityModifier() {
  return 0.5;
}

/**
 * SE-COMPASSION-02: 获取穷国向富国传播修正
 * @param {object} sourceCountry - 源国家对象
 * @param {object} targetCountry - 目标国家对象
 * @returns {number} 传播成功率修正系数
 */
export function getPoorToRichSpreadModifier(sourceCountry, targetCountry) {
  if (!sourceCountry || !targetCountry) {
    return 1.0;
  }
  
  const sourceWealth = sourceCountry.wealthLevel || 5;
  const targetWealth = targetCountry.wealthLevel || 5;
  
  // 如果源国更穷（财富等级更低），传播成功率翻倍
  if (sourceWealth < targetWealth) {
    return 2.0;
  }
  
  return 1.0;
}

/**
 * SE-COMPASSION-03: 获取好人事件效果
 * @returns {object} 效果对象 { modifier, isCrownedVersion, canConvertApostates }
 */
export function getGoodPersonEffect() {
  // 20%概率触发荆棘王冠版本
  const isCrownedVersion = Math.random() < 0.2;
  
  return {
    modifier: isCrownedVersion ? 2.0 : 1.0,
    isCrownedVersion: isCrownedVersion,
    canConvertApostates: isCrownedVersion
  };
}

/**
 * SE-COMPASSION-04: 检查是否应该跳过好人事件
 * @param {object} country - 国家对象
 * @param {boolean} isCrownedVersion - 是否为荆棘王冠版本
 * @returns {object} { shouldSkip, reason }
 */
export function shouldSkipGoodPersonEvent(country, isCrownedVersion) {
  const apostates = country.apostates || 0;
  const maxBelievers = country.population - apostates;
  const hasConversionSpace = country.believers < maxBelievers;
  
  // 普通好人事件：如果没有转化空间（已固化），跳过
  if (!hasConversionSpace && !isCrownedVersion) {
    return {
      shouldSkip: true,
      reason: '已固化（信徒+脱教者=人口），普通好人事件无效'
    };
  }
  
  // 荆棘王冠版本：如果没有脱教者且没有转化空间，跳过
  if (isCrownedVersion && apostates === 0 && !hasConversionSpace) {
    return {
      shouldSkip: true,
      reason: '无脱教者可转化且无转化空间'
    };
  }
  
  return {
    shouldSkip: false,
    reason: ''
  };
}
