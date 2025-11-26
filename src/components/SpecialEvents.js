// SpecialEvents.js - 特殊事件系统（可复用框架）

/**
 * 特殊事件类型定义
 */
export const SpecialEventTypes = {
  GOOD_PERSON: {
    id: 'good_person',
    name: '好人出现',
    icon: '👤', // 白色背景的人像
    iconClass: 'good-person-icon', // 自定义样式类
    duration: 10000, // 持续时间（毫秒）- 10秒
    probability: 0.05, // 每回合每个已感染国家的触发概率（5%）
    // testingProbability: 0.4, // 已禁用：测试模式下也使用正式概率
    maxGlobalInstances: 1, // 全球同时最多个实例（与其他事件共享）
    onlyInfected: true, // 只在已感染地区出现
    minBelieverRatio: 0.01, // 最小信徒占比要求（1%）
    maxBelieverRatio: 0.99, // 最大信徒占比（超过99%不再触发）
    effect: async (country, gameState, eventData) => {
      // ⭐ 使用eventData中保存的荆棘王冠标记（在spawn时已确定）
      const isCrownedVersion = eventData?.isCrownedGoodPerson || false;
      const effectMultiplier = isCrownedVersion ? 2.0 : 1.0;
      const canConvertApostates = isCrownedVersion;
      
      // 效果：等于3次"信徒的主动传播"
      const module = await import('../data/gameConfig.js');
      const config = module.getEventConfig('selfSpread');
      
      // 计算3次传播的效果
      let totalBelievers = 0;
      for (let i = 0; i < 3; i++) {
        const baseGrowth = Math.ceil(country.believers * config.baseGrowthRate);
        totalBelievers += baseGrowth;
      }
      
      // ⭐ 应用天赋效果倍数
      totalBelievers = Math.ceil(totalBelievers * effectMultiplier);
      
      // ⭐ 荆棘王冠版本：优先转化脱教者
      let apostatesConverted = 0;
      if (canConvertApostates && country.apostates > 0) {
        apostatesConverted = Math.min(totalBelievers, country.apostates);
        country.apostates -= apostatesConverted;
        console.log(`👑 荆棘王冠版本：转化${apostatesConverted}脱教者`);
      }
      
      // 应用效果
      const oldBelievers = country.believers;
      const apostates = country.apostates || 0;
      const maxBelievers = country.population - apostates;
      country.believers = Math.min(country.believers + totalBelievers, maxBelievers);
      const actualIncrease = country.believers - oldBelievers;
      gameState.totalBelievers += actualIncrease;
      
      const versionText = isCrownedVersion ? '【荆棘王冠】' : '';
      console.log(`✨ 好人事件触发${versionText}！${country.id} +${actualIncrease.toLocaleString()} 信徒${apostatesConverted > 0 ? ` (含${apostatesConverted}脱教者转化)` : ''}`);
      
      // 记录好人事件新闻
      gameState.newsSystem.recordEvent('good_person_click', {
        countryId: country.id
      });
      
      // 计算百分比
      const percentage = ((actualIncrease / country.population) * 100).toFixed(1);
      
      return {
        success: true,
        believers: actualIncrease,
        percentage: percentage,
        message: `+${percentage}%`,
        isCrownedVersion: isCrownedVersion,
        apostatesConverted: apostatesConverted
      };
    }
  },
  
  OPPONENT: {
    id: 'opponent',
    name: '反对者出现',
    icon: '👤', // 金色背景的人像
    iconClass: 'opponent-icon', // 自定义样式类
    duration: 3000, // 持续时间3秒
    probability: 0.05, // 5%基础概率
    testingProbability: 0.05, // 测试模式也使用5%（与正式模式一致）
    // maxGlobalInstances 动态计算，不再固定为1
    onlyInfected: true,
    minBelieverRatio: 0.01, // 至少1%信徒才会有反对者
    
    // 血条相关
    baseHealth: 100,
    wealthyBonus: 20,    // 富国+20血
    poorPenalty: -40,    // 穷国-40血
    baseDamage: 30,      // 每次点击伤害
    reviveHealth: 10,    // 未点击3秒后恢复血量
    
    // 惩罚相关
    believerLossRate: 0.1, // 存活3秒流失10%信徒
    
    effect: async (country, gameState, eventData) => {
      // eventData包含health等信息
      const believerRatio = country.believers / country.population;
      const gdpRatio = country.gdp / country.originalGdp;
      
      // 基础成功率: 信徒占比 × GDP比率
      let successRate = believerRatio * gdpRatio;
      
      // 如果哲学家处于侵略状态，玩家成功率提高
      if (eventData.isInvading) {
        successRate *= 1.8; // 侵略中更容易被打击
        successRate = Math.min(successRate, 0.95); // 上限95%
      }
      
      console.log(`🎯 点击反对者: ${country.id}, 成功率${(successRate*100).toFixed(1)}%${eventData.isInvading ? ' [侵略中]' : ''}`);
      
      // 初始化点击计数器
      if (!eventData.totalClicks) eventData.totalClicks = 0;
      eventData.totalClicks++;
      
      // 成功判定
      if (Math.random() > successRate) {
        // ⭐ 点击失败增加血量
        if (!eventData.failedClicks) eventData.failedClicks = 0;
        eventData.failedClicks++;
        
        // 增加1点当前血量和血量上限
        eventData.health += 1;
        eventData.maxHealth += 1;
        
        console.log(`❌ 点击失败！(累计${eventData.failedClicks}次) 血量+1 → ${eventData.health}/${eventData.maxHealth}`);
        
        // ⭐ 不立即记录opponent_resist，等timeout时判断
        
        return {
          success: false,
          message: null // 不显示消息
        };
      }
      
      // 计算伤害
      const damage = eventData.baseDamage || 30;
      eventData.health -= damage;
      
      console.log(`✅ 造成${damage}伤害，剩余${eventData.health}血`);
      
      // 记录反对者点击成功新闻（玩家成功抹黑/禁言）
      gameState.newsSystem.recordEvent('opponent_click_success', {
        countryId: country.id,
        philosopherName: eventData.philosopherName
      });
      
      if (eventData.health <= 0) {
        // ⭐ 完全摧毁：记录新闻和禁用时间
        console.log(`💀 反对者已消灭！${eventData.philosopherName}`);
        
        // 记录哲学家被摧毁新闻（级别2）
        gameState.newsSystem.recordEvent('opponent_destroyed', {
          countryId: country.id,
          philosopherName: eventData.philosopherName
        });
        
        // ⭐ 禁用该哲学家100回合
        const philosopher = eventData.philosopher;
        if (philosopher) {
          philosopher.disabledUntilTurn = gameState.currentTurn + 100;
          console.log(`🚫 ${philosopher.name} 被禁用100回合（至第${philosopher.disabledUntilTurn}回合）`);
        }
        
        const successMessages = ['禁言！', '抹黑！', '栽赃！'];
        const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)];
        return {
          success: true,
          destroyed: true,
          message: randomMessage
        };
      } else {
        // 仅造成伤害，检查是否转移
        const successMessages = ['禁言！', '抹黑！', '栽赃！'];
        const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)];
        
        return {
          success: true,
          destroyed: false,
          health: eventData.health,
          message: `${randomMessage} -${damage}HP`,
          shouldMigrate: true // 标记可能需要转移（在handleEventClick中处理）
        };
      }
    },
    
    // 3秒未点击的惩罚
    onTimeout: (country, gameState, eventData) => {
      // 计算威力系数：health/maxHealth
      const powerRatio = eventData.health / eventData.maxHealth;
      
      // ⭐ 终极公式：信徒流失 = (当前信徒×10% + 总人口×10% + 哲学家历史脱教数×10%) × 威力系数
      // 这让成功的哲学家积累"声望"，越强大越无法阻挡
      const baseLossRate = 0.1;
      const actualLossRate = baseLossRate * powerRatio;
      
      const believerBasedLoss = Math.ceil(country.believers * actualLossRate);
      const populationBasedLoss = Math.ceil(country.population * actualLossRate);
      
      // ⭐ 哲学家声望加成：历史脱教数的10%
      const philosopher = eventData.philosopher;
      const reputationBasedLoss = philosopher ? Math.ceil(philosopher.totalApostatesCreated * actualLossRate) : 0;
      
      const totalLoss = believerBasedLoss + populationBasedLoss + reputationBasedLoss;
      
      // 实际流失不能超过当前信徒数
      const believersLost = Math.min(totalLoss, country.believers);
      const oldBelievers = country.believers;
      
      country.believers = Math.max(0, country.believers - believersLost);
      gameState.totalBelievers -= believersLost;
      
      // 标记脱教者
      if (!country.apostates) country.apostates = 0;
      country.apostates += believersLost;
      
      // ⭐ 更新哲学家的历史脱教数
      if (philosopher) {
        philosopher.totalApostatesCreated += believersLost;
      }
      
      // 成功传播奖励：恢复血量（10-20点）
      const healthRecover = Math.floor(10 + Math.random() * 11); // 10-20
      eventData.health = Math.min(eventData.maxHealth, eventData.health + healthRecover);
      
      // ⭐ 威力上限增长机制：每次成功传播增加2-5点血量上限
      // 富国基地的哲学家通过反复传播可自动升级到150+
      const maxHealthIncrease = Math.floor(2 + Math.random() * 4); // 2-5
      const oldMaxHealth = eventData.maxHealth;
      eventData.maxHealth += maxHealthIncrease;
      
      // 威力上限理论无上限，但实际侵略条件是150
      const maxHealthChange = eventData.maxHealth > oldMaxHealth ? ` (威力上限+${maxHealthIncrease}→${eventData.maxHealth})` : '';
      
      const oldRatio = (oldBelievers / country.population * 100).toFixed(2);
      const newRatio = (country.believers / country.population * 100).toFixed(2);
      const reputationInfo = philosopher ? ` [声望:${philosopher.totalApostatesCreated.toLocaleString()}]` : '';
      console.log(`⚠️ ${country.id} 反对者存活！威力${(powerRatio*100).toFixed(0)}% -${believersLost.toLocaleString()}信徒 (${oldRatio}% → ${newRatio}%) +${healthRecover}HP → ${eventData.health}/${eventData.maxHealth}${maxHealthChange}${reputationInfo}，累计脱教${country.apostates.toLocaleString()}`);
      
      // ⭐ 如果玩家点击失败2次以上，且哲学家最终完成传播，记录opponent_resist（级别2）
      if (eventData.failedClicks && eventData.failedClicks >= 2) {
        gameState.newsSystem.recordEvent('opponent_resist', {
          countryId: country.id,
          philosopherName: eventData.philosopherName
        });
        console.log(`📰 触发反对者抵抗新闻 [级别2]: ${eventData.philosopherName} (玩家失败${eventData.failedClicks}次)`);
      } else {
        // 否则只记录普通的opponent_timeout（级别1）
        gameState.newsSystem.recordEvent('opponent_timeout', {
          countryId: country.id,
          philosopherName: eventData.philosopherName
        });
      }
      
      return {
        believersLost,
        apostates: country.apostates,
        powerRatio: powerRatio,
        maxHealthIncrease: maxHealthIncrease
      };
    }
  }
  
  // 未来可以添加更多事件类型
  // PROPHET: { ... },
  // MIRACLE: { ... },
  // CRISIS: { ... }
};

/**
 * 特殊事件管理器
 */
export class SpecialEventManager {
  constructor(mapArea, gameState) {
    this.mapArea = mapArea;
    this.gameState = gameState;
    this.activeEvents = new Map(); // 当前活跃的事件显示 Map<eventId, eventData>
    this.eventIdCounter = 0;
    this.checkInterval = null;
    this.isRunning = false;
    
    // ⭐ 新增：哲学家实体管理
    this.activePhilosophers = new Map(); // 全局活跃的哲学家实体 Map<philosopherId, philosopherData>
    this.philosopherIdCounter = 0;
  }

  /**
   * 开始检测特殊事件
   */
  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    console.log('🎭 特殊事件系统已启动');
    
    // 每回合检测（与游戏回合同步）
    const module = await import('../data/gameConfig.js');
    const config = module.getConfig();
    const interval = config.turnInterval || 2000;
    console.log(`🎭 事件检测间隔: ${interval}ms`);
    
    // 立即执行第一次检查
    console.log('🎭 执行首次事件检查...');
    await this.checkForEvents();
    
    this.checkInterval = setInterval(() => {
      this.checkForEvents();
    }, interval);
  }


  /**
   * 停止检测
   */
  stop() {
    this.isRunning = false;
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.clearAllEvents();
  }

  /**
   * ⭐ 计算哲学家实体数量上限（基于全球信徒占比）
   * 0-10%信徒 → 1个哲学家
   * 90-100%信徒 → 10个哲学家
   * 线性插值
   */
  calculatePhilosopherLimit() {
    const totalPopulation = this.gameState.getTotalPopulation();
    const totalBelievers = this.gameState.totalBelievers;
    
    if (totalPopulation === 0) return 1;
    
    const believerRatio = totalBelievers / totalPopulation;
    
    // 线性插值：0.1→1个，1.0→10个
    if (believerRatio <= 0.1) return 1;
    if (believerRatio >= 1.0) return 10;
    
    const limit = Math.floor(1 + (believerRatio - 0.1) / 0.9 * 9);
    
    console.log(`📊 全球信徒占比: ${(believerRatio * 100).toFixed(1)}% → 哲学家上限: ${limit}`);
    
    return limit;
  }

  /**
   * ⭐ 获取当前正在显示事件的哲学家ID集合
   */
  getActivePhilosopherIds() {
    const activeIds = new Set();
    for (const eventData of this.activeEvents.values()) {
      if (eventData.philosopherId) {
        activeIds.add(eventData.philosopherId);
      }
    }
    return activeIds;
  }

  /**
   * ⭐ 获取或创建哲学家实体
   * 同一个哲学家同时只能有一个事件显示
   */
  async getOrCreatePhilosopher(country) {
    const philosopherLimit = this.calculatePhilosopherLimit();
    const activePhilosopherIds = this.getActivePhilosopherIds();
    
    // ⭐ 筛选出当前没有显示事件的哲学家，且不在禁用期内
    const availablePhilosophers = Array.from(this.activePhilosophers.values())
      .filter(p => {
        // 过滤掉正在显示的
        if (activePhilosopherIds.has(p.id)) return false;
        // ⭐ 过滤掉被禁用的（100回合内）
        if (p.disabledUntilTurn && gameState.currentTurn < p.disabledUntilTurn) {
          const remainingTurns = p.disabledUntilTurn - gameState.currentTurn;
          console.log(`🚫 ${p.name} 仍在禁用期（剩余${remainingTurns}回合）`);
          return false;
        }
        return true;
      });
    
    // 如果有可用的哲学家且未达上限，有50%概率使用已有的
    if (availablePhilosophers.length > 0 && Math.random() < 0.5) {
      const philosopher = availablePhilosophers[Math.floor(Math.random() * availablePhilosophers.length)];
      console.log(`♻️ 重用空闲哲学家: ${philosopher.name} (当前${this.activePhilosophers.size}/${philosopherLimit})`);
      return philosopher;
    }
    
    // 如果已达上限，必须从可用的哲学家中选择
    if (this.activePhilosophers.size >= philosopherLimit) {
      // 如果没有可用的哲学家（所有哲学家都在显示或被禁用）
      if (availablePhilosophers.length === 0) {
        // ⭐ 统计被禁用的哲学家数量
        const disabledCount = Array.from(this.activePhilosophers.values())
          .filter(p => p.disabledUntilTurn && gameState.currentTurn < p.disabledUntilTurn).length;
        
        if (disabledCount > 0) {
          console.log(`⚠️ 无法生成新事件：${disabledCount}个哲学家被禁用中，${activePhilosopherIds.size}个正在显示 (上限${philosopherLimit})`);
        } else {
          console.log(`🚫 所有哲学家都在显示中，无法生成新事件 (${activePhilosopherIds.size}/${philosopherLimit})`);
        }
        return null;
      }
      const philosopher = availablePhilosophers[Math.floor(Math.random() * availablePhilosophers.length)];
      console.log(`🔄 已达上限，重用空闲哲学家: ${philosopher.name} (${this.activePhilosophers.size}/${philosopherLimit})`);
      return philosopher;
    }
    
    // ⭐ 创建新哲学家，避免使用被禁用哲学家的名字
    const philosophersModule = await import('../data/philosophers.js');
    
    // 获取所有被禁用的哲学家名字
    const disabledNames = new Set();
    for (const p of this.activePhilosophers.values()) {
      if (p.disabledUntilTurn && gameState.currentTurn < p.disabledUntilTurn) {
        disabledNames.add(p.name);
      }
    }
    
    // 尝试获取一个未被禁用的哲学家名字（最多尝试10次）
    let philosopherInfo;
    for (let i = 0; i < 10; i++) {
      const candidate = philosophersModule.getRandomPhilosopher();
      if (!disabledNames.has(candidate.name)) {
        philosopherInfo = candidate;
        break;
      }
    }
    
    // 如果10次都没找到（理论上不太可能，哲学家列表很长），就用最后一个
    if (!philosopherInfo) {
      philosopherInfo = philosophersModule.getRandomPhilosopher();
      console.log(`⚠️ 无法避免使用被禁用名字，强制使用: ${philosopherInfo.name}`);
    }
    
    // 根据国家财富等级计算初始血量
    // 富国(7-10): 110-130, 中等(4-6): 85-110, 穷国(1-3): 60-85
    let baseHealth, healthRange;
    if (country.wealthLevel >= 7) {
      // 富国
      baseHealth = 110;
      healthRange = 20; // 110-130
    } else if (country.wealthLevel >= 4) {
      // 中等
      baseHealth = 85;
      healthRange = 25; // 85-110
    } else {
      // 穷国
      baseHealth = 60;
      healthRange = 25; // 60-85
    }
    const initialHealth = baseHealth + Math.floor(Math.random() * healthRange);
    
    const philosopherId = `philosopher_${this.philosopherIdCounter++}`;
    const philosopher = {
      id: philosopherId,
      name: philosopherInfo.name,
      nameEn: philosopherInfo.nameEn,
      info: philosopherInfo,
      currentCountry: country.id,
      birthCountry: country.id, // 记录出生国（基地）
      birthWealthLevel: country.wealthLevel, // 记录出生时的财富等级
      // ⭐ totalClicks 和 failedClicks 不在哲学家实体级别保存，每次事件独立计数
      totalApostatesCreated: 0, // ⭐ 记录该哲学家累计造成的脱教者数量
      health: initialHealth,
      maxHealth: initialHealth,
      createdAt: Date.now()
    };
    
    this.activePhilosophers.set(philosopherId, philosopher);
    console.log(`✨ 创建新哲学家: ${philosopher.name} HP${initialHealth} @${country.id}(财富${country.wealthLevel}) (当前${this.activePhilosophers.size}/${philosopherLimit})`);
    
    return philosopher;
  }

  /**
   * ⭐ 移除哲学家实体（被完全消灭时）
   */
  removePhilosopher(philosopherId) {
    const philosopher = this.activePhilosophers.get(philosopherId);
    if (philosopher) {
      console.log(`💀 哲学家被消灭: ${philosopher.name}`);
      this.activePhilosophers.delete(philosopherId);
    }
  }

  /**
   * ⭐ 尝试转移反对者到邻国（使用与宗教传播相同的逻辑）
   * @param {Object} eventData - 反对者事件数据
   * @returns {boolean} 是否成功转移
   */
  async tryMigrateOpponent(eventData) {
    const sourceCountry = eventData.country;
    
    // 获取邻国列表
    const neighbors = sourceCountry.neighbors || [];
    if (neighbors.length === 0) {
      console.log(`🚫 ${sourceCountry.id} 没有邻国，反对者无法转移`);
      return false;
    }
    
    // 筛选出已感染的邻国（反对者只会转移到有信徒的地方）
    const infectedNeighbors = neighbors
      .map(id => this.gameState.getCountry(id))
      .filter(country => country && country.believers > 0);
    
    if (infectedNeighbors.length === 0) {
      console.log(`🚫 ${sourceCountry.id} 没有已感染的邻国，反对者无法转移`);
      return false;
    }
    
    // 使用与宗教传播相同的概率机制
    // 参考 gameConfig.js 中的 crossBorderSpread 配置
    const module = await import('../data/gameConfig.js');
    const config = module.getEventConfig('crossBorderSpread');
    
    // 基础转移概率（与跨国传播相同）
    const baseProbability = config.baseProbability || 0.3;
    
    // 随机选择一个目标国家
    const targetCountry = infectedNeighbors[Math.floor(Math.random() * infectedNeighbors.length)];
    
    // 概率判定
    if (Math.random() < baseProbability) {
      console.log(`🚶 哲学家 ${eventData.philosopherName} 从 ${sourceCountry.id} 转移到 ${targetCountry.id}`);
      
      // 更新哲学家实体位置
      const philosopher = this.activePhilosophers.get(eventData.philosopherId);
      if (philosopher) {
        philosopher.currentCountry = targetCountry.id;
      }
      
      // 在新位置重新显示反对者事件
      await this.spawnEvent(SpecialEventTypes.OPPONENT, targetCountry);
      
      // 记录反对者转移新闻
      this.gameState.newsSystem.recordEvent('opponent_migrate', {
        sourceCountry: sourceCountry.id,
        targetCountry: targetCountry.id,
        philosopherName: eventData.philosopherName
      });
      
      return true;
    }
    
    console.log(`🚫 反对者转移判定失败 (概率: ${baseProbability})`);
    return false;
  }

  /**
   * 尝试让强大的哲学家侵入邻国
   * @param {Object} philosopher - 哲学家实体
   * @returns {boolean} 是否成功侵略
   */
  async tryInvade(philosopher) {
    const currentCountry = this.gameState.getCountry(philosopher.currentCountry);
    if (!currentCountry) return false;
    
    // 侵略条件：maxHealth >= 150 且当前国家信徒为0
    if (philosopher.maxHealth < 150 || currentCountry.believers > 0) {
      return false;
    }
    
    console.log(`🗡️ 哲学家 ${philosopher.name} 达到侵略条件 (HP${philosopher.maxHealth})，寻找目标...`);
    
    // 收集可侵略的目标（有信徒的邻国）
    const potentialTargets = [];
    
    // 1. 陆地邻国（优先级最高）
    const neighbors = currentCountry.neighbors || [];
    for (const neighborId of neighbors) {
      const neighbor = this.gameState.getCountry(neighborId);
      if (neighbor && neighbor.believers > 0) {
        potentialTargets.push({ country: neighbor, type: 'land', weight: 10 });
      }
    }
    
    // 2. 海运可达国家
    if (currentCountry.hasPort) {
      const portCountries = Array.from(this.gameState.countries.values())
        .filter(c => c.believers > 0 && c.hasPort && c.id !== currentCountry.id);
      for (const country of portCountries.slice(0, 5)) {
        potentialTargets.push({ country, type: 'sea', weight: 3 });
      }
    }
    
    // 3. 空运可达国家
    if (currentCountry.hasAirport) {
      const airCountries = Array.from(this.gameState.countries.values())
        .filter(c => c.believers > 0 && c.hasAirport && c.id !== currentCountry.id);
      for (const country of airCountries.slice(0, 5)) {
        potentialTargets.push({ country, type: 'air', weight: 1 });
      }
    }
    
    if (potentialTargets.length === 0) {
      console.log(`🚫 没有可侵略的目标`);
      return false;
    }
    
    // 加权随机选择
    const totalWeight = potentialTargets.reduce((sum, t) => sum + t.weight, 0);
    let random = Math.random() * totalWeight;
    let target = potentialTargets[0];
    for (const t of potentialTargets) {
      random -= t.weight;
      if (random <= 0) {
        target = t;
        break;
      }
    }
    
    // 更新哲学家位置
    philosopher.currentCountry = target.country.id;
    philosopher.isInvading = true; // 标记为侵略状态
    
    console.log(`⚔️ 哲学家 ${philosopher.name} 侵入 ${target.country.id} (${target.type})`);
    
    // 在目标国家创建反对者事件
    await this.spawnEvent(SpecialEventTypes.OPPONENT, target.country);
    
    // 记录侵略新闻
    this.gameState.newsSystem.recordEvent('philosopher_invade', {
      sourceCountry: currentCountry.id,
      targetCountry: target.country.id,
      philosopherName: philosopher.name
    });
    
    return true;
  }
  
  /**
   * 哲学家逃跑到其他国家
   * @param {Object} philosopher - 哲学家实体
   * @param {Object} currentCountry - 当前所在国家
   * @returns {boolean} 是否成功逃跑
   */
  async tryEscape(philosopher, currentCountry) {
    console.log(`🏃 哲学家 ${philosopher.name} 尝试逃跑...`);
    
    // 收集可逃往的国家
    const escapeDestinations = [];
    
    // 1. 优先回到出生国（富国基地）
    if (philosopher.birthCountry && philosopher.birthCountry !== currentCountry.id) {
      const birthCountry = this.gameState.getCountry(philosopher.birthCountry);
      if (birthCountry) {
        escapeDestinations.push({ country: birthCountry, type: 'birth', weight: 20 });
      }
    }
    
    // 2. 陆地邻国
    const neighbors = currentCountry.neighbors || [];
    for (const neighborId of neighbors) {
      const neighbor = this.gameState.getCountry(neighborId);
      if (neighbor && neighbor.id !== philosopher.birthCountry) {
        escapeDestinations.push({ country: neighbor, type: 'land', weight: 5 });
      }
    }
    
    // 3. 海运/空运可达的富国
    const wealthyCountries = Array.from(this.gameState.countries.values())
      .filter(c => c.wealthLevel >= 7 && c.id !== currentCountry.id && c.id !== philosopher.birthCountry);
    
    if (currentCountry.hasPort) {
      for (const country of wealthyCountries.filter(c => c.hasPort).slice(0, 3)) {
        escapeDestinations.push({ country, type: 'sea', weight: 2 });
      }
    }
    
    if (currentCountry.hasAirport) {
      for (const country of wealthyCountries.filter(c => c.hasAirport).slice(0, 3)) {
        escapeDestinations.push({ country, type: 'air', weight: 1 });
      }
    }
    
    if (escapeDestinations.length === 0) {
      console.log(`🚫 没有可逃往的地方`);
      return false;
    }
    
    // 加权随机选择
    const totalWeight = escapeDestinations.reduce((sum, d) => sum + d.weight, 0);
    let random = Math.random() * totalWeight;
    let destination = escapeDestinations[0];
    for (const d of escapeDestinations) {
      random -= d.weight;
      if (random <= 0) {
        destination = d;
        break;
      }
    }
    
    // 更新哲学家位置
    philosopher.currentCountry = destination.country.id;
    philosopher.isInvading = false; // 取消侵略状态
    
    console.log(`🛫 哲学家 ${philosopher.name} 逃往 ${destination.country.id} (${destination.type})`);
    
    // 在目标国家创建新事件
    await this.spawnEvent(SpecialEventTypes.OPPONENT, destination.country);
    
    // 记录逃跑新闻
    this.gameState.newsSystem.recordEvent('philosopher_escape', {
      sourceCountry: currentCountry.id,
      targetCountry: destination.country.id,
      philosopherName: philosopher.name
    });
    
    return true;
  }

  /**
   * 检测是否触发特殊事件
   */
  async checkForEvents() {
    if (!this.gameState.isGameStarted) {
      console.log('🎭 游戏未开始，跳过事件检查');
      return;
    }
    if (this.gameState.isVictory) {
      console.log('🎭 游戏已胜利，跳过事件检查');
      return;
    }

    const infectedCountries = this.gameState.getInfectedCountries();
    const totalPhilosophers = this.activePhilosophers.size;
    const activePhilosopherIds = this.getActivePhilosopherIds();
    const disabledCount = Array.from(this.activePhilosophers.values())
      .filter(p => p.disabledUntilTurn && this.gameState.currentTurn < p.disabledUntilTurn).length;
    
    console.log(`🎭 检查事件... 已感染国家数: ${infectedCountries.length}, 活跃事件: ${this.activeEvents.size}, 哲学家: ${totalPhilosophers}(显示中:${activePhilosopherIds.size}, 禁用:${disabledCount})`);
    
    if (infectedCountries.length === 0) {
      console.log('🎭 没有已感染国家');
      return;
    }
    
    // ⭐ 检查哲学家侵略条件
    for (const philosopher of this.activePhilosophers.values()) {
      // 如果哲学家已经在显示中，跳过
      const activeIds = this.getActivePhilosopherIds();
      if (activeIds.has(philosopher.id)) continue;
      
      // 检查侵略条件：maxHealth >= 150 && 当前国家信徒为0
      const currentCountry = this.gameState.getCountry(philosopher.currentCountry);
      if (currentCountry && philosopher.maxHealth >= 150 && currentCountry.believers === 0) {
        // 尝试侵略
        const invaded = await this.tryInvade(philosopher);
        if (invaded) {
          // 侵略成功，事件已在tryInvade中创建
          return; // 本轮只处理一个侵略
        }
      }
    }
    
    // 检测是否在测试模式
    const module = await import('../data/gameConfig.js');
    const isTestingMode = module.CONFIG_MODE === 'testing';
    console.log(`🎭 测试模式: ${isTestingMode}`);
    
    // === 全局事件显示上限检查 ===
    const totalActiveEvents = this.activeEvents.size;
    const MAX_TOTAL_EVENTS = 3; // 同时显示的事件上限（包括所有类型）
    
    if (totalActiveEvents >= MAX_TOTAL_EVENTS) {
      console.log(`🚫 已达事件显示上限 (${totalActiveEvents}/${MAX_TOTAL_EVENTS})`);
      return;
    }
    
    // ⭐ 反对者事件不再有单独的显示上限，由哲学家实体数量控制
    const opponentEventCount = Array.from(this.activeEvents.values())
      .filter(e => e.type.id === 'opponent').length;
    
    // 遍历所有事件类型
    for (const [typeKey, eventType] of Object.entries(SpecialEventTypes)) {
      // 检查该类型事件的当前实例数
      const currentInstances = Array.from(this.activeEvents.values())
        .filter(e => e.type.id === eventType.id).length;
      
      // 好人等事件使用maxGlobalInstances
      if (eventType.maxGlobalInstances && currentInstances >= eventType.maxGlobalInstances) {
        console.log(`🚫 事件 ${eventType.name} 已达上限 (${currentInstances}/${eventType.maxGlobalInstances})`);
        continue;
      }
      
      // 遍历已感染国家
      for (const country of infectedCountries) {
        // 全局事件上限再检查（防止循环中新增）
        if (this.activeEvents.size >= MAX_TOTAL_EVENTS) {
          console.log(`🚫 生成事件时达到全局上限`);
          return;
        }
        
        // 检查触发条件
        if (!this.shouldTriggerEvent(eventType, country)) continue;
        
        // 再次检查实例数（因为可能在循环中生成了新事件）
        const currentCount = Array.from(this.activeEvents.values())
          .filter(e => e.type.id === eventType.id).length;
        if (eventType.maxGlobalInstances && currentCount >= eventType.maxGlobalInstances) {
          break; // 跳出当前事件类型的检查
        }
        
        // 根据模式选择概率
        let probability = isTestingMode && eventType.testingProbability 
          ? eventType.testingProbability 
          : eventType.probability;
        
        // ⭐ 天赋效果：同情天赋 - 反对者概率降低
        // 参考: SKILL_EFFECTS_SPEC.md - SE-COMPASSION-01
        if (eventType.id === 'opponent' && gameState) {
          const modifier = gameState.getSkillModifier('opponent_probability');
          probability *= modifier;
        }
        
        console.log(`🎲 检查特殊事件 ${eventType.name} 在 ${country.id} (概率: ${probability})`);
        
        // 概率检测
        if (Math.random() < probability) {
          await this.spawnEvent(eventType, country);
        }
      }
    }
  }

  /**
   * 检查事件是否应该触发
   */
  shouldTriggerEvent(eventType, country) {
    // 检查是否只在已感染地区
    if (eventType.onlyInfected && !country.infected) return false;
    
    // 检查信徒占比范围
    const ratio = country.believers / country.population;
    if (eventType.minBelieverRatio && ratio < eventType.minBelieverRatio) return false;
    if (eventType.maxBelieverRatio && ratio >= eventType.maxBelieverRatio) return false;
    
    // ⭐ 关键修改：检查该国家是否已有任何活跃事件（不限类型）
    // 一个国家同时只能有一个活跃事件，实现真正的互斥
    for (const [eventId, eventData] of this.activeEvents) {
      if (eventData.countryId === country.id) {
        // console.log(`⏭️ 跳过${country.id}，已有${eventData.type.name}事件`);
        return false; // 该国家已有活跃事件，不生成新事件
      }
    }
    
    return true;
  }

  /**
   * 生成特殊事件
   */
  async spawnEvent(eventType, country) {
    const eventId = `event_${this.eventIdCounter++}`;
    
    console.log(`✨ 生成特殊事件: ${eventType.name} 在 ${country.id}`);
    
    // SVG是通过object标签加载的，需要访问contentDocument
    const objectElement = document.getElementById('world-map-svg');
    if (!objectElement || !objectElement.contentDocument) {
      console.warn(`⚠️ SVG未加载完成`);
      return;
    }
    
    const svgDoc = objectElement.contentDocument;
    const countryElement = svgDoc.getElementById(country.id);
    if (!countryElement) {
      console.warn(`⚠️ 找不到国家元素: ${country.id}`);
      return;
    }
    
    try {
      const bbox = countryElement.getBBox();
      const svg = countryElement.ownerSVGElement;
      
      if (!svg) {
        console.warn(`⚠️ 找不到SVG元素: ${country.id}`);
        return;
      }
      
      const pt = svg.createSVGPoint();
      pt.x = bbox.x + bbox.width / 2;
      pt.y = bbox.y + bbox.height / 2;
      
      // 转换为屏幕坐标
      const ctm = svg.getScreenCTM();
      const screenPt = pt.matrixTransform(ctm);
      
      console.log(`📍 事件位置: ${country.id} at (${screenPt.x.toFixed(0)}, ${screenPt.y.toFixed(0)})`);
      
      // ⭐ 天赋效果：同情天赋 - 好人事件增强
      // 参考: SKILL_EFFECTS_SPEC.md - SE-COMPASSION-03, SE-COMPASSION-04
      let isCrownedGoodPerson = false;
      if (eventType.id === 'good_person' && this.gameState) {
        const skillEffect = this.gameState.getSkillModifier('good_person_effect');
        isCrownedGoodPerson = skillEffect.isCrownedVersion || false;
        
        // ⭐ 检查是否还有转化空间（SE-COMPASSION-04）
        const apostates = country.apostates || 0;
        const maxBelievers = country.population - apostates;
        const hasConversionSpace = country.believers < maxBelievers;
        
        // 如果没有转化空间（信徒+脱教者=人口），且不是荆棘王冠版本，跳过
        if (!hasConversionSpace && !isCrownedGoodPerson) {
          console.log(`⏭️ 跳过好人事件：${country.id} 已固化（信徒${country.believers}+脱教${apostates}=${country.population}），且非荆棘王冠版本`);
          return;
        }
        
        // 如果是荆棘王冠版本但没有脱教者，也跳过
        if (isCrownedGoodPerson && apostates === 0 && !hasConversionSpace) {
          console.log(`⏭️ 跳过荆棘王冠事件：${country.id} 无脱教者可转化，且无转化空间`);
          return;
        }
      }
      
      // 创建浮动图标
      const iconElement = this.createEventIcon(eventId, eventType, screenPt.x, screenPt.y, isCrownedGoodPerson);
      
      // 保存事件数据
      const eventData = {
        id: eventId,
        type: eventType,
        countryId: country.id,
        country: country,
        element: iconElement,
        spawnTime: Date.now(),
        isCrownedGoodPerson: isCrownedGoodPerson // 保存荆棘王冠标记
      };
      
      // ⭐ 如果是反对者事件，获取或创建哲学家实体
      if (eventType.id === 'opponent') {
        const philosopher = await this.getOrCreatePhilosopher(country);
        
        // ⭐ 如果没有可用的哲学家（所有哲学家都在显示中），取消生成事件
        if (!philosopher) {
          console.log(`🚫 无可用哲学家，取消生成反对者事件`);
          // 移除已创建的图标元素
          if (iconElement && iconElement.parentNode) {
            iconElement.parentNode.removeChild(iconElement);
          }
          return;
        }
        
        // 将哲学家实体信息关联到事件
        eventData.philosopherId = philosopher.id;
        eventData.philosopherName = philosopher.name;
        eventData.philosopher = philosopher;
        
        // 使用哲学家实体的状态
        eventData.health = philosopher.health;
        eventData.maxHealth = philosopher.maxHealth;
        // ⭐ 修复：每次事件的点击计数器独立，不累积
        eventData.totalClicks = 0;
        eventData.failedClicks = 0;
        eventData.totalApostatesCreated = philosopher.totalApostatesCreated; // 历史脱教数
        eventData.isInvading = philosopher.isInvading || false; // 侵略状态标记
        
        // 更新哲学家当前位置
        philosopher.currentCountry = country.id;
        
        const reputationInfo = philosopher.totalApostatesCreated > 0 ? ` [声望:${philosopher.totalApostatesCreated.toLocaleString()}]` : '';
        console.log(`🎓 哲学家 ${philosopher.name} 出现在 ${country.id} (血量: ${philosopher.health}/${philosopher.maxHealth})${philosopher.isInvading ? ' [侵略中]' : ''}${reputationInfo}`);
      }
      
      this.activeEvents.set(eventId, eventData);
      
      // 设置点击事件
      iconElement.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleEventClick(eventId);
      });
      
      // 设置自动消失（超时处理）
      setTimeout(() => {
        const eventData = this.activeEvents.get(eventId);
        if (!eventData) return;
        
        // 如果事件类型有onTimeout处理，则调用
        if (eventType.onTimeout) {
          const result = eventType.onTimeout(eventData.country, this.gameState, eventData);
          
          // 显示流失百分比消息（针对反对者事件）
          if (result && result.believersLost > 0) {
            const percentage = ((result.believersLost / eventData.country.population) * 100).toFixed(1);
            this.showEventMessage(eventData, `-${percentage}%`);
            
            // 更新地图显示
            if (this.mapArea) {
              this.mapArea.updateCountryVisual(eventData.countryId);
            }
          }
        }
        
        this.removeEvent(eventId);
      }, eventType.duration);
      
    } catch (error) {
      console.error(`❌ 创建事件失败 ${country.id}:`, error);
    }
  }

  /**
   * 创建事件图标元素
   */
  createEventIcon(eventId, eventType, x, y, isCrownedGoodPerson = false) {
    const icon = document.createElement('div');
    icon.id = eventId;
    icon.className = `special-event-icon ${eventType.iconClass || ''}`;
    
    // ⭐ 荆棘王冠版本使用特殊图标
    if (isCrownedGoodPerson) {
      icon.textContent = '👑'; // 王冠图标
      icon.title = '荆棘王冠 - ' + eventType.name;
      icon.className += ' crowned-person-icon'; // 添加特殊样式类
    } else {
      icon.textContent = eventType.icon;
      icon.title = eventType.name;
    }
    
    icon.style.left = `${x}px`;
    icon.style.top = `${y}px`;
    
    // 添加到地图容器
    const mapContainer = document.getElementById('map-area');
    if (mapContainer) {
      mapContainer.appendChild(icon);
    }
    
    return icon;
  }

  /**
   * 处理事件点击
   */
  async handleEventClick(eventId) {
    const eventData = this.activeEvents.get(eventId);
    if (!eventData) return;
    
    // 执行事件效果
    const result = await eventData.type.effect(eventData.country, this.gameState, eventData);
    
    // ⭐ 如果是反对者，同步更新哲学家实体状态
    if (eventData.type.id === 'opponent' && eventData.philosopherId) {
      const philosopher = this.activePhilosophers.get(eventData.philosopherId);
      if (philosopher) {
        philosopher.health = eventData.health;
        philosopher.maxHealth = eventData.maxHealth;
        // ⭐ totalClicks 和 failedClicks 不同步到哲学家实体，每次事件独立
        philosopher.totalApostatesCreated = eventData.totalApostatesCreated || philosopher.totalApostatesCreated;
      }
    }
    
    // 显示效果消息
    if (result && result.message) {
      this.showEventMessage(eventData, result.message);
    }
    
    // 根据事件类型和结果决定是否移除
    let shouldRemove = false;
    
    if (eventData.type.id === 'good_person') {
      // 好人事件：点击后总是移除
      shouldRemove = true;
    } else if (eventData.type.id === 'opponent') {
      // 反对者事件处理
      if (result && result.success === true) {
        // 点击成功
        if (result.destroyed === true) {
          // 完全摧毁 → 移除哲学家实体
          if (eventData.philosopherId) {
            this.removePhilosopher(eventData.philosopherId);
          }
          shouldRemove = true;
        } else {
          // 造成伤害但未摧毁 → 尝试转移
          if (result.shouldMigrate) {
            const migrated = await this.tryMigrateOpponent(eventData);
            if (migrated) {
              shouldRemove = true; // 转移成功，移除当前图标
            } else {
              // 转移失败，立即移除图标（哲学家会在下一轮重新出现）
              shouldRemove = true;
            }
          } else {
            // 没有转移标记，立即移除
            shouldRemove = true;
          }
        }
      } else if (result && result.success === false && eventData.isInvading) {
        // 点击失败且处于侵略状态 → 逃跑
        const philosopher = this.activePhilosophers.get(eventData.philosopherId);
        if (philosopher) {
          const escaped = await this.tryEscape(philosopher, eventData.country);
          if (escaped) {
            shouldRemove = true; // 逃跑成功，移除当前图标
          }
        }
      }
    } else {
      // 其他事件类型的默认行为
      shouldRemove = true;
    }
    
    if (shouldRemove) {
      this.removeEvent(eventId);
    }
    
    // 更新地图显示
    if (this.mapArea) {
      this.mapArea.updateCountryVisual(eventData.countryId);
    }
  }

  /**
   * 显示事件消息
   */
  showEventMessage(eventData, message) {
    // 创建消息提示
    const msgElement = document.createElement('div');
    msgElement.className = 'special-event-message';
    msgElement.textContent = message;
    msgElement.style.left = eventData.element.style.left;
    msgElement.style.top = eventData.element.style.top;
    
    const mapContainer = document.getElementById('map-area');
    if (mapContainer) {
      mapContainer.appendChild(msgElement);
      
      // 2秒后移除
      setTimeout(() => {
        if (msgElement.parentNode) {
          msgElement.parentNode.removeChild(msgElement);
        }
      }, 2000);
    }
  }

  /**
   * 移除事件
   */
  removeEvent(eventId) {
    const eventData = this.activeEvents.get(eventId);
    if (!eventData) return;
    
    // 移除DOM元素
    if (eventData.element && eventData.element.parentNode) {
      eventData.element.parentNode.removeChild(eventData.element);
    }
    
    // 从活跃列表中移除
    this.activeEvents.delete(eventId);
  }

  /**
   * 清除所有事件
   */
  clearAllEvents() {
    for (const [eventId] of this.activeEvents) {
      this.removeEvent(eventId);
    }
  }

  /**
   * 获取活跃事件数量
   */
  getActiveEventCount() {
    return this.activeEvents.size;
  }
}
