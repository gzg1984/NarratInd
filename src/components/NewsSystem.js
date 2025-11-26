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

    // ⭐ 如果使用了同情天赋模板，提升新闻级别到3
    const usedCompassionTemplate = this.shouldUseCompassionTemplate(eventType);
    const newsLevel = usedCompassionTemplate ? 3 : this.getNewsLevel(eventType);

    return {
      id: Date.now() + Math.random(),
      timestamp: Date.now(),
      type: eventType,
      media: media,
      content: content,
      countryId: data.countryId,
      priority: this.getEventPriority(eventType),
      level: newsLevel // 新闻级别 (0-10)，同情天赋提升到3
    };
  }

  /**
   * 选择新闻模板
   * @param {string} eventType - 事件类型
   * @param {Object} data - 事件数据（用于信徒里程碑判断）
   * @returns {string|null} 模板字符串
   */
  selectTemplate(eventType, data) {
    // ⭐ 处理游戏失败特殊新闻（级别10）
    if (eventType === 'game_defeat') {
      const defeatTemplates = [
        "💀 {philosopher} 在 {country} 消灭了最后的信徒！{star}的思想彻底湮没在历史长河中。",
        "💀 终局！{philosopher} 在 {country} 发起的最后一击，将 {star} 的所有追随者转化为脱教者。",
        "💀 {country} 的 {philosopher} 完成了致命一击，{star} 的信仰体系彻底崩溃。",
        "💀 历史将记住这一天：{philosopher} 在 {country} 终结了 {star} 的思想传播。"
      ];
      return defeatTemplates[Math.floor(Math.random() * defeatTemplates.length)];
    }
    
    // ⭐ 检查是否需要使用同情天赋的特殊模板
    const useCompassionTemplate = this.shouldUseCompassionTemplate(eventType);
    if (useCompassionTemplate) {
      const template = this.getCompassionTemplate(eventType);
      if (template) {
        console.log(`🌿 使用同情天赋模板: ${eventType}`);
        return template;
      }
    }
    
    // ⭐ 处理技能新闻（格式：skill_<skillName>_<newsType>）
    if (eventType.startsWith('skill_')) {
      const parts = eventType.split('_'); // ['skill', 'compassion', 'low_wealth_boost']
      if (parts.length >= 3) {
        const skillName = parts[1]; // 'compassion'
        const newsType = parts.slice(2).join('_'); // 'low_wealth_boost'
        
        // 动态导入技能新闻模板
        try {
          return this.getSkillNewsTemplate(skillName, newsType);
        } catch (error) {
          console.warn(`⚠️ 无法加载技能新闻: ${eventType}`, error);
          return null;
        }
      }
    }
    
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
      content = content.replace(/{philosopher}/g, data.philosopherName);
      content = content.replace(/{philosopherName}/g, data.philosopherName);
    }

    // ⭐ 替换明星名称（用于技能新闻）
    content = content.replace(/{star}/g, this.getReligionName());

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
    // ⭐ 技能新闻级别（从技能新闻模板中获取）
    if (eventType.startsWith('skill_')) {
      const parts = eventType.split('_');
      if (parts.length >= 3) {
        const skillName = parts[1];
        const newsType = parts.slice(2).join('_');
        
        try {
          const level = this.getSkillNewsLevel(skillName, newsType);
          if (level !== null) return level;
        } catch (error) {
          console.warn(`⚠️ 无法获取技能新闻级别: ${eventType}`, error);
        }
      }
    }
    
    const levels = {
      game_start: 10,            // 游戏开始，最高优先级
      victory: 10,               // 胜利，最高优先级
      defeat: 10,                // 失败，最高优先级
      game_defeat: 10,           // 游戏失败（反对者致命一击），最高优先级
      global_believers_50: 4,    // 全球信徒50%，级别4
      philosopher_invade: 3,     // 哲学家侵略，级别3
      opponent_destroyed: 2,     // 哲学家被摧毁（血量归零），级别2
      philosopher_escape: 2,     // 哲学家逃跑，级别2
      opponent_resist: 2,        // 哲学家抵抗玩家攻击（点击失败+完成传播），级别2
      opponent_click_success: 1, // 玩家成功抹黑哲学家，级别1
      opponent_timeout: 1,       // 哲学家成功传播（超时，无点击或点击成功），级别1
      opponent_priest_critique: 1 // ⭐ 神父天赋：反对者批评神父特权阶级，级别1
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
      global_believers_50: 8,    // 全球50%里程碑
      cross_border_start: 8,
      believers_50: 7,
      opponent_timeout: 6,
      opponent_priest_critique: 6, // ⭐ 神父批评新闻
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
   * ⭐ 检查是否应该使用同情天赋模板
   * @param {string} eventType - 事件类型
   * @returns {boolean}
   */
  shouldUseCompassionTemplate(eventType) {
    // 对传播相关事件生效
    const spreadEvents = [
      'self_spread', 
      'attract_dissatisfied', 
      'real_help', 
      'cross_border_start',
      'good_person_click',  // ⭐ 好人事件点击
      'good_person_timeout' // ⭐ 好人事件超时
    ];
    if (!spreadEvents.includes(eventType)) return false;
    
    // 检查同情天赋是否解锁
    if (!this.gameState.skillTree || !this.gameState.skillTree.hasSkill('compassion')) {
      return false;
    }
    
    // 检查财富是否 < 10
    const wealth = this.gameState.wealth || 0;
    return wealth < 10;
  }

  /**
   * ⭐ 获取同情天赋的特殊模板
   * @param {string} eventType - 事件类型
   * @returns {string|null}
   */
  getCompassionTemplate(eventType) {
    // 同情天赋的特殊模板（强调贫穷和共苦）
    const compassionTemplates = {
      self_spread: [
        '{media}：{country}的贫困者互相帮助，{religion}在苦难中传播。',
        '{media}：{religion}在{country}的底层民众中蔓延，穷人们看到了希望。',
        '{media}：{country}的工人和农民在{religion}中找到了慰藉。',
        '{media}：贫穷让{country}的人们更加团结，{religion}在他们之间快速传播。'
      ],
      attract_dissatisfied: [
        '{media}：{country}的不满者加入{religion}，他们说：“我们是同一种人。”',
        '{media}：{religion}吸引了{country}大量贫困群体，他们寻求改变。',
        '{media}：{country}的弱势群体纷纷皮依{religion}，称找到了归属感。',
        '{media}：{religion}成为{country}贫困者的精神寄托。'
      ],
      real_help: [
        '{media}：{religion}信徒在{country}帮助贫困家庭，赢得了信任。',
        '{media}：{country}有人称{religion}信徒“理解我们的苦难”。',
        '{media}：{religion}在{country}开展慈善活动，帮助贫穷社区。',
        '{media}：{country}贫民称{religion}信徒是“真正的好人”。'
      ],
      cross_border_start: [
        '{media}：{religion}从{source}传播到{target}，两国穷人产生共鸣。',
        '{media}：{target}的底层民众接纳了来自{source}的{religion}。',
        '{media}：{religion}跨越边界，连接{source}和{target}的贫困者。',
        '{media}：{target}的弱势群体欢迎来自{source}的{religion}。'
      ],
      // ⭐ 好人事件的同情版本
      good_person_click: [
        '{media}：{country}一位来自贫民窟的活动家公开支持{religion}。',
        '{media}：{country}底层社会工作者为{religion}发声，称其帮助了无数穷人。',
        '{media}：{religion}在{country}获得贫困社区领袖的背书。',
        '{media}：{country}贫民区意见领袖称{religion}给穷人带来希望。',
        '{media}：{country}慈善家称{religion}是"穷人的福音"。'
      ],
      good_person_timeout: [
        '{media}：{country}贫困地区支持{religion}的集会因故取消。',
        '{media}：{country}底层民众的{religion}支持活动遭遇困难。'
      ]
    };
    
    const templates = compassionTemplates[eventType];
    if (templates && templates.length > 0) {
      return templates[Math.floor(Math.random() * templates.length)];
    }
    
    return null;
  }

  /**
   * 获取技能新闻模板（延迟加载）
   * @param {string} skillName - 技能名称
   * @param {string} newsType - 新闻类型
   * @returns {string|null} 新闻模板
   */
  getSkillNewsTemplate(skillName, newsType) {
    // 使用硬编码的模板，避免动态导入问题
    const skillNewsTemplates = {
      compassion: {
        low_wealth_boost: {
          level: 3,
          templates: [
            "{country}的贫穷国民认为{star}帮助了他们度过困难时期。",
            "在困难时期，{country}的人们感受到了{star}的温暖。",
            "{country}的穷人说：'{star}理解我们的苦难。'",
            "贫困让{country}的人民更接近{star}的教诲。"
          ]
        },
        high_wealth_hypocrisy: {
          level: 3,
          templates: [
            "{philosopher}认为{star}非常虚伪，利用着人们的同情心大肆敛财。",
            "{philosopher}指责{star}：'他们一边宣扬同情，一边积累财富！'",
            "{philosopher}讽刺道：'{star}的同情心似乎只对富人有效。'",
            "{philosopher}说：'{star}用贫困者的故事赚钱，这才是真正的剥削。'"
          ]
        },
        low_wealth_kill: {
          level: 3,
          templates: [
            "{philosopher}的言论被普遍认为傲慢而且缺乏人道主义关怀，对贫困的人毫无同情。",
            "公众谴责{philosopher}的言论冷酷无情，完全忽视了{country}贫困人口的苦难。",
            "{philosopher}因为对底层人民的蔑视态度而遭到强烈抵制，在{country}失去了所有公信力。",
            "{country}的民众认为{philosopher}站在富人一边，对穷人的痛苦视而不见，其言论不值一提。"
          ]
        }
      }
    };
    
    if (skillNewsTemplates[skillName] && skillNewsTemplates[skillName][newsType]) {
      const templates = skillNewsTemplates[skillName][newsType].templates;
      if (templates && templates.length > 0) {
        return templates[Math.floor(Math.random() * templates.length)];
      }
    }
    
    return null;
  }

  /**
   * 获取技能新闻级别
   * @param {string} skillName - 技能名称
   * @param {string} newsType - 新闻类型
   * @returns {number|null} 新闻级别
   */
  getSkillNewsLevel(skillName, newsType) {
    // 使用硬编码的级别
    const skillNewsTemplates = {
      compassion: {
        low_wealth_boost: { level: 3 },
        high_wealth_hypocrisy: { level: 3 },
        low_wealth_kill: { level: 3 }
      }
    };
    
    if (skillNewsTemplates[skillName] && skillNewsTemplates[skillName][newsType]) {
      return skillNewsTemplates[skillName][newsType].level || 0;
    }
    
    return null;
  }

  /**
   * 获取待播报的新闻（5秒轮询调用）
   * ⭐ 总是从当前备选的最高级别的新闻里选择一条来显示
   * ⭐ 但级别10的新闻（重大事件）全部播报，不受此限制
   * @returns {Object|null} 新闻对象
   */
  getNextNews() {
    if (this.newsQueue.length === 0) return null;

    // 找出最高级别
    const maxLevel = Math.max(...this.newsQueue.map(n => n.level || 0));
    
    // ⭐ 级别10的新闻（游戏开始、胜利、失败等重大事件）应该全部播报
    // 按照入队顺序依次取出
    if (maxLevel === 10) {
      const topNews = this.newsQueue.find(n => n.level === 10);
      if (topNews) {
        const index = this.newsQueue.indexOf(topNews);
        this.newsQueue.splice(index, 1);
        console.log(`📢 播报级别10重大新闻（队列剩余${this.newsQueue.filter(n => n.level === 10).length}条级别10新闻）`);
        this.addToHistory(topNews);
        return topNews;
      }
    }
    
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
   * 优先删除低级别、低优先级的新闻，保护game_start、victory、defeat等关键新闻
   */
  pruneHistory() {
    console.log('📰 新闻历史超过100条，开始智能采样...');

    // 按级别优先，然后按优先级排序（从低到高）
    // level高的排在后面（被保留），level低的排在前面（被删除）
    const sorted = [...this.newsHistory].sort((a, b) => {
      const levelA = a.level || 0;
      const levelB = b.level || 0;
      if (levelA !== levelB) {
        return levelA - levelB; // 级别低的排前面
      }
      // 级别相同时按优先级排序
      return (a.priority || 3) - (b.priority || 3);
    });

    // 保留80%，删除20%（从级别最低的开始删）
    const toKeep = Math.floor(this.newsHistory.length * 0.8);
    this.newsHistory = sorted.slice(-toKeep);
    
    // 按时间戳重新排序（恢复时间顺序）
    this.newsHistory.sort((a, b) => a.timestamp - b.timestamp);

    console.log(`📰 历史记录缩减至 ${this.newsHistory.length} 条（优先保留高级别新闻）`);
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
