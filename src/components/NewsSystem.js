// NewsSystem.js - 新闻系统核心逻辑

import { 
  newsTemplates, 
  getMediaForEvent, 
  getCountryDisplayName,
  getMediaDisplayName
} from '../data/newsTemplates.js';

/**
 * 新闻系统类
 * 负责将游戏事件转换为新闻并管理新闻队列
 */
export class NewsSystem {
  constructor(gameState, getStarNameFn) {
    this.gameState = gameState;
    this.getStarName = getStarNameFn;
    this.newsQueue = [];           // 近3回合的待播新闻
    this.newsHistory = [];         // 所有历史新闻（最多100条）
    this.lastMilestones = new Map(); // 记录每个国家的里程碑，避免重复播报
  }
  
  /**
   * 获取宗教名称（即明星名字）
   * @returns {string} 明星名字
   */
  getReligionName() {
    return this.getStarName ? this.getStarName() : '新信仰';
  }

  /**
   * 记录游戏事件，转换为新闻
   * @param {string} eventType - 事件类型
   * @param {Object} data - 事件数据
   */
  recordEvent(eventType, data) {
    try {
      const news = this.generateNews(eventType, data);
      if (news) {
        this.newsQueue.push(news);
        
        // 保持队列为3回合内的事件（2秒/回合 = 6秒窗口）
        const now = Date.now();
        this.newsQueue = this.newsQueue.filter(
          n => now - n.timestamp < 6000
        );
        
        console.log(`📰 新闻入队 [级别${news.level || 0}]: ${news.content}`);
      }
    } catch (error) {
      console.error('❌ 记录新闻失败:', error);
    }
  }

  /**
   * 生成新闻对象
   * @param {string} eventType - 事件类型
   * @param {Object} data - 事件数据
   * @returns {Object|null} 新闻对象
   */
  generateNews(eventType, data) {
    // 选择模板
    const template = this.selectTemplate(eventType, data);
    if (!template) {
      console.warn(`⚠️ 未找到事件类型 ${eventType} 的新闻模板`);
      return null;
    }

    // 选择媒体
    const country = this.gameState.getCountry(data.countryId);
    const media = getMediaForEvent(data.countryId, eventType, country);

    // 填充模板
    const content = this.fillTemplate(template, data, media);

    return {
      id: Date.now() + Math.random(),
      timestamp: Date.now(),
      type: eventType,
      media: media,
      content: content,
      countryId: data.countryId,
      priority: this.getEventPriority(eventType),
      level: this.getNewsLevel(eventType) // 新闻级别 (0-10)
    };
  }

  /**
   * 选择新闻模板
   * @param {string} eventType - 事件类型
   * @param {Object} data - 事件数据（用于信徒里程碑判断）
   * @returns {string|null} 模板字符串
   */
  selectTemplate(eventType, data) {
    // 处理信徒里程碑
    if (eventType === 'believers_milestone' && data.countryId) {
      const country = this.gameState.getCountry(data.countryId);
      if (!country) return null;

      const ratio = country.believers / country.population;
      let milestone = null;

      // 判断达到的里程碑
      if (ratio >= 1.0) milestone = 'believers_100';
      else if (ratio >= 0.75) milestone = 'believers_75';
      else if (ratio >= 0.5) milestone = 'believers_50';
      else if (ratio >= 0.25) milestone = 'believers_25';
      else if (ratio >= 0.1) milestone = 'believers_10';

      if (!milestone) return null;

      // 检查是否已播报过该里程碑
      const lastMilestone = this.lastMilestones.get(data.countryId);
      if (lastMilestone === milestone) {
        return null; // 已播报过，不重复
      }

      // 记录里程碑
      this.lastMilestones.set(data.countryId, milestone);

      // 获取对应模板
      const templates = newsTemplates[milestone];
      if (!templates || templates.length === 0) return null;
      return templates[Math.floor(Math.random() * templates.length)];
    }

    // 其他事件类型
    const templates = newsTemplates[eventType];
    if (!templates || templates.length === 0) return null;
    
    // 随机选择一个模板
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * 填充模板变量
   * @param {string} template - 模板字符串
   * @param {Object} data - 事件数据
   * @param {string} media - 媒体名称
   * @returns {string} 填充后的新闻内容
   */
  fillTemplate(template, data, media) {
    let content = template;

    // 替换媒体（使用本地化名称）
    const localizedMedia = getMediaDisplayName(media);
    content = content.replace(/{media}/g, localizedMedia);

    // 替换宗教名称（明星名字）
    content = content.replace(/{religion}/g, this.getReligionName());

    // ⭐ 替换哲学家/人物名称（用于反对者抵抗事件）
    if (data.philosopherName) {
      content = content.replace(/{person}/g, data.philosopherName);
    }

    // 替换国家名称
    if (data.countryId) {
      const countryName = getCountryDisplayName(data.countryId);
      content = content.replace(/{country}/g, countryName);
    }

    // 替换来源国家（跨国传播）
    if (data.sourceCountry) {
      const sourceName = getCountryDisplayName(data.sourceCountry);
      content = content.replace(/{source}/g, sourceName);
    }

    // 替换目标国家（跨国传播）
    if (data.targetCountry) {
      const targetName = getCountryDisplayName(data.targetCountry);
      content = content.replace(/{target}/g, targetName);
    }

    return content;
  }

  /**
   * 获取新闻级别（用于播报优先级）
   * @param {string} eventType - 事件类型
   * @returns {number} 新闻级别（0-10）
   */
  getNewsLevel(eventType) {
    const levels = {
      opponent_resist: 1  // 反对者抵抗成功，级别1
    };
    
    // 其他所有事件默认为级别0
    return levels[eventType] || 0;
  }

  /**
   * 获取事件优先级（用于历史记录采样）
   * @param {string} eventType - 事件类型
   * @returns {number} 优先级（1-10）
   */
  getEventPriority(eventType) {
    const priorities = {
      game_start: 10,
      victory: 10,
      defeat: 10,
      believers_100: 9,
      cross_border_start: 8,
      believers_50: 7,
      opponent_timeout: 6,
      good_person_click: 5,
      opponent_click_success: 5,
      believers_75: 5,
      believers_25: 4,
      believers_10: 3,
      opponent_appear: 3,
      good_person_timeout: 2,
      wealth_gain: 2,
      wealth_drain: 2,
      believer_loss: 4
    };

    return priorities[eventType] || 3;
  }

  /**
   * 获取待播报的新闻（5秒轮询调用）
   * ⭐ 总是从当前备选的最高级别的新闻里选择一条来显示
   * @returns {Object|null} 新闻对象
   */
  getNextNews() {
    if (this.newsQueue.length === 0) return null;

    // 找出最高级别
    const maxLevel = Math.max(...this.newsQueue.map(n => n.level || 0));
    
    // 筛选出最高级别的所有新闻
    const topLevelNews = this.newsQueue.filter(n => (n.level || 0) === maxLevel);
    
    // 从最高级别中随机选择一条
    const selectedNews = topLevelNews[Math.floor(Math.random() * topLevelNews.length)];
    
    // 从队列中移除（避免重复播报）
    const index = this.newsQueue.indexOf(selectedNews);
    const news = this.newsQueue[index];
    this.newsQueue.splice(index, 1);
    
    console.log(`📢 播报级别${news.level || 0}新闻（当前最高级别: ${maxLevel}）`);

    // 添加到历史
    this.addToHistory(news);

    return news;
  }

  /**
   * 立即生成新闻（不加入队列，用于重要事件的即时播报）
   * @param {string} eventType - 事件类型
   * @param {Object} data - 事件数据
   * @returns {Object|null} 新闻对象
   */
  generateNewsImmediately(eventType, data) {
    const news = this.generateNews(eventType, data);
    if (news) {
      console.log(`⚡ 即时新闻: ${news.content}`);
    }
    return news;
  }

  /**
   * 添加到历史记录
   * @param {Object} news - 新闻对象
   */
  addToHistory(news) {
    this.newsHistory.push(news);

    // 超过100条时智能采样
    if (this.newsHistory.length > 100) {
      this.pruneHistory();
    }
  }

  /**
   * 智能删除历史（保留重要事件）
   * 删除20%的低优先级新闻
   */
  pruneHistory() {
    console.log('📰 新闻历史超过100条，开始智能采样...');

    // 按优先级排序
    const sorted = [...this.newsHistory].sort((a, b) => 
      (a.priority || 3) - (b.priority || 3)
    );

    // 保留80%，删除20%低优先级
    const toKeep = Math.floor(this.newsHistory.length * 0.8);
    this.newsHistory = sorted.slice(-toKeep);

    console.log(`📰 历史记录缩减至 ${this.newsHistory.length} 条`);
  }

  /**
   * 获取所有历史新闻（用于游戏结束回放）
   * @returns {Array} 历史新闻数组
   */
  getAllHistory() {
    return this.newsHistory;
  }

  /**
   * 清空新闻队列和历史
   */
  clear() {
    this.newsQueue = [];
    this.newsHistory = [];
    this.lastMilestones.clear();
  }

  /**
   * 设置宗教名称
   * @param {string} name - 宗教名称
   */
  setReligionName(name) {
    this.religionName = name;
  }
}
