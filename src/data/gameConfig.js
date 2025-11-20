// gameConfig.js - 游戏配置文件

/**
 * 游戏配置模式
 * 在这里切换 'production' 或 'testing'
 */
export const CONFIG_MODE = 'testing'; // 改为 'production' 使用正式配置

/**
 * 正式配置 - 用于正常游戏
 */
const productionConfig = {
  // 回合间隔（毫秒）
  turnInterval: 2000,
  
  // 事件基础概率
  events: {
    selfSpread: {
      baseChance: 0.2,        // 20% 基础概率
      believerBonus: 0.01,    // 每10万信徒 +1%
      believerBonusMax: 0.5,  // 信徒加成上限 +50%
      baseGrowthRate: 0.01    // 基础增长率 1%
    },
    attractDissatisfied: {
      baseChance: 0.15,       // 15% 基础概率
      baseGrowthRate: 0.01    // 基础增长率 1%
    },
    realHelp: {
      baseChance: 0.1,        // 10% 基础概率
      baseGrowth: 50          // 固定增长 50 信徒
    },
    crossBorder: {
      baseChance: 0.08,       // 8% 基础概率
      initialBelievers: 10    // 新国家初始信徒数
    }
  },
  
  // 信徒占比效果倍数
  believerRatioMultiplier: {
    tier1: { threshold: 0.2, multiplier: 1 },
    tier2: { threshold: 0.4, multiplier: 3 },
    tier3: { threshold: 0.6, multiplier: 9 },
    tier4: { threshold: 0.8, multiplier: 20 },
    tier5: { threshold: 1.0, multiplier: 50 }
  },
  
  // 游戏开始
  gameStart: {
    initialBelievers: 100     // 起始信徒数
  },
  
  // 财富转移（新系统）
  wealthTransfer: {
    baseTransferRate: 0.01,   // 基础转移率 1%（100回合转移100%）
    minWealthRatio: 0.05,     // 财富下限（原始GDP的5%，可被技能打破）
    skillCanBreakLimit: true  // 技能是否可以打破下限
  },
  
  // 信徒流失配置
  believerLoss: {
    enabled: true,
    minBelieverRatio: 0.5,    // 最小信徒占比触发条件
    maxGdpRatio: 0.3,         // 最大GDP比率触发条件（<30%原始GDP）
    baseLossRate: 0.02        // 基础流失率 2%
  }
};

/**
 * 测试配置 - 用于快速测试
 */
const testingConfig = {
  // 回合间隔（毫秒）
  turnInterval: 1000,         // 更快的回合间隔
  
  // 事件基础概率（更高）
  events: {
    selfSpread: {
      baseChance: 0.8,        // 80% 基础概率
      believerBonus: 0.05,    // 每10万信徒 +5%
      believerBonusMax: 2.0,  // 信徒加成上限 +200%
      baseGrowthRate: 0.05    // 基础增长率 5%（更快）
    },
    attractDissatisfied: {
      baseChance: 0.7,        // 70% 基础概率
      baseGrowthRate: 0.05    // 基础增长率 5%
    },
    realHelp: {
      baseChance: 0.6,        // 60% 基础概率
      baseGrowth: 500         // 固定增长 500 信徒（10倍）
    },
    crossBorder: {
      baseChance: 0.08,       // 8% 基础概率（与正式模式一致，方便观察国境限制）
      initialBelievers: 1000  // 新国家初始信徒数（100倍）
    }
  },
  
  // 信徒占比效果倍数（测试时更夸张）
  believerRatioMultiplier: {
    tier1: { threshold: 0.2, multiplier: 2 },
    tier2: { threshold: 0.4, multiplier: 5 },
    tier3: { threshold: 0.6, multiplier: 15 },
    tier4: { threshold: 0.8, multiplier: 40 },
    tier5: { threshold: 1.0, multiplier: 100 }
  },
  
  // 游戏开始
  gameStart: {
    initialBelievers: 10000   // 起始信徒数（100倍）
  },
  
  // 财富转移（新系统，测试模式下转移更快）
  wealthTransfer: {
    baseTransferRate: 0.05,   // 基础转移率 5%（20回合转移100%，方便测试）
    minWealthRatio: 0.05,     // 财富下限（原始GDP的5%）
    skillCanBreakLimit: true  // 技能是否可以打破下限
  },
  
  // 信徒流失配置
  believerLoss: {
    enabled: true,
    minBelieverRatio: 0.5,    // 最小信徒占比触发条件
    maxGdpRatio: 0.3,         // 最大GDP比率触发条件
    baseLossRate: 0.05        // 基础流失率 5%（测试模式更明显）
  }
};

/**
 * 获取当前配置
 */
export function getConfig() {
  return CONFIG_MODE === 'testing' ? testingConfig : productionConfig;
}

/**
 * 获取事件配置
 */
export function getEventConfig(eventType) {
  const config = getConfig();
  return config.events[eventType];
}

/**
 * 获取信徒占比倍数
 * @param {number} ratio - 信徒占比 (0-1)
 * @returns {number} 效果倍数
 */
export function getBelieverRatioMultiplier(ratio) {
  const config = getConfig();
  const multipliers = config.believerRatioMultiplier;
  
  if (ratio < multipliers.tier1.threshold) {
    return multipliers.tier1.multiplier;
  } else if (ratio < multipliers.tier2.threshold) {
    return multipliers.tier2.multiplier;
  } else if (ratio < multipliers.tier3.threshold) {
    return multipliers.tier3.multiplier;
  } else if (ratio < multipliers.tier4.threshold) {
    return multipliers.tier4.multiplier;
  } else {
    return multipliers.tier5.multiplier;
  }
}

/**
 * 获取回合间隔
 */
export function getTurnInterval() {
  return getConfig().turnInterval;
}

/**
 * 获取游戏开始配置
 */
export function getGameStartConfig() {
  return getConfig().gameStart;
}

/**
 * 获取财富转移配置
 */
export function getWealthTransferConfig() {
  return getConfig().wealthTransfer;
}

/**
 * 获取信徒流失配置
 */
export function getBelieverLossConfig() {
  return getConfig().believerLoss;
}
