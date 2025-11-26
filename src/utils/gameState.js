// gameState.js - 游戏状态管理
import { initializeCountries } from '../data/countryData.js';
import { processCountryEvents } from '../data/events.js';
import { NewsSystem } from '../components/NewsSystem.js';
import { SkillEffectManager } from '../skills/SkillEffectManager.js';

export class GameState {
  constructor(getStarNameFn) {
    this.countries = new Map(); // 国家数据
    this.totalPopulation = 0; // 全球总人口
    this.startCountry = null; // 起始国家
    this.totalBelievers = 0; // 全球总信徒
    this.wealth = 0; // 财富资源
    this.isGameStarted = false; // 游戏是否开始
    this.isVictory = false; // 是否已胜利
    this.onVictoryCallback = null; // 胜利回调
    this.onDefeatCallback = null; // 失败回调
    this.skillTree = null; // 技能树引用
    this.skillEffectManager = null; // ⭐ 天赋效果管理器
    this.turnCount = 0; // 回合计数
    this.lastUninfectedCheck = 0; // 上次检查未感染国家的回合
    this.lastUninfectedCount = 0; // 上次未感染国家数量
    this.newsSystem = new NewsSystem(this, getStarNameFn); // 新闻系统
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
    // ⭐ 创建天赋效果管理器
    this.skillEffectManager = new SkillEffectManager(skillTree);
  }

  /**
   * ⭐ 天赋效果管理系统（重构版）
   * 集中管理所有天赋对游戏各个系统的影响
   * 
   * 所有效果算法详见: /SKILL_EFFECTS_SPEC.md
   * 具体实现见: src/skills/SkillEffectManager.js
   * 
   * @param {string} effectType - 效果类型
   * @param {object} context - 上下文信息（可选）
   * @returns {number|object} 修正值或效果对象
   */
  getSkillModifier(effectType, context = {}) {
    // 使用天赋效果管理器
    if (this.skillEffectManager) {
      return this.skillEffectManager.getModifier(effectType, context);
    }
    
    // 降级处理：如果管理器未初始化，返回默认值
    return effectType === 'good_person_effect' 
      ? { modifier: 1.0, isCrownedVersion: false } 
      : 1.0;
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
      
      // 注意：game_start 新闻由 app.js 立即显示，不需要在这里记录到队列
    });
    
    this.isGameStarted = true;
    return true;
  }

  /**
   * 处理一个回合的所有事件
   * @returns {Array} 所有触发的事件数组
   */
  async processTurn() {
    if (!this.isGameStarted || this.isVictory) return [];

    this.turnCount++;
    const allTriggeredEvents = [];
    const infectedCountries = this.getInfectedCountries();

    // 处理每个已感染国家的所有事件
    for (const country of infectedCountries) {
      // 如果国家已经100%信教，跳过内部传播事件（但仍可能触发跨国传播）
      const isFullyConverted = country.believers >= country.population;
      
      const events = processCountryEvents(country, this.skillTree, this, isFullyConverted);
      
      // 记录传播前的信徒占比（用于检测里程碑）
      const oldRatio = country.believers / country.population;
      
      // 应用事件效果
      for (const event of events) {
        // 应用信徒变化
        if (event.believers > 0) {
          const oldBelievers = country.believers;
          country.believers += event.believers;
          
          // 确保不超过人口上限（人口 - 脱教者）
          const apostates = country.apostates || 0;
          const maxBelievers = country.population - apostates;
          if (country.believers > maxBelievers) {
            const actualIncrease = maxBelievers - oldBelievers;
            country.believers = maxBelievers;
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
          await this.handleCrossBorderSpread(event.sourceCountry);
        }
        
        allTriggeredEvents.push(event);
      }
      
      // 检查是否达到新的信徒里程碑
      const newRatio = country.believers / country.population;
      if (this.hasCrossedMilestone(oldRatio, newRatio)) {
        this.newsSystem.recordEvent('believers_milestone', {
          countryId: country.id
        });
      }
    }

    // 每回合更新财富（基于信徒）
    this.updateWealth();
    
    // ⭐ 脱教者产生财富（让哲学家势力重新创造财富）
    this.generateWealthFromApostates();

    // 检查失败条件（脱教者系统）
    this.checkDefeat();

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
  async handleCrossBorderSpread(fromCountryId) {
    // 动态导入配置
    const module = await import('../data/gameConfig.js');
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
      
      // ⭐ 天赋效果：同情天赋 - 穷国→富国传播加成
      // 参考: SKILL_EFFECTS_SPEC.md - SE-COMPASSION-02
      const skillModifier = this.getSkillModifier('poor_to_rich_spread', {
        sourceCountry: sourceCountry,
        targetCountry: targetCountry
      });
      successRate *= skillModifier;
      
      // TODO: 其他天赋效果
      // 例如：难民天赋可以进一步增加穷国→富国传播
      // 参考: SKILL_EFFECTS_SPEC.md - SE-REFUGEE-*
      
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
      
    // 记录跨国传播新闻
    this.newsSystem.recordEvent('cross_border_start', {
      sourceCountry: fromCountryId,
      targetCountry: targetCountry.id,
      countryId: targetCountry.id // 新闻发生地为目标国
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

  /**
   * ⭐ 脱教者产生财富
   * 脱教者越多，哲学家势力越强，缓慢创造新财富（而非转移）
   */
  generateWealthFromApostates() {
    const totalApostates = this.getTotalApostates();
    if (totalApostates === 0) return;
    
    // 基础生成率：每百万脱教者每回合生成0.1财富
    // 这个速率远低于信徒转移财富的速率，但可以让哲学家势力缓慢恢复
    const baseGenerationRate = 0.0001; // 每个脱教者每回合生成0.0001财富
    const wealthGenerated = totalApostates * baseGenerationRate;
    
    // 将生成的财富加到玩家的对立面（实际上是让全球经济增长）
    // 这里我们把它体现为"哲学家势力的隐形资源"
    // 通过降低玩家点击成功率来体现（已在effect中实现gdpRatio）
    
    // 但为了让玩家有反击机会，生成的财富应该分配给脱教者所在国家
    const infectedCountries = this.getInfectedCountries();
    infectedCountries.forEach(country => {
      if (country.apostates > 0) {
        const countryShare = country.apostates / totalApostates;
        const countryWealth = wealthGenerated * countryShare;
        
        // 恢复该国GDP（但不超过原始值）
        const newGdp = Math.min(country.gdp + countryWealth, country.originalGdp);
        if (newGdp > country.gdp) {
          const actualIncrease = newGdp - country.gdp;
          country.gdp = newGdp;
          
          if (actualIncrease > 0.001) {
            console.log(`📈 脱教者产生财富: ${country.id} +${actualIncrease.toFixed(3)} (脱教${country.apostates.toLocaleString()}人，GDP恢复至${country.gdp.toFixed(2)})`);
          }
        }
      }
    });
    
    if (wealthGenerated > 0.01) {
      console.log(`📈 脱教者总财富生成: ${wealthGenerated.toFixed(3)} (总脱教${totalApostates.toLocaleString()}人)`);
    }
  }

  // 获取国家信息
  getCountry(countryId) {
    return this.countries.get(countryId);
  }

  // 获取总信徒数
  getTotalBelievers() {
    return this.totalBelievers;
  }

  // 获取全球脱教者总数
  getTotalApostates() {
    let total = 0;
    for (const country of this.countries.values()) {
      total += country.apostates || 0;
    }
    return total;
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
  checkDefeat() {
    // 检查失败条件：所有已感染国家的信徒都变成了脱教者
    const infectedCountries = this.getInfectedCountries();
    
    if (infectedCountries.length === 0) return; // 没有感染国家，不检查
    
    // 计算总信徒和总脱教者
    let totalInfectedBelievers = 0;
    let totalInfectedApostates = 0;
    
    for (const country of infectedCountries) {
      totalInfectedBelievers += country.believers || 0;
      totalInfectedApostates += country.apostates || 0;
    }
    
    // 失败条件：信徒数为0且脱教者数量显著（至少有过一定规模的传播）
    if (totalInfectedBelievers === 0 && totalInfectedApostates > 1000) {
      this.isVictory = false; // 确保不是胜利状态
      this.isGameStarted = false; // 结束游戏
      console.log('💀 失败！你所宣传的思想已经被全世界抛弃！');
      
      // 调用失败回调
      if (this.onDefeatCallback) {
        this.onDefeatCallback();
      }
      
      alert('你所宣传的思想已经被全世界抛弃，最终湮没在了时间之中。\n\n游戏失败！');
      return true;
    }
    
    return false;
  }

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

  // 设置失败回调
  setDefeatCallback(callback) {
    this.onDefeatCallback = callback;
  }

  // 获取总人口
  getTotalPopulation() {
    return this.totalPopulation;
  }

  /**
   * 检查是否跨越了信徒里程碑
   * @param {number} oldRatio - 旧的信徒占比
   * @param {number} newRatio - 新的信徒占比
   * @returns {boolean} 是否跨越了里程碑
   */
  hasCrossedMilestone(oldRatio, newRatio) {
    const milestones = [0.1, 0.25, 0.5, 0.75, 1.0];
    
    for (const milestone of milestones) {
      if (oldRatio < milestone && newRatio >= milestone) {
        return true;
      }
    }
    
    return false;
  }
}
