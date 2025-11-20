// gameState.js - 游戏状态管理
import { initializeCountries } from '../data/countryData.js';
import { processCountryEvents } from '../data/events.js';

export class GameState {
  constructor() {
    this.countries = new Map(); // 国家数据
    this.totalPopulation = 0; // 全球总人口
    this.startCountry = null; // 起始国家
    this.totalBelievers = 0; // 全球总信徒
    this.wealth = 0; // 财富资源
    this.isGameStarted = false; // 游戏是否开始
    this.isVictory = false; // 是否已胜利
    this.onVictoryCallback = null; // 胜利回调
    this.skillTree = null; // 技能树引用
    this.initCountryData();
  }

  // 初始化国家数据
  initCountryData() {
    const { countries, totalPopulation } = initializeCountries();
    this.countries = countries;
    this.totalPopulation = totalPopulation;
  }

  // 设置技能树引用
  setSkillTree(skillTree) {
    this.skillTree = skillTree;
  }

  // 根据点击的SVG元素ID获取国家
  getCountryByElementId(elementId) {
    if (!elementId) return null;
    
    // SVG中的ID可能与我们的国家ID相同，或者需要映射
    const country = this.countries.get(elementId);
    return country || null;
  }

  // 开始游戏，设置起始国家
  startGame(countryId) {
    const country = this.countries.get(countryId);
    if (!country) {
      console.error('无效的国家ID:', countryId);
      return false;
    }

    // 动态导入配置
    import('../data/gameConfig.js').then(module => {
      const config = module.getGameStartConfig();
      
      this.startCountry = countryId;
      country.infected = true;
      country.believers = config.initialBelievers; // 使用配置的起始信徒数
      this.totalBelievers = config.initialBelievers;

      console.log(`游戏开始于: ${countryId}, 起始信徒: ${config.initialBelievers}, 人口: ${country.population}, 财富等级: ${country.wealthLevel}`);
    });
    
    this.isGameStarted = true;
    return true;
  }

  /**
   * 处理一个回合的所有事件
   * @returns {Array} 所有触发的事件数组
   */
  processTurn() {
    if (!this.isGameStarted || this.isVictory) return [];

    const allTriggeredEvents = [];
    const infectedCountries = this.getInfectedCountries();

    // 处理每个已感染国家的所有事件
    for (const country of infectedCountries) {
      // 如果国家已经100%信教，跳过内部传播事件（但仍可能触发跨国传播）
      const isFullyConverted = country.believers >= country.population;
      
      const events = processCountryEvents(country, this.skillTree, this, isFullyConverted);
      
      // 应用事件效果
      for (const event of events) {
        // 应用信徒变化
        if (event.believers > 0) {
          const oldBelievers = country.believers;
          country.believers += event.believers;
          
          // 确保不超过人口上限
          if (country.believers > country.population) {
            const actualIncrease = country.population - oldBelievers;
            country.believers = country.population;
            this.totalBelievers += actualIncrease;
          } else {
            this.totalBelievers += event.believers;
          }
        }
        
        // 应用财富变化
        if (event.wealthChange !== 0) {
          this.wealth += event.wealthChange;
          // 确保财富不会为负
          if (this.wealth < 0) this.wealth = 0;
        }
        
        // 处理跨国传播
        if (event.crossBorder) {
          this.handleCrossBorderSpread(event.sourceCountry);
        }
        
        allTriggeredEvents.push(event);
      }
    }

    // 每回合更新财富（基于信徒）
    this.updateWealth();

    // 检查胜利条件
    this.checkVictory();

    return allTriggeredEvents;
  }

  /**
   * 处理跨国传播
   * @param {string} fromCountryId - 源国家ID
   */
  handleCrossBorderSpread(fromCountryId) {
    // 动态导入配置
    import('../data/gameConfig.js').then(module => {
      const config = module.getEventConfig('crossBorder');
      
      const sourceCountry = this.countries.get(fromCountryId);
      if (!sourceCountry || !sourceCountry.neighbors || sourceCountry.neighbors.length === 0) {
        console.log(`跨国传播失败: ${fromCountryId} 没有邻国数据`);
        return;
      }
      
      // 只选择未感染的邻国
      const uninfectedNeighbors = sourceCountry.neighbors
        .map(neighborId => this.countries.get(neighborId))
        .filter(neighbor => neighbor && !neighbor.infected);

      if (uninfectedNeighbors.length === 0) {
        console.log(`跨国传播失败: ${fromCountryId} 的所有邻国已被感染`);
        return;
      }

      // 随机选择一个未感染的邻国
      const targetCountry = uninfectedNeighbors[Math.floor(Math.random() * uninfectedNeighbors.length)];
      targetCountry.infected = true;
      targetCountry.believers = config.initialBelievers; // 使用配置的初始信徒数
      this.totalBelievers += config.initialBelievers;

      console.log(`跨国传播: ${fromCountryId} -> ${targetCountry.id}, 初始信徒: ${config.initialBelievers}`);
    });
  }

  // 获取所有已感染国家
  getInfectedCountries() {
    return Array.from(this.countries.values()).filter(c => c.infected);
  }

  // 更新财富（基于信徒数量）
  updateWealth() {
    // 动态导入配置
    import('../data/gameConfig.js').then(module => {
      const config = module.getWealthConfig();
      const wealthGain = Math.floor(this.totalBelievers * config.generationRate);
      this.wealth += wealthGain;
      return wealthGain;
    });
  }

  // 获取国家信息
  getCountry(countryId) {
    return this.countries.get(countryId);
  }

  // 获取总信徒数
  getTotalBelievers() {
    return this.totalBelievers;
  }

  // 获取财富
  getWealth() {
    return this.wealth;
  }

  // 获取游戏是否开始
  isStarted() {
    return this.isGameStarted;
  }

  // 检查是否胜利
  checkVictory() {
    if (this.isVictory) return; // 已经胜利，不重复检查
    
    // 检查是否所有国家都被感染且达到100%
    const allCountries = Array.from(this.countries.values());
    const allInfected = allCountries.every(country => country.infected);
    
    if (allInfected && this.totalBelievers >= this.totalPopulation) {
      this.isVictory = true;
      console.log('🎉 胜利！所有国家都已被完全征服！');
      if (this.onVictoryCallback) {
        this.onVictoryCallback();
      }
    }
  }

  // 设置胜利回调
  setVictoryCallback(callback) {
    this.onVictoryCallback = callback;
  }

  // 获取总人口
  getTotalPopulation() {
    return this.totalPopulation;
  }
}
