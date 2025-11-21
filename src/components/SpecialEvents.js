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
    effect: async (country, gameState) => {
      // 效果：等于3次"信徒的主动传播"
      const module = await import('../data/gameConfig.js');
      const config = module.getEventConfig('selfSpread');
      
      // 计算3次传播的效果
      let totalBelievers = 0;
      for (let i = 0; i < 3; i++) {
        const baseGrowth = Math.ceil(country.believers * config.baseGrowthRate);
        totalBelievers += baseGrowth;
      }
      
      // 应用效果
      const oldBelievers = country.believers;
      country.believers = Math.min(country.believers + totalBelievers, country.population);
      const actualIncrease = country.believers - oldBelievers;
      gameState.totalBelievers += actualIncrease;
      
      console.log(`✨ 好人事件触发！${country.id} +${actualIncrease.toLocaleString()} 信徒`);
      
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
        message: `+${percentage}%`
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
    testingProbability: 0.3, // 测试模式30%
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
      
      // 计算点击成功率: 信徒占比 × GDP比率
      const successRate = believerRatio * gdpRatio;
      
      console.log(`🎯 点击反对者: ${country.id}, 成功率${(successRate*100).toFixed(1)}%`);
      
      // 初始化点击计数器
      if (!eventData.totalClicks) eventData.totalClicks = 0;
      eventData.totalClicks++;
      
      // 成功判定
      if (Math.random() > successRate) {
        // ⭐ 新特性1: 点击失败增加血量
        if (!eventData.failedClicks) eventData.failedClicks = 0;
        eventData.failedClicks++;
        
        // 增加1点当前血量和血量上限
        eventData.health += 1;
        eventData.maxHealth += 1;
        
        console.log(`❌ 点击失败！(累计${eventData.failedClicks}次) 血量+1 → ${eventData.health}/${eventData.maxHealth}`);
        
        // ⭐ 新特性2: 如果点击了两次还没消灭，触发特殊新闻
        if (eventData.totalClicks >= 2) {
          gameState.newsSystem.recordEvent('opponent_resist', {
            countryId: country.id,
            philosopherName: eventData.philosopherName
          });
          console.log(`📰 触发反对者抵抗新闻 [级别1]: ${eventData.philosopherName}`);
        }
        
        return {
          success: false,
          message: null // 不显示消息
        };
      }
      
      // 计算伤害
      const damage = eventData.baseDamage || 30;
      eventData.health -= damage;
      
      console.log(`✅ 造成${damage}伤害，剩余${eventData.health}血`);
      
      // 记录反对者点击成功新闻
      gameState.newsSystem.recordEvent('opponent_click_success', {
        countryId: country.id
      });
      
      // ⭐ 新特性2: 如果点击了两次还没消灭，触发特殊新闻
      if (eventData.totalClicks >= 2 && eventData.health > 0) {
        gameState.newsSystem.recordEvent('opponent_resist', {
          countryId: country.id,
          philosopherName: eventData.philosopherName
        });
        console.log(`📰 触发反对者抵抗新闻 [级别1]: ${eventData.philosopherName}`);
      }
      
      if (eventData.health <= 0) {
        // 完全消灭
        console.log(`💀 反对者已消灭！`);
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
      const believersLost = Math.ceil(country.believers * 0.1);
      const oldBelievers = country.believers;
      
      country.believers = Math.max(0, country.believers - believersLost);
      gameState.totalBelievers -= believersLost;
      
      // 标记脱教者
      if (!country.apostates) country.apostates = 0;
      country.apostates += believersLost;
      
      // 恢复血量（如果有压制机制）
      if (eventData.health > 0 && eventData.health < eventData.maxHealth) {
        eventData.health = Math.min(eventData.maxHealth, eventData.health + 10);
      }
      
      console.log(`⚠️ ${country.id} 反对者存活！-${believersLost.toLocaleString()}信徒，累计脱教${country.apostates.toLocaleString()}`);
      
      // 记录反对者超时新闻
      gameState.newsSystem.recordEvent('opponent_timeout', {
        countryId: country.id
      });
      
      return {
        believersLost,
        apostates: country.apostates
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
    
    // 筛选出当前没有显示事件的哲学家
    const availablePhilosophers = Array.from(this.activePhilosophers.values())
      .filter(p => !activePhilosopherIds.has(p.id));
    
    // 如果有可用的哲学家且未达上限，有50%概率使用已有的
    if (availablePhilosophers.length > 0 && Math.random() < 0.5) {
      const philosopher = availablePhilosophers[Math.floor(Math.random() * availablePhilosophers.length)];
      console.log(`♻️ 重用空闲哲学家: ${philosopher.name} (当前${this.activePhilosophers.size}/${philosopherLimit})`);
      return philosopher;
    }
    
    // 如果已达上限，必须从可用的哲学家中选择
    if (this.activePhilosophers.size >= philosopherLimit) {
      // 如果没有可用的哲学家（所有哲学家都在显示），返回null表示无法生成新事件
      if (availablePhilosophers.length === 0) {
        console.log(`🚫 所有哲学家都在显示中，无法生成新事件 (${activePhilosopherIds.size}/${philosopherLimit})`);
        return null;
      }
      const philosopher = availablePhilosophers[Math.floor(Math.random() * availablePhilosophers.length)];
      console.log(`🔄 已达上限，重用空闲哲学家: ${philosopher.name} (${this.activePhilosophers.size}/${philosopherLimit})`);
      return philosopher;
    }
    
    // 创建新哲学家
    const philosophersModule = await import('../data/philosophers.js');
    const philosopherInfo = philosophersModule.getRandomPhilosopher();
    
    const philosopherId = `philosopher_${this.philosopherIdCounter++}`;
    const philosopher = {
      id: philosopherId,
      name: philosopherInfo.name,
      nameEn: philosopherInfo.nameEn,
      info: philosopherInfo,
      currentCountry: country.id,
      totalClicks: 0,
      failedClicks: 0,
      health: 100,
      maxHealth: 100,
      createdAt: Date.now()
    };
    
    this.activePhilosophers.set(philosopherId, philosopher);
    console.log(`✨ 创建新哲学家: ${philosopher.name} (当前${this.activePhilosophers.size}/${philosopherLimit})`);
    
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
    console.log(`🎭 检查事件... 已感染国家数: ${infectedCountries.length}`);
    
    if (infectedCountries.length === 0) {
      console.log('🎭 没有已感染国家');
      return;
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
        const probability = isTestingMode && eventType.testingProbability 
          ? eventType.testingProbability 
          : eventType.probability;
        
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
      
      // 创建浮动图标
      const iconElement = this.createEventIcon(eventId, eventType, screenPt.x, screenPt.y);
      
      // 保存事件数据
      const eventData = {
        id: eventId,
        type: eventType,
        countryId: country.id,
        country: country,
        element: iconElement,
        spawnTime: Date.now()
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
        eventData.totalClicks = philosopher.totalClicks;
        eventData.failedClicks = philosopher.failedClicks;
        
        // 更新哲学家当前位置
        philosopher.currentCountry = country.id;
        
        console.log(`🎓 哲学家 ${philosopher.name} 出现在 ${country.id} (血量: ${philosopher.health}/${philosopher.maxHealth})`);
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
  createEventIcon(eventId, eventType, x, y) {
    const icon = document.createElement('div');
    icon.id = eventId;
    icon.className = `special-event-icon ${eventType.iconClass || ''}`;
    icon.textContent = eventType.icon;
    icon.style.left = `${x}px`;
    icon.style.top = `${y}px`;
    icon.title = eventType.name;
    
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
        philosopher.totalClicks = eventData.totalClicks;
        philosopher.failedClicks = eventData.failedClicks;
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
      // 反对者事件：只有成功且被摧毁时才移除
      if (result && result.success === true && result.destroyed === true) {
        // ⭐ 移除哲学家实体
        if (eventData.philosopherId) {
          this.removePhilosopher(eventData.philosopherId);
        }
        shouldRemove = true;
      } else if (result && result.success === true && result.shouldMigrate) {
        // ⭐ 新特性：反对者转移逻辑
        const migrated = await this.tryMigrateOpponent(eventData);
        if (migrated) {
          shouldRemove = true; // 移除当前位置的事件显示（哲学家实体会在新位置重新显示）
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
