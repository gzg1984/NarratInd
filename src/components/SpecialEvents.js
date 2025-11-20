// SpecialEvents.js - 特殊事件系统（可复用框架）

/**
 * 特殊事件类型定义
 */
export const SpecialEventTypes = {
  GOOD_PERSON: {
    id: 'good_person',
    name: '好人出现',
    icon: '👤', // 可以用emoji或自定义图标
    duration: 10000, // 持续时间（毫秒）- 10秒
    probability: 0.05, // 每回合每个已感染国家的触发概率（5%）
    testingProbability: 0.4, // 测试模式下的概率（40%）
    maxGlobalInstances: 1, // 全球同时最多1个实例（暂时先搞成1个）
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
      
      // 计算百分比
      const percentage = ((actualIncrease / country.population) * 100).toFixed(1);
      
      return {
        success: true,
        believers: actualIncrease,
        percentage: percentage,
        message: `+${percentage}%`
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
    this.activeEvents = new Map(); // 当前活跃的事件 Map<eventId, eventData>
    this.eventIdCounter = 0;
    this.checkInterval = null;
    this.isRunning = false;
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
    
    // 遍历所有事件类型
    for (const [typeKey, eventType] of Object.entries(SpecialEventTypes)) {
      // 检查该类型事件的当前实例数
      const currentInstances = Array.from(this.activeEvents.values())
        .filter(e => e.type.id === eventType.id).length;
      
      if (eventType.maxGlobalInstances && currentInstances >= eventType.maxGlobalInstances) {
        console.log(`🚫 事件 ${eventType.name} 已达全局上限 (${currentInstances}/${eventType.maxGlobalInstances})`);
        continue;
      }
      
      // 遍历已感染国家
      for (const country of infectedCountries) {
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
          this.spawnEvent(eventType, country);
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
    
    // 检查该国家是否已有相同类型的活跃事件
    for (const [eventId, eventData] of this.activeEvents) {
      if (eventData.countryId === country.id && eventData.type.id === eventType.id) {
        return false; // 同一国家同一类型事件不重复
      }
    }
    
    return true;
  }

  /**
   * 生成特殊事件
   */
  spawnEvent(eventType, country) {
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
      
      this.activeEvents.set(eventId, eventData);
      
      // 设置点击事件
      iconElement.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleEventClick(eventId);
      });
      
      // 设置自动消失
      setTimeout(() => {
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
    icon.className = 'special-event-icon';
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
    const result = await eventData.type.effect(eventData.country, this.gameState);
    
    // 显示效果消息（百分比格式）
    if (result && result.message) {
      this.showEventMessage(eventData, result.message);
    }
    
    // 移除事件
    this.removeEvent(eventId);
    
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
