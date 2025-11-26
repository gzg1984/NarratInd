/**
 * 同情天赋效果实现
 * 
 * 所有效果的计算算法详见: /SKILL_EFFECTS_SPEC.md
 * - SE-COMPASSION-01: 低财富传播加成（贫穷的力量）
 * - SE-COMPASSION-02: 高财富传播惩罚（富裕的诅咒）
 * - SE-COMPASSION-03: 财富转移速度减半
 */

// 追踪财富状态，用于触发首次新闻
let wealthStateTracking = {
  lastState: null, // 'low' | 'high' | 'normal'
  lowWealthNewsTriggered: false,
  highWealthNewsTriggered: false
};

// 全局 gameState 引用（由 SkillEffectManager 设置）
let gameStateRef = null;

/**
 * 设置 gameState 引用
 * @param {Object} gameState - gameState 实例
 */
export function setGameStateRef(gameState) {
  gameStateRef = gameState;
}

/**
 * SE-COMPASSION-01 & SE-COMPASSION-02: 基于财富的传播概率修正
 * 财富 < 10: 传播概率 × 2
 * 财富 > 10: 传播概率 × 0.5
 * 
 * @returns {number} 传播概率修正系数
 */
export function getSpreadProbabilityModifier() {
  const wealth = gameStateRef ? gameStateRef.wealth || 0 : 0;
  
  if (wealth < 10) {
    // 标记低财富状态
    if (wealthStateTracking.lastState !== 'low') {
      wealthStateTracking.lastState = 'low';
    }
    return 2.0;
  }
  
  if (wealth > 10) {
    // 标记高财富状态
    if (wealthStateTracking.lastState !== 'high') {
      wealthStateTracking.lastState = 'high';
    }
    return 0.5;
  }
  
  wealthStateTracking.lastState = 'normal';
  return 1.0;
}

/**
 * SE-COMPASSION-02: 基于财富的反对者概率调整
 * 财富 < 10: 反对者概率 × 0.5 (降低)
 * 财富 > 10: 反对者概率 × 1.5 (增加)
 * 
 * @returns {number} 反对者概率修正系数
 */
export function getOpponentProbabilityModifier() {
  const wealth = gameStateRef ? gameStateRef.wealth || 0 : 0;
  
  if (wealth < 10) {
    // 贫穷时，反对者出现概率降低
    return 0.5;
  }
  
  if (wealth > 10) {
    // 富裕时，反对者出现概率增加
    return 1.5;
  }
  
  return 1.0;
}

/**
 * SE-COMPASSION-03: 财富转移速度减半
 * 返回修正系数0.5，差额将返还给国家
 * 
 * @returns {number} 财富转移修正系数
 */
export function getWealthTransferModifier() {
  return 0.5;
}

/**
 * 检查当前财富状态，用于触发新闻
 * 仅在同情天赋解锁后首次检查时触发（无论财富多少）
 * 
 * @returns {string|null} 'low_wealth_boost' | null
 */
export function checkWealthNewsTrigger() {
  const wealth = gameStateRef ? gameStateRef.wealth || 0 : 0;
  
  console.log(`🔍 checkWealthNewsTrigger 调用: wealth=${wealth}, triggered=${wealthStateTracking.lowWealthNewsTriggered}`);
  
  // 只有财富 < 10 且之前未触发过，才触发新闻
  if (wealth < 10 && !wealthStateTracking.lowWealthNewsTriggered) {
    wealthStateTracking.lowWealthNewsTriggered = true;
    console.log('⭐ 触发低财富新闻条件满足');
    return 'low_wealth_boost';
  }
  
  console.log(`❌ 不触发新闻: wealth=${wealth}, triggered=${wealthStateTracking.lowWealthNewsTriggered}`);
  return null;
}

/**
 * 检查是否应使用高财富虚伪新闻（反对者失败时）
 * 
 * @returns {boolean}
 */
export function shouldUseHypocrisyNews() {
  const wealth = gameStateRef ? gameStateRef.wealth || 0 : 0;
  return wealth > 10;
}

/**
 * SE-COMPASSION-04: 低财富时反击成功率翻倍
 * 财富 < 10: 反击成功率 × 2.0
 * 
 * @returns {number} 反击成功率修正系数
 */
export function getCounterAttackSuccessModifier() {
  const wealth = gameStateRef ? gameStateRef.wealth || 0 : 0;
  
  if (wealth < 10) {
    return 2.0;
  }
  
  return 1.0;
}

/**
 * SE-COMPASSION-05: 低财富时反击伤害翻倍
 * 财富 < 10: 反击伤害 × 2.0
 * 
 * @returns {number} 反击伤害修正系数
 */
export function getCounterAttackDamageModifier() {
  const wealth = gameStateRef ? gameStateRef.wealth || 0 : 0;
  
  if (wealth < 10) {
    return 2.0;
  }
  
  return 1.0;
}

/**
 * 检查是否应触发低财富击杀反对者的特殊新闻
 * 财富 < 10 时，击杀反对者触发特殊新闻
 * 
 * @returns {boolean}
 */
export function shouldUseLowWealthKillNews() {
  const wealth = gameStateRef ? gameStateRef.wealth || 0 : 0;
  return wealth < 10;
}

/**
 * 重置财富状态追踪（用于新游戏或测试）
 */
export function resetWealthTracking() {
  console.log(`🔄 重置财富状态追踪`);
  wealthStateTracking.lastState = null;
  wealthStateTracking.lowWealthNewsTriggered = false;
  wealthStateTracking.highWealthNewsTriggered = false;
  console.log(`✅ 财富状态已重置: triggered=${wealthStateTracking.lowWealthNewsTriggered}`);
}
