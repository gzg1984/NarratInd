// events.js - 事件系统配置

import { isWealthyCountry, isPoorCountry, getBelieverRatio, getNonBelievers } from './countryData.js';
import { getEventConfig, getBelieverRatioMultiplier } from './gameConfig.js';

/**
 * 事件类型定义
 * 每个事件包含：
 * - id: 事件唯一标识
 * - name: 事件名称
 * - baseChance: 基础触发概率 (0-1)
 * - conditions: 触发条件检查函数（可选）
 * - calculate: 效果计算函数，返回 { triggered, believers, wealthChange? }
 */

export const eventTypes = {
  // === 基础事件 ===
  
  base_spread: {
    id: 'base_spread',
    name: '基础传播',
    
    calculate: (country, skillTree) => {
      // 100% 触发
      
      // 信徒数量+50%
      let growth = Math.ceil(country.believers * 0.5);
      
      // ⭐ 上限：不能超过国家总人口的0.5%
      const maxGrowth = Math.ceil(country.population * 0.005);
      growth = Math.min(growth, maxGrowth);
      
      // 最少保证1人
      const believers = Math.max(1, growth);
      
      return {
        triggered: true,
        believers: believers
      };
    }
  },
  
  self_spread: {
    id: 'self_spread',
    name: '自发传播',
    
    calculate: (country, skillTree) => {
      // 获取配置
      const config = getEventConfig('selfSpread');
      
      // === 1. 基础概率计算 ===
      let chance = config.baseChance;
      
      // 信徒数量影响：信徒越多，概率越高
      const believerRatio = getBelieverRatio(country);
      const believerCount = country.believers;
      
      // 信徒数量加成（每10万信徒增加配置的百分比，有上限）
      const believerBonus = Math.min(
        believerCount / 100000 * config.believerBonus, 
        config.believerBonusMax
      );
      chance += believerBonus;
      
      // === 2. 财富度影响（穷国更容易传播）===
      // 财富等级 1-10，等级越低传播越容易
      const wealthPenalty = country.wealthLevel / 10; // 0.1 到 1.0
      chance *= (1.1 - wealthPenalty); // 贫穷国家(level 1): ×1.0, 富裕国家(level 10): ×0.1
      
      // === 3. 信徒占比影响（占比越高，效果越好）===
      const effectMultiplier = getBelieverRatioMultiplier(believerRatio);
      
      // === 4. 脱教者惩罚 ===
      // penalty = 0.5^(apostates/totalApostates)
      // 需要从gameState获取全局脱教者总数
      let apostatePenalty = 1.0;
      if (country.apostates > 0 && gameState && gameState.getTotalApostates) {
        const totalApostates = gameState.getTotalApostates();
        if (totalApostates > 0) {
          const apostateRatio = country.apostates / totalApostates;
          apostatePenalty = Math.pow(0.5, apostateRatio);
          chance *= apostatePenalty;
        }
      }
      
      // === 5. 天赋修正 ===
      
      // ⭐ 同情天赋：基于财富的传播概率修正（SE-COMPASSION-01 & SE-COMPASSION-02）
      if (gameState && gameState.getSkillModifier) {
        const spreadModifier = gameState.getSkillModifier('spread_probability');
        chance *= spreadModifier;
      }
      
      // ⭐ s_priest: 神父 - 所有传播概率×2
      if (skillTree.hasSkill('s_priest')) {
        chance *= 2.0;
      }
      
      // ⭐ s_aesthetics: 美学 - 所有地区×2，富裕地区再×2，教团财富>10再×2
      if (skillTree.hasSkill('s_aesthetics')) {
        chance *= 2.0; // 基础×2
        if (isWealthyCountry(country)) {
          chance *= 2.0; // 富裕地区再×2
        }
        if (gameState && gameState.wealth > 10) {
          chance *= 2.0; // 教团财富>10再×2
        }
      }
      
      // ⭐ s_progress: 进步主义 - 所有传播×4
      if (skillTree.hasSkill('s_progress')) {
        chance *= 4.0;
      }
      
      // s_chosen: 神选 - 富国更高概率，信徒翻倍
      if (skillTree.hasSkill('s_priest')) {
        chance *= 2.0;
      }
      
      // s_chosen: 神选 - 富国更高概率
      if (skillTree.hasSkill('s_chosen') && isWealthyCountry(country)) {
        chance *= 2.0; // 概率翻倍
        effectMultiplier *= 2; // 效果翻倍
      }
      
      // s_dogma: 教条 - 提高概率和效果
      if (skillTree.hasSkill('s_dogma')) {
        chance *= 1.5;
        effectMultiplier *= 2;
      }
      
      // s_progress: 进步主义 - 富国极高概率
      if (skillTree.hasSkill('s_progress') && isWealthyCountry(country)) {
        chance *= 3.0; // 富国极高概率
        effectMultiplier *= 2;
      }
      
      // s_replace: 替换 - <50%地区更高概率
      if (skillTree.hasSkill('s_replace') && believerRatio < 0.5) {
        chance *= 2.0;
        effectMultiplier *= 2;
      }
      
      // === 6. 概率检测 ===
      if (Math.random() < chance) {
        // 基础增长：当前信徒的配置百分比
        const baseGrowth = Math.ceil(country.believers * config.baseGrowthRate);
        const believers = Math.ceil(baseGrowth * effectMultiplier);
        
        return {
          triggered: true,
          believers: believers
        };
      }
      
      return { triggered: false };
    }
  },
  
  attract_dissatisfied: {
    id: 'attract_dissatisfied',
    name: '吸引不满者',
    
    // 条件：信徒占比 < 50%
    conditions: (country) => getBelieverRatio(country) < 0.5,
    
    calculate: (country, skillTree) => {
      // 获取配置
      const config = getEventConfig('attractDissatisfied');
      
      // === 1. 基础概率计算 ===
      let chance = config.baseChance;
      
      const believerRatio = getBelieverRatio(country);
      
      // === 2. 财富度影响（穷国更容易产生不满）===
      // 财富等级越低，不满者越多，概率越高
      const wealthFactor = (11 - country.wealthLevel) / 10; // 1.0 到 0.1
      chance *= wealthFactor; // 贫穷国家: ×1.0, 富裕国家: ×0.1
      
      // === 3. 信徒占比影响效果 ===
      // 注意：此事件只在<50%时触发，所以只使用前3档
      let effectMultiplier = getBelieverRatioMultiplier(believerRatio);
      
      // === 4. 脱教者惩罚 ===
      if (country.apostates > 0 && gameState && gameState.getTotalApostates) {
        const totalApostates = gameState.getTotalApostates();
        if (totalApostates > 0) {
          const apostateRatio = country.apostates / totalApostates;
          const apostatePenalty = Math.pow(0.5, apostateRatio);
          chance *= apostatePenalty;
        }
      }
      
      // === 5. 天赋修正 ===
      
      // ⭐ 同情天赋：基于财富的传播概率修正（SE-COMPASSION-01 & SE-COMPASSION-02）
      if (gameState && gameState.getSkillModifier) {
        const spreadModifier = gameState.getSkillModifier('spread_probability');
        chance *= spreadModifier;
      }
      
      // s_fair: 公平 - 贫穷国家更高概率
      if (skillTree.hasSkill('s_fair') && isPoorCountry(country)) {
        chance *= 2.0; // 概率翻倍
        effectMultiplier *= 2; // 效果翻倍
      }
      
      // s_dogma: 教条 - 提高概率和效果
      if (skillTree.hasSkill('s_dogma')) {
        chance *= 1.5;
        effectMultiplier *= 2;
      }
      
      // s_conspiracy: 阴谋论 - 所有国家提高概率
      if (skillTree.hasSkill('s_conspiracy')) {
        chance *= 2.0;
        effectMultiplier *= 2;
      }
      
      // === 6. 概率检测 ===
      if (Math.random() < chance) {
        const nonBelievers = getNonBelievers(country);
        // 基础：非信徒的配置百分比
        const baseGrowth = Math.ceil(nonBelievers * config.baseGrowthRate);
        const believers = Math.ceil(baseGrowth * effectMultiplier);
        
        return {
          triggered: true,
          believers: believers
        };
      }
      
      return { triggered: false };
    }
  },
  
  real_help: {
    id: 'real_help',
    name: '真实帮助',
    
    calculate: (country, skillTree) => {
      // 获取配置
      const config = getEventConfig('realHelp');
      
      // === 1. 基础概率计算 ===
      let chance = config.baseChance;
      
      const believerRatio = getBelieverRatio(country);
      
      // === 2. GDP影响（贫困国家好人事件减少）===
      // 当前GDP与原始GDP的比率
      const gdpRatio = country.gdp / country.originalGdp;
      chance *= gdpRatio; // GDP降到50%，好人事件概率减半
      
      // 额外的：财富等级越低，单次帮助的效果越小（穷国资源匮乏）
      const wealthFactor = (11 - country.wealthLevel) / 10;
      chance *= (0.5 + wealthFactor); // 叠加原有的财富影响
      
      // === 3. 基础效果 ===
      let believers = config.baseGrowth; // 固定基础增长
      
      // ⭐ 同情天赋：真实帮助基础人数修正（SE-COMPASSION-06）
      let hasCompassionBonus = false;
      if (gameState && gameState.getSkillModifier) {
        const realHelpModifier = gameState.getSkillModifier('real_help_base_growth');
        if (realHelpModifier > 1.0) {
          hasCompassionBonus = true;
        }
        believers = Math.ceil(believers * realHelpModifier);
      }
      
      let wealthChange = 0;
      
      // === 4. 信徒占比影响效果 ===
      let effectMultiplier = getBelieverRatioMultiplier(believerRatio);
      
      // === 5. 脱教者惩罚 ===
      if (country.apostates > 0 && gameState && gameState.getTotalApostates) {
        const totalApostates = gameState.getTotalApostates();
        if (totalApostates > 0) {
          const apostateRatio = country.apostates / totalApostates;
          const apostatePenalty = Math.pow(0.5, apostateRatio);
          chance *= apostatePenalty;
        }
      }
      
      // === 6. 天赋修正 ===
      
      // ⭐ 同情天赋：基于财富的传播概率修正（SE-COMPASSION-01 & SE-COMPASSION-02）
      if (gameState && gameState.getSkillModifier) {
        const spreadModifier = gameState.getSkillModifier('spread_probability');
        chance *= spreadModifier;
      }
      
      // ⭐ s_priest: 神父 - 所有传播概率×2
      if (skillTree.hasSkill('s_priest')) {
        chance *= 2.0;
      }
      
      // ⭐ s_aesthetics: 美学 - 所有地区×2，富裕地区再×2，教团财富>10再×2
      if (skillTree.hasSkill('s_aesthetics')) {
        chance *= 2.0; // 基础×2
        if (isWealthyCountry(country)) {
          chance *= 2.0; // 富裕地区再×2
        }
        if (gameState && gameState.wealth > 10) {
          chance *= 2.0; // 教团财富>10再×2
        }
      }
      
      // ⭐ s_progress: 进步主义 - 所有传播×4
      if (skillTree.hasSkill('s_progress')) {
        chance *= 4.0;
      }
      
      // ⭐ charity: 慈善募捐 - 低财富时真实帮助概率翻倍，富裕国家再翻倍
      if (skillTree.hasSkill('charity')) {
        const currentWealth = gameState ? gameState.wealth : 10;
        if (currentWealth < 10) {
          chance *= 2.0; // 低财富时概率×2
          console.log(`💝 慈善募捐：低财富(${currentWealth})真实帮助概率×2`);
        }
        
        // 富裕国家（GDP>80%原始值）再翻倍
        if (gdpRatio > 0.8) {
          chance *= 2.0;
          console.log(`💝 慈善募捐：富裕国家(GDP ${(gdpRatio*100).toFixed(0)}%)真实帮助概率再×2`);
        }
      }
      
      // s_family: 家族传播 - 大幅提高概率和财富
      if (skillTree.hasSkill('s_family')) {
        chance *= 4.0; // 大幅提高概率
        effectMultiplier *= 1.5;
        wealthChange += Math.floor(believers * effectMultiplier * 0.2);
      }
      
      // === 7. 概率检测 ===
      if (Math.random() < chance) {
        let finalBelievers = Math.ceil(believers * effectMultiplier);
        
        // ⭐ 同情天赋：真实帮助叠加一次自我传播（SE-COMPASSION-07）
        if (hasCompassionBonus) {
          const selfSpreadConfig = getEventConfig('selfSpread');
          const selfSpreadGrowth = Math.ceil(country.believers * selfSpreadConfig.baseGrowthRate);
          finalBelievers += selfSpreadGrowth;
          console.log(`⭐ 同情天赋增强：真实帮助 ${Math.ceil(believers * effectMultiplier)} + 自我传播 ${selfSpreadGrowth} = ${finalBelievers}`);
        }
        
        return {
          triggered: true,
          believers: finalBelievers,
          wealthChange: wealthChange
        };
      }
      
      return { triggered: false };
    }
  },
  
  // === 跨国传播事件 ===
  
  cross_border_spread: {
    id: 'cross_border_spread',
    name: '跨国传播',
    
    // 条件：信徒占比 > 50%
    conditions: (country) => getBelieverRatio(country) > 0.5,
    
    calculate: (country, skillTree, gameState) => {
      // 获取配置
      const config = getEventConfig('crossBorder');
      
      // === 1. 基础概率 ===
      let chance = config.baseChance;
      
      const believerRatio = getBelieverRatio(country);
      
      // === 2. 信徒占比影响（占比越高，越容易向外传播）===
      if (believerRatio > 0.8) {
        chance *= 3.0; // 80%以上：×3
      } else if (believerRatio > 0.7) {
        chance *= 2.0; // 70-80%：×2
      } else if (believerRatio > 0.6) {
        chance *= 1.5; // 60-70%：×1.5
      }
      // 50-60%：保持基础概率
      
      // === 3. 财富度影响（穷国更容易向外传播）===
      const wealthFactor = (11 - country.wealthLevel) / 10;
      chance *= (0.7 + wealthFactor * 0.6); // 贫穷: ×1.3, 富裕: ×0.7
      
      // === 4. 天赋修正 ===
      
      // ⭐ 同情天赋：基于财富的传播概率修正（SE-COMPASSION-01 & SE-COMPASSION-02）
      if (gameState && gameState.getSkillModifier) {
        const spreadModifier = gameState.getSkillModifier('spread_probability');
        chance *= spreadModifier;
      }
      
      // ⭐ s_priest: 神父 - 所有传播概率×2
      if (skillTree.hasSkill('s_priest')) {
        chance *= 2.0;
      }
      
      // ⭐ s_aesthetics: 美学 - 所有地区×2，富裕地区再×2，教团财富>10再×2
      if (skillTree.hasSkill('s_aesthetics')) {
        chance *= 2.0; // 基础×2
        if (isWealthyCountry(country)) {
          chance *= 2.0; // 富裕地区再×2
        }
        if (gameState && gameState.wealth > 10) {
          chance *= 2.0; // 教团财富>10再×2
        }
      }
      
      // ⭐ s_progress: 进步主义 - 所有传播×4
      if (skillTree.hasSkill('s_progress')) {
        chance *= 4.0;
      }
      
      // s_slavery: 奴隶制 - 富国向穷国传播概率增加
      if (skillTree.hasSkill('s_slavery') && isWealthyCountry(country)) {
        chance *= 2.5; // 富国传播概率大幅提高
      }
      
      // s_refugee: 难民 - 穷国向富国传播
      if (skillTree.hasSkill('s_refugee') && isPoorCountry(country)) {
        chance *= 2.5; // 穷国传播概率大幅提高
      }
      
      // === 5. 概率检测 ===
      if (Math.random() < chance) {
        // 在 GameState 中处理跨国传播逻辑
        return {
          triggered: true,
          crossBorder: true, // 标记为跨国事件
          sourceCountry: country.id
        };
      }
      
      return { triggered: false };
    }
  },
  
  // === 财富削减事件（负面效果） ===
  
  wealth_drain: {
    id: 'wealth_drain',
    name: '财富流失',
    baseChance: 0, // 默认不触发，需要天赋激活
    
    calculate: (country, skillTree, gameState) => {
      let triggered = false;
      let wealthChange = 0;
      
      const ratio = getBelieverRatio(country);
      
      // 腐化：信徒>50%地区削减财富
      if (skillTree.hasSkill('s_corrupt') && ratio > 0.5) {
        triggered = true;
        wealthChange = -Math.floor(country.population * 0.00001); // 削减少量财富
      }
      
      // 割裂：信徒>50%地区削减财富
      if (skillTree.hasSkill('s_divide') && ratio > 0.5) {
        triggered = true;
        wealthChange -= Math.floor(country.population * 0.00001);
      }
      
      // 替换：信徒<50%地区削减财富
      if (skillTree.hasSkill('s_replace') && ratio < 0.5) {
        triggered = true;
        wealthChange -= Math.floor(country.population * 0.00002);
      }
      
      // 难民：穷国向富国传播，拉低富国财富
      if (skillTree.hasSkill('s_refugee') && isWealthyCountry(country) && ratio > 0.3) {
        triggered = true;
        wealthChange -= Math.floor(country.population * 0.00005);
      }
      
      if (triggered && wealthChange < 0) {
        return {
          triggered: true,
          believers: 0,
          wealthChange: wealthChange
        };
      }
      
      return { triggered: false };
    }
  },
  
  // === 信徒流失事件（新增：贫困导致信仰崩溃） ===
  
  believer_loss: {
    id: 'believer_loss',
    name: '信徒流失',
    
    calculate: (country, skillTree, gameState) => {
      // 动态导入配置
      return import('./gameConfig.js').then(module => {
        const lossConfig = module.getBelieverLossConfig();
        
        if (!lossConfig.enabled) {
          return { triggered: false };
        }
        
        const believerRatio = getBelieverRatio(country);
        const gdpRatio = country.gdp / country.originalGdp;
        
        // 触发条件：高信徒占比 + 低GDP
        if (believerRatio < lossConfig.minBelieverRatio || gdpRatio >= lossConfig.maxGdpRatio) {
          return { triggered: false };
        }
        
        // 计算流失量：GDP越低，流失越严重
        // 流失率 = 基础流失率 × (1 - GDP比率)
        const lossMultiplier = 1 - gdpRatio;
        const lossRate = lossConfig.baseLossRate * lossMultiplier;
        const believersLost = Math.ceil(country.believers * lossRate);
        
        console.log(`⚠️ ${country.id} 信徒流失: GDP${(gdpRatio*100).toFixed(0)}%, 流失${believersLost.toLocaleString()}人`);
        
        return {
          triggered: true,
          believers: -believersLost, // 负数表示减少
          wealthChange: 0,
          message: `经济崩溃导致信徒流失！-${believersLost.toLocaleString()}`
        };
      });
    }
  }
};

/**
 * 获取所有可用的事件类型
 * @returns {Array} 事件类型数组
 */
export function getAllEventTypes() {
  return Object.values(eventTypes);
}

/**
 * 根据ID获取事件类型
 * @param {string} eventId - 事件ID
 * @returns {Object|null} 事件类型对象
 */
export function getEventType(eventId) {
  return eventTypes[eventId] || null;
}

/**
 * 处理单个国家的所有事件
 * @param {Object} country - 国家对象
 * @param {Object} skillTree - 技能树实例
 * @param {Object} gameState - 游戏状态实例
 * @param {boolean} isFullyConverted - 国家是否已100%信教
 * @returns {Array} 触发的事件结果数组
 */
export function processCountryEvents(country, skillTree, gameState, isFullyConverted = false) {
  const triggeredEvents = [];
  
  // 遍历所有事件类型
  for (const eventType of getAllEventTypes()) {
    // 如果国家已100%信教，跳过内部传播事件（自发传播、吸引不满者、真实帮助）
    if (isFullyConverted && 
        (eventType.id === 'self_spread' || 
         eventType.id === 'attract_dissatisfied' || 
         eventType.id === 'real_help')) {
      continue;
    }
    
    // 检查条件
    if (eventType.conditions && !eventType.conditions(country)) {
      continue;
    }
    
    // 尝试触发事件
    const result = eventType.calculate(country, skillTree, gameState);
    
    if (result.triggered) {
      triggeredEvents.push({
        eventId: eventType.id,
        eventName: eventType.name,
        countryId: country.id,
        believers: result.believers || 0,
        wealthChange: result.wealthChange || 0,
        crossBorder: result.crossBorder || false,
        sourceCountry: result.sourceCountry
      });
    }
  }
  
  return triggeredEvents;
}
