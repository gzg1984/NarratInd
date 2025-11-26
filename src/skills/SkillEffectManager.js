/**
 * 天赋效果管理器
 * 
 * 集中管理所有天赋效果的计算和应用
 * 所有效果的详细算法请参考: /SKILL_EFFECTS_SPEC.md
 */

import * as compassionEffects from './compassionEffects.js';
import * as originalSinEffects from './originalSinEffects.js';

/**
 * 天赋效果类型枚举
 */
export const SkillEffectTypes = {
  OPPONENT_PROBABILITY: 'opponent_probability',
  SPREAD_PROBABILITY: 'spread_probability', // ⭐ 新增：传播概率修正
  WEALTH_TRANSFER: 'wealth_transfer', // ⭐ 新增：财富转移修正
  COUNTER_ATTACK_SUCCESS: 'counterAttackSuccess', // ⭐ 新增：反击成功率修正
  COUNTER_ATTACK_DAMAGE: 'counterAttackDamage', // ⭐ 新增：反击伤害修正
  POOR_TO_RICH_SPREAD: 'poor_to_rich_spread', // 已废弃，保留兼容性
  GOOD_PERSON_EFFECT: 'good_person_effect' // 已废弃，保留兼容性
};

/**
 * 天赋效果管理器类
 */
export class SkillEffectManager {
  constructor(skillTree, gameState) {
    this.skillTree = skillTree;
    this.gameState = gameState;
    
    // 设置 compassionEffects 的 gameState 引用
    if (gameState) {
      compassionEffects.setGameStateRef(gameState);
    }
    
    // ⭐ 重置财富状态追踪（确保每次游戏都是干净的状态）
    compassionEffects.resetWealthTracking();
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

    // ⭐ 传播概率效果可叠加（同情 × 原罪）
    if (effectType === SkillEffectTypes.SPREAD_PROBABILITY) {
      let totalModifier = 1.0;
      
      // 同情天赋效果
      if (this.isSkillUnlocked('compassion')) {
        totalModifier *= this.getCompassionEffect(effectType, context);
      }
      
      // 原罪天赋效果
      if (this.isSkillUnlocked('original_sin')) {
        totalModifier *= this.getOriginalSinEffect(effectType, context);
      }
      
      return totalModifier;
    }

    // 同情天赋效果（非传播概率）
    if (this.isSkillUnlocked('compassion')) {
      return this.getCompassionEffect(effectType, context);
    }

    // 未来可添加其他天赋
    // if (this.isSkillUnlocked('refugee')) { ... }

    return defaultReturn;
  }

  /**
   * 获取同情天赋的效果
   * 参考: SKILL_EFFECTS_SPEC.md - SE-COMPASSION-*
   * @private
   */
  getCompassionEffect(effectType, context) {
    switch (effectType) {
      case SkillEffectTypes.SPREAD_PROBABILITY:
        // SE-COMPASSION-01 & SE-COMPASSION-02: 基于财富的传播概率修正
        return compassionEffects.getSpreadProbabilityModifier();

      case SkillEffectTypes.OPPONENT_PROBABILITY:
        // SE-COMPASSION-02: 高财富反对者概率增加
        return compassionEffects.getOpponentProbabilityModifier();

      case SkillEffectTypes.WEALTH_TRANSFER:
        // SE-COMPASSION-03: 财富转移速度减半
        return compassionEffects.getWealthTransferModifier();

      case SkillEffectTypes.COUNTER_ATTACK_SUCCESS:
        // SE-COMPASSION-04: 低财富时反击成功率翻倍
        return compassionEffects.getCounterAttackSuccessModifier();

      case SkillEffectTypes.COUNTER_ATTACK_DAMAGE:
        // SE-COMPASSION-05: 低财富时反击伤害翻倍
        return compassionEffects.getCounterAttackDamageModifier();

      // 以下为已废弃的效果类型，保留用于兼容性
      case SkillEffectTypes.POOR_TO_RICH_SPREAD:
        return 1.0;

      case SkillEffectTypes.GOOD_PERSON_EFFECT:
        return { modifier: 1.0, isCrownedVersion: false };

      default:
        return 1.0;
    }
  }

  /**
   * 检查是否应使用高财富虚伪新闻（同情天赋专用）
   * @returns {boolean}
   */
  shouldUseHypocrisyNews() {
    if (this.isSkillUnlocked('compassion')) {
      return compassionEffects.shouldUseHypocrisyNews();
    }
    
    return false;
  }

  /**
   * 检查财富新闻触发（同情天赋专用）
   * @returns {string|null} 新闻类型或null
   */
  checkWealthNewsTrigger() {
    if (this.isSkillUnlocked('compassion')) {
      return compassionEffects.checkWealthNewsTrigger();
    }
    
    return null;
  }

  /**
   * 检查是否应触发低财富击杀反对者新闻（同情天赋专用）
   * @returns {boolean}
   */
  shouldUseLowWealthKillNews() {
    if (this.isSkillUnlocked('compassion')) {
      return compassionEffects.shouldUseLowWealthKillNews();
    }
    
    return false;
  }

  /**
   * 获取原罪天赋的效果
   * 参考: SKILL_EFFECTS_SPEC.md - SE-ORIGINAL_SIN-*
   * @private
   */
  getOriginalSinEffect(effectType, context) {
    switch (effectType) {
      case SkillEffectTypes.SPREAD_PROBABILITY:
        // SE-ORIGINAL_SIN-01: 传播概率翻倍
        return originalSinEffects.getSpreadProbabilityModifier();

      default:
        return 1.0;
    }
  }
}
