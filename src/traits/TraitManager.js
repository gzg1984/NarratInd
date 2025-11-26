/**
 * 初始特性管理器
 * 负责应用和管理玩家选择的初始特性效果
 */

import { getTraitById } from './traitConfig.js';

export class TraitManager {
  constructor() {
    this.selectedTrait = null;
  }

  /**
   * 设置选中的特性
   */
  setTrait(traitId) {
    this.selectedTrait = getTraitById(traitId);
    console.log(`🎯 选择初始特性: ${this.selectedTrait?.name || '无'}`);
  }

  /**
   * 获取当前特性
   */
  getTrait() {
    return this.selectedTrait;
  }

  /**
   * 检查是否有某个特性
   */
  hasTrait(traitId) {
    return this.selectedTrait?.id === traitId;
  }

  /**
   * 获取初始财富加成
   */
  getInitialWealthBonus() {
    return this.selectedTrait?.effects?.initialWealth || 0;
  }

  /**
   * 获取传播概率修正
   */
  getSpreadProbabilityModifier() {
    return this.selectedTrait?.effects?.spreadProbability || 1.0;
  }

  /**
   * 应用特性到游戏状态（游戏开始时调用）
   */
  applyToGameState(gameState) {
    if (!this.selectedTrait) return;

    const effects = this.selectedTrait.effects;
    
    // 应用初始财富
    if (effects.initialWealth) {
      gameState.wealth += effects.initialWealth;
      console.log(`💰 初始特性：财富+${effects.initialWealth} (总计${gameState.wealth})`);
    }

    // 未来可以添加更多效果应用逻辑
  }

  /**
   * 重置特性选择
   */
  reset() {
    this.selectedTrait = null;
  }
}
