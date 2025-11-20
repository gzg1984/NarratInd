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
    this.turnCount = 0; // 回合计数
    this.lastUninfectedCheck = 0; // 上次检查未感染国家的回合
    this.lastUninfectedCount = 0; // 上次未感染国家数量
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

    this.turnCount++;
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

    // 调试：检查孤立的未感染国家（在测试模式下）
    this.checkIsolatedCountries();

    return allTriggeredEvents;
  }

  /**
   * 检查孤立的未感染国家（调试功能）
   * 在测试模式下，如果感染率>=98%且10回合内未感染国家没有变化，则输出未感染国家列表
   */
  checkIsolatedCountries() {
    // 动态检查是否在测试模式
    import('../data/gameConfig.js').then(module => {
      const configMode = module.CONFIG_MODE;
      if (configMode !== 'testing') return;

      // 只检查有人口的国家
      const inhabitedCountries = Array.from(this.countries.values())
        .filter(c => c.population > 0);
      const uninfectedCountries = inhabitedCountries
        .filter(c => !c.infected);
      const uninfectedCount = uninfectedCountries.length;
      const infectionRate = (inhabitedCountries.length - uninfectedCount) / inhabitedCountries.length;

      // 如果感染率 >= 98% 且有未感染国家
      if (infectionRate >= 0.98 && uninfectedCount > 0) {
        // 如果未感染国家数量在10回合内没有变化
        if (uninfectedCount === this.lastUninfectedCount) {
          if (this.turnCount - this.lastUninfectedCheck >= 10) {
            // 输出未感染国家列表
            const countryIds = uninfectedCountries.map(c => c.id).join(', ');
            console.warn(`\n⚠️ 检测到孤立国家！已感染 ${infectionRate.toFixed(1)}%，10回合未变化`);
            console.warn(`未感染的国家 (${uninfectedCount}个): ${countryIds}`);
            
            // 分析这些国家为什么没有被感染
            uninfectedCountries.forEach(country => {
              const hasInfectedNeighbor = country.neighbors?.some(nId => {
                const neighbor = this.countries.get(nId);
                return neighbor && neighbor.infected;
              });
              const connections = [];
              if (country.neighbors?.length > 0) connections.push(`邻国${country.neighbors.length}个`);
              if (country.hasAirport) connections.push('有机场');
              if (country.hasPort) connections.push('有港口');
              const connectStr = connections.length > 0 ? connections.join(', ') : '无连接';
              console.warn(`  - ${country.id}: ${connectStr}${hasInfectedNeighbor ? ' (有已感染邻国)' : ''}`);
            });
            
            this.lastUninfectedCheck = this.turnCount;
          }
        } else {
          // 未感染国家数量变化了，重置检查
          this.lastUninfectedCount = uninfectedCount;
          this.lastUninfectedCheck = this.turnCount;
        }
      }
    });
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
      if (!sourceCountry) return;
      
      // 收集所有可能的目标国家
      const potentialTargets = [];
      
      // 1. 陆地邻国（优先级最高）
      if (sourceCountry.neighbors && sourceCountry.neighbors.length > 0) {
        const uninfectedNeighbors = sourceCountry.neighbors
          .map(neighborId => this.countries.get(neighborId))
          .filter(neighbor => neighbor && !neighbor.infected);
        potentialTargets.push(...uninfectedNeighbors.map(c => ({ country: c, type: 'land' })));
      }
      
      // 2. 通过机场传播（如果源国有机场）
      if (sourceCountry.hasAirport) {
        const airportCountries = Array.from(this.countries.values())
          .filter(c => !c.infected && c.hasAirport && c.id !== sourceCountry.id);
        // 机场传播概率较低，只添加部分
        if (airportCountries.length > 0) {
          const sample = airportCountries.slice(0, Math.max(5, Math.floor(airportCountries.length * 0.2)));
          potentialTargets.push(...sample.map(c => ({ country: c, type: 'air' })));
        }
      }
      
      // 3. 通过港口传播（如果源国有港口）
      if (sourceCountry.hasPort) {
        const portCountries = Array.from(this.countries.values())
          .filter(c => !c.infected && c.hasPort && c.id !== sourceCountry.id);
        // 港口传播概率中等，添加部分
        if (portCountries.length > 0) {
          const sample = portCountries.slice(0, Math.max(5, Math.floor(portCountries.length * 0.3)));
          potentialTargets.push(...sample.map(c => ({ country: c, type: 'sea' })));
        }
      }
      
      if (potentialTargets.length === 0) {
        console.log(`跨国传播失败: ${fromCountryId} 没有可传播的目标`);
        return;
      }

      // 根据传播类型设置权重（陆地>海运>空运）
      const weights = potentialTargets.map(t => {
        if (t.type === 'land') return 10;
        if (t.type === 'sea') return 3;
        return 1; // air
      });
      
      // 加权随机选择
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let random = Math.random() * totalWeight;
      let selectedIndex = 0;
      for (let i = 0; i < weights.length; i++) {
        random -= weights[i];
        if (random <= 0) {
          selectedIndex = i;
          break;
        }
      }
      
      const { country: targetCountry, type } = potentialTargets[selectedIndex];
      
      // 计算GDP差异影响（使用极严格的指数衰减公式）
      const gdpDifference = targetCountry.gdp - sourceCountry.gdp;
      let successRate = 1.0; // 基础成功率100%
      
      if (gdpDifference > 0) {
        // 目标国更富裕 - 使用极严格的指数衰减
        // 方案3：底数0.05 + 除数5 + 保底0.0001%
        // 公式: 0.05^(GDP差距/5)
        // 示例：
        // - GDP差5: 0.05^1 = 5%
        // - GDP差10: 0.05^2 = 0.25%
        // - GDP差15: 0.05^3 = 0.0125%
        // - GDP差28(海地→美国): 0.05^5.6 ≈ 0.00002% (几乎不可能)
        const exponent = gdpDifference / 5;
        successRate = Math.pow(0.05, exponent);
        // 最低保证0.0001%成功率（需要技能才有意义）
        successRate = Math.max(0.000001, successRate);
      }
      
      // TODO: 技能修正接口（预留）
      // 例如：s_refugee技能可以 successRate *= 1000（让穷国→富国变为0.02%可行）
      // if (this.skillTree && this.skillTree.hasSkill('s_refugee')) {
      //   successRate *= 1000;
      // }
      
      // 成功率检查
      if (Math.random() > successRate) {
        const typeText = type === 'land' ? '陆地' : type === 'sea' ? '海运' : '空运';
        console.log(`跨国传播失败(${typeText}): ${fromCountryId}(GDP${sourceCountry.gdp.toFixed(1)}) -> ${targetCountry.id}(GDP${targetCountry.gdp.toFixed(1)}), 成功率: ${(successRate * 100).toFixed(1)}%`);
        return;
      }
      
      // 传播成功
      targetCountry.infected = true;
      targetCountry.believers = config.initialBelievers;
      this.totalBelievers += config.initialBelievers;

      const typeText = type === 'land' ? '陆地' : type === 'sea' ? '海运' : '空运';
      console.log(`跨国传播成功(${typeText}): ${fromCountryId}(GDP${sourceCountry.gdp.toFixed(1)}) -> ${targetCountry.id}(GDP${targetCountry.gdp.toFixed(1)}), 初始信徒: ${config.initialBelievers}`);
    });
  }

  // 获取所有已感染国家
  getInfectedCountries() {
    return Array.from(this.countries.values()).filter(c => c.infected);
  }

  // 更新财富（新系统：从国家转移）
  updateWealth() {
    // 动态导入配置
    import('../data/gameConfig.js').then(module => {
      const transferConfig = module.getWealthTransferConfig();
      let totalTransferred = 0;
      
      // 遍历所有已感染国家
      const infectedCountries = this.getInfectedCountries();
      
      infectedCountries.forEach(country => {
        if (country.believers === 0) return;
        
        const believerRatio = country.believers / country.population;
        
        // 计算本回合转移量：国家GDP × 信徒占比 × 转移率
        const transferAmount = country.gdp * believerRatio * transferConfig.baseTransferRate;
        
        // 检查财富下限
        const minGdp = country.originalGdp * transferConfig.minWealthRatio;
        const actualTransfer = Math.min(transferAmount, Math.max(0, country.gdp - minGdp));
        
        if (actualTransfer > 0) {
          country.gdp -= actualTransfer;
          totalTransferred += actualTransfer;
          
          // 调试日志
          if (actualTransfer > 0.001) {
            console.log(`💰 财富转移: ${country.id} -${actualTransfer.toFixed(3)} (剩余${country.gdp.toFixed(2)}/${country.originalGdp.toFixed(2)})`);
          }
        }
      });
      
      this.wealth += totalTransferred;
      
      if (totalTransferred > 0.01) {
        console.log(`💰 本回合总转移: +${totalTransferred.toFixed(3)}, 累计财富: ${this.wealth.toFixed(2)}`);
      }
      
      return totalTransferred;
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
    
    // 检查是否所有有人口的国家都被感染且达到100%
    // 排除无人居住的岛屿（人口为0的国家）
    const allCountries = Array.from(this.countries.values());
    const inhabitedCountries = allCountries.filter(country => country.population > 0);
    const allInfected = inhabitedCountries.every(country => country.infected);
    
    if (allInfected && this.totalBelievers >= this.totalPopulation) {
      this.isVictory = true;
      console.log('🎉 胜利！所有有人居住的国家都已被完全征服！');
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
