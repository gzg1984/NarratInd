/**
 * 原罪天赋效果实现
 * 
 * 所有效果的计算算法详见: /SKILL_EFFECTS_SPEC.md
 * - SE-ORIGINAL_SIN-01: 传播速度翻倍
 */

/**
 * SE-ORIGINAL_SIN-01: 传播概率翻倍
 * 所有传播事件概率 × 2.0
 * 可与同情天赋的低财富加成叠加（2.0 × 2.0 = 4.0）
 * 
 * @returns {number} 传播概率修正系数
 */
export function getSpreadProbabilityModifier() {
  return 2.0;
}

/**
 * 重置状态追踪（用于新游戏或测试）
 */
export function resetOriginalSinTracking() {
  console.log(`🔄 重置原罪天赋状态追踪`);
}
