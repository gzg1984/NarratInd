// gameState.js - 游戏状态管理
export class GameState {
  constructor() {
    this.countries = new Map(); // 国家数据
    this.startCountry = null; // 起始国家
    this.totalBelievers = 0; // 全球总信徒
    this.totalPopulation = 0; // 全球总人口
    this.wealth = 0; // 财富资源
    this.isGameStarted = false; // 游戏是否开始
    this.isVictory = false; // 是否已胜利
    this.onVictoryCallback = null; // 胜利回调
    this.initCountryData();
  }

  // 初始化国家数据（虚拟数据）
  initCountryData() {
    // 格式: [国家ID, 人口(百万), 财富等级(1-10)]
    const countryData = [
      // 北美 - 富裕
      ['US', 330, 10], // 美国
      ['CA', 38, 9],   // 加拿大
      ['MX', 128, 5],  // 墨西哥
      
      // 南美 - 中等
      ['BR', 212, 6],  // 巴西
      ['AR', 45, 5],   // 阿根廷
      ['CL', 19, 6],   // 智利
      ['CO', 51, 4],   // 哥伦比亚
      ['PE', 33, 4],   // 秘鲁
      
      // 欧洲 - 富裕
      ['GB', 67, 9],   // 英国
      ['FR', 65, 9],   // 法国
      ['DE', 83, 10],  // 德国
      ['IT', 60, 8],   // 意大利
      ['ES', 47, 8],   // 西班牙
      ['PL', 38, 6],   // 波兰
      ['RO', 19, 5],   // 罗马尼亚
      ['NL', 17, 9],   // 荷兰
      ['BE', 11, 9],   // 比利时
      ['SE', 10, 9],   // 瑞典
      ['NO', 5, 10],   // 挪威
      ['FI', 5, 9],    // 芬兰
      ['DK', 6, 9],    // 丹麦
      
      // 东亚 - 富裕
      ['CN', 1400, 7], // 中国
      ['JP', 126, 9],  // 日本
      ['KR', 52, 8],   // 韩国
      ['TW', 24, 8],   // 台湾
      
      // 东南亚 - 中等
      ['ID', 273, 4],  // 印尼
      ['PH', 110, 3],  // 菲律宾
      ['VN', 97, 4],   // 越南
      ['TH', 70, 5],   // 泰国
      ['MY', 32, 6],   // 马来西亚
      ['SG', 6, 10],   // 新加坡
      
      // 南亚 - 贫穷到中等
      ['IN', 1380, 4], // 印度
      ['PK', 220, 3],  // 巴基斯坦
      ['BD', 164, 2],  // 孟加拉
      
      // 中东 - 中等到富裕
      ['SA', 35, 8],   // 沙特
      ['IR', 84, 5],   // 伊朗
      ['IQ', 40, 4],   // 伊拉克
      ['TR', 84, 6],   // 土耳其
      ['EG', 102, 4],  // 埃及
      ['AE', 10, 10],  // 阿联酋
      
      // 非洲 - 贫穷
      ['ZA', 59, 5],   // 南非
      ['NG', 206, 2],  // 尼日利亚
      ['ET', 115, 1],  // 埃塞俄比亚
      ['EG', 102, 3],  // 埃及
      ['KE', 53, 2],   // 肯尼亚
      ['GH', 31, 2],   // 加纳
      
      // 俄罗斯和中亚 - 中等
      ['RU', 146, 6],  // 俄罗斯
      ['KZ', 19, 5],   // 哈萨克斯坦
      ['UZ', 34, 3],   // 乌兹别克斯坦
      
      // 大洋洲 - 富裕
      ['AU', 26, 9],   // 澳大利亚
      ['NZ', 5, 9],    // 新西兰
    ];

    countryData.forEach(([id, population, wealthLevel]) => {
      const actualPopulation = population * 1000000;
      this.totalPopulation += actualPopulation;
      this.countries.set(id, {
        id: id,
        population: actualPopulation, // 转换为实际人口数
        wealthLevel: wealthLevel,
        believers: 0, // 当前信徒数
        infected: false, // 是否已感染
        eventHistory: [], // 事件历史
        lastEventTime: 0 // 上次事件时间
      });
    });
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

    this.startCountry = countryId;
    country.infected = true;
    country.believers = 100; // 起始信徒数
    this.totalBelievers = 100;
    this.isGameStarted = true;

    console.log(`游戏开始于: ${countryId}, 人口: ${country.population}, 财富等级: ${country.wealthLevel}`);
    return true;
  }

  // 触发事件（在特定国家）
  triggerEvent(countryId, eventType) {
    const country = this.countries.get(countryId);
    if (!country || !country.infected) return null;

    let believerChange = 0;
    let eventText = '';

    switch (eventType) {
      case 'self_spread': // 自发传播 - 增加当前信徒的1%
        believerChange = Math.ceil(country.believers * 0.01);
        eventText = '的信徒自发地传播，扩大了影响';
        break;

      case 'attract_dissatisfied': // 吸引不满者 - 未信教者的1%
        if (country.believers / country.population < 0.5) {
          const nonBelievers = country.population - country.believers;
          believerChange = Math.ceil(nonBelievers * 0.01);
          eventText = '吸引了一部分对现状不满的人';
        } else {
          return null; // 超过50%不触发
        }
        break;

      case 'real_help': // 真实帮助 - 固定增加
        believerChange = 50;
        eventText = '真的帮助到了某些人';
        break;
    }

    if (believerChange > 0) {
      country.believers += believerChange;
      this.totalBelievers += believerChange;

      // 检查是否超过50%，可能触发跨国传播
      if (country.believers / country.population > 0.5) {
        this.trySpreadToNeighbor(countryId);
      }

      // 检查胜利条件
      this.checkVictory();

      return {
        countryId: countryId,
        eventText: eventText,
        believerChange: believerChange,
        currentBelievers: country.believers,
        percentage: (country.believers / country.population * 100).toFixed(2)
      };
    }

    return null;
  }

  // 尝试跨国传播
  trySpreadToNeighbor(fromCountryId) {
    // 10%概率触发跨国传播
    if (Math.random() > 0.1) return;

    // 简单实现：随机选择一个未感染的国家
    const uninfectedCountries = Array.from(this.countries.values())
      .filter(c => !c.infected);

    if (uninfectedCountries.length === 0) return;

    const randomCountry = uninfectedCountries[Math.floor(Math.random() * uninfectedCountries.length)];
    randomCountry.infected = true;
    randomCountry.believers = 10; // 初始传播信徒数
    this.totalBelievers += 10;

    console.log(`跨国传播: ${fromCountryId} -> ${randomCountry.id}`);
  }

  // 获取所有已感染国家
  getInfectedCountries() {
    return Array.from(this.countries.values()).filter(c => c.infected);
  }

  // 更新财富（基于信徒数量）
  updateWealth() {
    const wealthGain = Math.floor(this.totalBelievers * 0.0001); // 0.01%
    this.wealth += wealthGain;
    return wealthGain;
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
    
    if (this.totalBelievers >= this.totalPopulation) {
      this.isVictory = true;
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
