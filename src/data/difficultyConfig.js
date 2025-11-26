/**
 * 游戏难度配置
 * 
 * 定义不同难度下的各种阈值和参数
 */

export const DifficultyLevels = {
  EASY: 'easy',
  NORMAL: 'normal',
  HARD: 'hard'
};

/**
 * 难度配置参数
 */
export const difficultyConfigs = {
  // 简单难度（未来实现）
  easy: {
    name: '简单',
    description: '更温和的传播环境',
    
    // 反对者阈值
    opponentThresholds: {
      countryBelieverRatio: 0.7,    // 国家信徒占比30%开始产生反对者
      globalBelieverRatio: 0.7,     // 全球信徒占比30%允许任意国家产生反对者
      minCountryBelievers: 50000    // 国家最低信徒数（防止小国家过早产生）
    },
    
    // 反对者强度
    opponentStrength: {
      healthMultiplier: 0.8,        // 血量×0.8
      damageMultiplier: 0.8,        // 伤害×0.8
      probabilityMultiplier: 0.7    // 出现概率×0.7
    }
  },
  
  // 普通难度（当前实现）
  normal: {
    name: '普通',
    description: '平衡的游戏体验',
    
    // 反对者阈值
    opponentThresholds: {
      countryBelieverRatio: 0.5,    // 国家信徒占比50%开始产生反对者
      globalBelieverRatio: 0.5,     // 全球信徒占比50%允许任意国家产生反对者
      minCountryBelievers: 50000    // 国家最低信徒数（防止小国家过早产生）
    },
    
    // 反对者强度
    opponentStrength: {
      healthMultiplier: 1.0,        // 血量×1.0
      damageMultiplier: 1.0,        // 伤害×1.0
      probabilityMultiplier: 1.0    // 出现概率×1.0
    }
  },
  
  // 困难难度（未来实现）
  hard: {
    name: '困难',
    description: '激烈的思想斗争',
    
    // 反对者阈值
    opponentThresholds: {
      countryBelieverRatio: 0.3,    // 国家信徒占比30%开始产生反对者
      globalBelieverRatio: 0.3,     // 全球信徒占比30%允许任意国家产生反对者
      minCountryBelievers: 20000    // 国家最低信徒数
    },
    
    // 反对者强度
    opponentStrength: {
      healthMultiplier: 1.3,        // 血量×1.3
      damageMultiplier: 1.2,        // 伤害×1.2
      probabilityMultiplier: 1.5    // 出现概率×1.5
    }
  }
};

/**
 * 当前难度（默认普通）
 */
let currentDifficulty = DifficultyLevels.NORMAL;

/**
 * 获取当前难度配置
 * @returns {Object} 当前难度的配置对象
 */
export function getCurrentDifficultyConfig() {
  return difficultyConfigs[currentDifficulty];
}

/**
 * 设置游戏难度
 * @param {string} difficulty - 难度级别
 */
export function setDifficulty(difficulty) {
  if (difficultyConfigs[difficulty]) {
    currentDifficulty = difficulty;
    console.log(`🎮 难度设置为: ${difficultyConfigs[difficulty].name}`);
  } else {
    console.warn(`⚠️ 未知难度: ${difficulty}，保持当前难度`);
  }
}

/**
 * 获取当前难度名称
 * @returns {string}
 */
export function getCurrentDifficultyName() {
  return difficultyConfigs[currentDifficulty].name;
}

/**
 * 检查国家是否满足反对者出现条件
 * @param {Object} country - 国家对象
 * @param {number} globalBelieverRatio - 全球信徒占比
 * @returns {boolean}
 */
export function canSpawnOpponentInCountry(country, globalBelieverRatio) {
  const config = getCurrentDifficultyConfig();
  const thresholds = config.opponentThresholds;
  
  // 条件1: 国家信徒数量足够
  if (country.believers < thresholds.minCountryBelievers) {
    return false;
  }
  
  // 条件2: 国家信徒占比达到阈值
  const countryBelieverRatio = country.believers / country.population;
  if (countryBelieverRatio < thresholds.countryBelieverRatio) {
    return false;
  }
  
  // 条件3: 全球信徒占比达到阈值（如果未达到，只在本国已达标的国家产生）
  // 如果全球占比已达标，则任意满足条件1和2的国家都可以产生
  if (globalBelieverRatio < thresholds.globalBelieverRatio) {
    // 全球未达标，只在本国信徒占比很高的国家产生
    return countryBelieverRatio >= thresholds.countryBelieverRatio;
  }
  
  return true;
}

/**
 * 获取反对者强度修正
 * @returns {Object} { healthMultiplier, damageMultiplier, probabilityMultiplier }
 */
export function getOpponentStrengthModifiers() {
  return getCurrentDifficultyConfig().opponentStrength;
}
