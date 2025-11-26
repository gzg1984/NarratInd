/**
 * 天赋效果管理器
 * 
 * 集中管理所有天赋效果的计算和应用
 * 所有效果的详细算法请参考: /SKILL_EFFECTS_SPEC.md
 */

import * as compassionEffects from './compassionEffects.js';

/**
 * 天赋效果类型枚举
 */
export const SkillEffectTypes = {
  OPPONENT_PROBABILITY: 'opponent_probability',
  POOR_TO_RICH_SPREAD: 'poor_to_rich_spread',
  GOOD_PERSON_EFFECT: 'good_person_effect'
};

/**
 * 天赋效果管理器类
 */
export class SkillEffectManager {
  constructor(skillTree) {
    this.skillTree = skillTree;
  }

  /**
   * 检查天赋是否已解锁
   * @param {string} skillId - 天赋ID
   * @returns {boolean}
   */
  isSkillUnlocked(skillId) {
    if (!this.skillTree) return false;
    
    const unlockedSkills = this.skillTree.unlockedSkills;
    if (!unlockedSkills || !(unlockedSkills instanceof Set)) {
      return false;
    }
    
    return unlockedSkills.has(skillId);
  }

  /**
   * 获取天赋效果修正值
   * @param {string} effectType - 效果类型
   * @param {object} context - 上下文信息
   * @returns {number|object} 修正值或效果对象
   */
  getModifier(effectType, context = {}) {
    // 默认返回值
    const defaultReturn = effectType === SkillEffectTypes.GOOD_PERSON_EFFECT
      ? { modifier: 1.0, isCrownedVersion: false }
      : 1.0;

    if (!this.skillTree) {
      return defaultReturn;
    }

    // 同情天赋效果
    if (this.isSkillUnlocked('compassion')) {
      return this.getCompassionEffect(effectType, context);
    }

    // 未来可添加其他天赋
    // if (this.isSkillUnlocked('refugee')) { ... }
    // if (this.isSkillUnlocked('chosen')) { ... }

    return defaultReturn;
  }

  /**
   * 获取同情天赋的效果
   * 参考: SKILL_EFFECTS_SPEC.md - SE-COMPASSION-*
   * @private
   */
  getCompassionEffect(effectType, context) {
    switch (effectType) {
      case SkillEffectTypes.OPPONENT_PROBABILITY:
        // SE-COMPASSION-01: 反对者概率降低
        return compassionEffects.getOpponentProbabilityModifier();

      case SkillEffectTypes.POOR_TO_RICH_SPREAD:
        // SE-COMPASSION-02: 穷国向富国传播加成
        return compassionEffects.getPoorToRichSpreadModifier(
          context.sourceCountry,
          context.targetCountry
        );

      case SkillEffectTypes.GOOD_PERSON_EFFECT:
        // SE-COMPASSION-03: 好人事件增强
        return compassionEffects.getGoodPersonEffect();

      default:
        return 1.0;
    }
  }

  /**
   * 检查是否应该跳过好人事件（同情天赋专用）
   * 参考: SKILL_EFFECTS_SPEC.md - SE-COMPASSION-04
   */
  shouldSkipGoodPersonEvent(country, isCrownedVersion) {
    if (this.isSkillUnlocked('compassion')) {
      return compassionEffects.shouldSkipGoodPersonEvent(country, isCrownedVersion);
    }
    
    return { shouldSkip: false, reason: '' };
  }
}
