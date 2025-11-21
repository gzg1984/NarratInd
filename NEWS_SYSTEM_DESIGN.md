# 新闻播报系统设计文档

## 一、概述

将顶部事件框改造为新闻播报系统，用新闻腔调播报游戏内发生的事件，增强沉浸感。

## 二、核心需求

### 2.1 基础功能
1. **点击反对者失败不显示消息**，但后台记录失败次数
2. **事件框改为新闻播报**：不再直接显示信徒变化，而是播报游戏事件的"新闻"
3. **新闻有报道机构**：根据事件发生地选择媒体（BBC/ABC/新华社/X等）
4. **新闻内容模板化**：每种事件对应多个新闻说辞，随机选择
5. **时间解耦**：回合2秒/次，新闻播报5秒/次
6. **新闻延迟播报**：播报过去3个回合内的事件
7. **新闻历史记录**：保存所有新闻，超过100条时智能采样删除
8. **游戏结束回放**：展开新闻框，滚动播放所有历史新闻

### 2.2 媒体机构选择逻辑

#### 主流媒体映射
```javascript
媒体类型映射 = {
  欧美富国: ['BBC', 'CNN', 'NBC', 'ABC', 'Reuters', 'AP'],
  亚洲富国: ['NHK', 'KBS', '新华社', 'CNA'],
  拉美: ['Telesur', 'Globo'],
  中东: ['Al Jazeera', 'Al Arabiya'],
  穷国/小国: 使用邻国或大国媒体,
  全球事件: ['X', 'Facebook', 'Reddit', 'TikTok']
}
```

#### 选择规则
1. **有本地主流媒体**：70%本地 + 30%国际/网络
2. **无本地媒体**（穷国/小国）：50%邻国 + 50%网络
3. **跨国事件**：优先使用目标国媒体或国际媒体
4. **反对者事件**：倾向使用本地或网络媒体

### 2.3 新闻模板库结构

文件：`src/data/newsTemplates.js`

```javascript
export const newsTemplates = {
  // 游戏开始
  game_start: [
    '{media}：在{country}发现了一种新的宗教思潮。',
    '{media}：{country}出现神秘信仰，引发关注。',
    '{media}：{country}民众开始追随一种新的精神运动。'
  ],
  
  // 信徒增长里程碑
  believers_10: [
    '{media}：{country}约10%的人口已接受新信仰。',
    '{media}：新思潮在{country}快速蔓延，已有十分之一人口加入。'
  ],
  believers_25: [
    '{media}：{country}四分之一人口信奉新宗教，社会开始分化。'
  ],
  believers_50: [
    '{media}：{religion}已成为{country}的主流信仰。',
    '{media}：{country}过半人口信仰{religion}，政局可能生变。'
  ],
  believers_75: [
    '{media}：{religion}在{country}占据绝对优势地位。'
  ],
  believers_100: [
    '{media}：{country}全境皈依{religion}，完成信仰统一。',
    '{media}：{country}成为{religion}圣地，全民信教。'
  ],
  
  // 跨国传播
  cross_border_start: [
    '{media}：{religion}的风潮从{source}传播到了{target}。',
    '{media}：{target}发现来自{source}的宗教渗透迹象。',
    '{media}：{source}信徒越境进入{target}，引发争议。'
  ],
  
  // 好人事件
  good_person_click: [
    '{media}：{country}一位慈善家公开支持{religion}。',
    '{media}：{country}社会活动家为{religion}发声。',
    '{media}：{religion}在{country}获得名人背书。'
  ],
  good_person_timeout: [
    '{media}：{country}一场支持{religion}的集会因故取消。'
  ],
  
  // 反对者事件
  opponent_appear: [
    '{media}：{country}出现抗议{religion}的示威活动。',
    '{media}：{country}民众质疑{religion}的合法性。',
    '{media}：{religion}在{country}遭遇强烈反对声浪。'
  ],
  opponent_click_success: [
    '{media}：近日，一名抗议{religion}的人被证实患有精神疾病。',
    '{media}：{country}反对派领袖被曝丑闻，声誉扫地。',
    '{media}：调查显示，{country}的抗议活动系境外势力操纵。',
    '{media}：{country}警方逮捕多名反{religion}煽动者。'
  ],
  opponent_timeout: [
    '{media}：{country}的反{religion}运动愈演愈烈，大批信徒脱离。',
    '{media}：{religion}在{country}遭遇信任危机，教徒纷纷退出。',
    '{media}：{country}爆发脱教潮，{religion}陷入困境。'
  ],
  
  // 财富变化
  wealth_gain: [
    '{media}：{religion}基金会获得巨额捐款。',
    '{media}：{religion}商业帝国版图扩张。'
  ],
  wealth_drain: [
    '{media}：{religion}涉嫌金融欺诈，资金链紧张。'
  ],
  
  // 信徒流失事件
  believer_loss: [
    '{media}：{country}经济崩溃，{religion}信徒大量流失。',
    '{media}：贫困导致{country}民众对{religion}失去信心。'
  ],
  
  // 游戏结束
  victory: [
    '{media}：{religion}成为全球唯一信仰，新纪元到来。',
    '{media}：人类历史翻开新篇章，{religion}统一世界。'
  ],
  defeat: [
    '{media}：{religion}思潮消亡，被历史遗忘。',
    '{media}：{religion}运动彻底失败，创始人下落不明。'
  ]
};

// 媒体机构配置
export const mediaOutlets = {
  // 按国家/地区分类
  US: ['CNN', 'NBC', 'ABC', 'Fox News', 'New York Times'],
  GB: ['BBC', 'The Guardian', 'Sky News'],
  CN: ['新华社', 'CGTN', '人民日报'],
  JP: ['NHK', 'Asahi Shimbun'],
  KR: ['KBS', 'Yonhap'],
  FR: ['AFP', 'France 24'],
  DE: ['DW', 'Der Spiegel'],
  RU: ['TASS', 'RT'],
  IN: ['NDTV', 'Times of India'],
  BR: ['Globo', 'Folha'],
  AU: ['ABC Australia', 'SBS'],
  
  // 中东
  middleEast: ['Al Jazeera', 'Al Arabiya', 'i24News'],
  
  // 全球网络媒体
  social: ['X', 'Facebook', 'Reddit', 'TikTok', 'YouTube'],
  
  // 国际通讯社
  international: ['Reuters', 'AP', 'AFP', 'Bloomberg']
};

// 国家到媒体的映射
export function getMediaForCountry(countryId, neighbors, eventType) {
  // 实现逻辑见后续
}
```

## 三、系统架构

### 3.1 新增文件

```
src/data/newsTemplates.js      # 新闻模板库
src/components/NewsSystem.js   # 新闻系统核心逻辑
src/components/NewsBar.js       # 原EventBar改名，专注UI展示
```

### 3.2 核心类设计

#### NewsSystem类
```javascript
class NewsSystem {
  constructor(gameState) {
    this.gameState = gameState;
    this.newsQueue = [];           // 近3回合的待播新闻
    this.newsHistory = [];         // 所有历史新闻（最多100条）
    this.lastBroadcastTime = 0;    // 上次播报时间
    this.broadcastInterval = 5000; // 5秒播报间隔
  }
  
  // 记录游戏事件，转换为新闻
  recordEvent(eventType, data) {
    const news = this.generateNews(eventType, data);
    this.newsQueue.push(news);
    
    // 保持队列为3回合内的事件（假设2秒/回合，6秒内）
    const now = Date.now();
    this.newsQueue = this.newsQueue.filter(
      n => now - n.timestamp < 6000
    );
  }
  
  // 生成新闻
  generateNews(eventType, data) {
    const template = this.selectTemplate(eventType);
    const media = this.selectMedia(data.countryId, eventType);
    const content = this.fillTemplate(template, data, media);
    
    return {
      id: Date.now() + Math.random(),
      timestamp: Date.now(),
      type: eventType,
      media: media,
      content: content,
      countryId: data.countryId
    };
  }
  
  // 选择媒体机构
  selectMedia(countryId, eventType) {
    // 根据国家和事件类型选择合适的媒体
  }
  
  // 获取待播报的新闻（5秒轮询调用）
  getNextNews() {
    if (this.newsQueue.length === 0) return null;
    
    // 随机选择一条
    const index = Math.floor(Math.random() * this.newsQueue.length);
    const news = this.newsQueue[index];
    
    // 添加到历史
    this.addToHistory(news);
    
    return news;
  }
  
  // 添加到历史记录
  addToHistory(news) {
    this.newsHistory.push(news);
    
    // 超过100条时智能采样
    if (this.newsHistory.length > 100) {
      this.pruneHistory();
    }
  }
  
  // 智能删除历史（保留重要事件）
  pruneHistory() {
    // 优先级：游戏开始 > 跨国传播 > 里程碑 > 其他
    // 按比例随机删除低优先级新闻
    const priorities = {
      game_start: 10,
      cross_border_start: 8,
      believers_50: 7,
      believers_100: 9,
      opponent_timeout: 6,
      default: 3
    };
    
    // 计算每条新闻的保留概率
    const weighted = this.newsHistory.map(n => ({
      news: n,
      priority: priorities[n.type] || priorities.default
    }));
    
    // 删除优先级最低的20%
    weighted.sort((a, b) => a.priority - b.priority);
    const toKeep = Math.floor(this.newsHistory.length * 0.8);
    this.newsHistory = weighted.slice(-toKeep).map(w => w.news);
  }
  
  // 游戏结束时获取所有历史
  getAllHistory() {
    return this.newsHistory;
  }
}
```

### 3.3 集成点

#### GameState.processTurn()
```javascript
processTurn() {
  // ... 现有逻辑 ...
  
  // 记录事件到新闻系统
  for (const event of allTriggeredEvents) {
    this.newsSystem.recordEvent(event.eventId, {
      countryId: event.countryId,
      believers: event.believers,
      // ... 其他数据
    });
  }
}
```

#### SpecialEvents点击处理
```javascript
// 反对者点击失败：不显示消息，但记录
if (result.success === false) {
  eventData.failedClicks = (eventData.failedClicks || 0) + 1;
  console.log(`点击失败 (累计${eventData.failedClicks}次)`);
  return; // 不调用showEventMessage
}

// 点击成功：记录到新闻系统
if (result.success === true) {
  gameState.newsSystem.recordEvent('opponent_click_success', {
    countryId: eventData.countryId,
    destroyed: result.destroyed
  });
}
```

#### App.js轮询逻辑
```javascript
// 现有：2秒回合更新
setInterval(() => {
  gameState.processTurn();
}, 2000);

// 新增：5秒新闻播报
setInterval(() => {
  const news = gameState.newsSystem.getNextNews();
  if (news) {
    newsBar.displayNews(news);
  }
}, 5000);
```

#### NewsBar.displayNews()
```javascript
displayNews(news) {
  this.newsElement.textContent = news.content;
  this.newsElement.style.animation = 'fadeIn 0.5s';
}
```

#### 游戏结束回放
```javascript
onVictory() {
  this.isVictory = true;
  
  // 触发新闻回放
  this.newsBar.playbackHistory(
    this.newsSystem.getAllHistory()
  );
}

// NewsBar.playbackHistory()
playbackHistory(history) {
  this.expand(); // 展开新闻框
  
  let index = 0;
  const interval = setInterval(() => {
    if (index >= history.length) {
      clearInterval(interval);
      return;
    }
    
    this.displayNews(history[index]);
    index++;
  }, 2000); // 每2秒播报一条
}
```

## 四、实现分阶段计划

### Phase 1：基础框架（15-20分钟）
- [x] 点击反对者失败不显示，记录failedClicks
- [ ] 创建newsTemplates.js基础结构
- [ ] 创建NewsSystem.js骨架类
- [ ] 实现基础事件→新闻转换（game_start, believers_milestone, cross_border）

### Phase 2：新闻播报核心（30-40分钟）
- [ ] 完善新闻模板库（所有事件类型）
- [ ] 实现媒体选择逻辑（getMediaForCountry）
- [ ] 新闻队列管理（3回合窗口）
- [ ] 修改EventBar为NewsBar，实现5秒轮询
- [ ] 集成GameState与NewsSystem

### Phase 3：历史与回放（30-40分钟）
- [ ] 新闻历史记录（100条限制）
- [ ] 智能采样删除算法（pruneHistory）
- [ ] 游戏结束触发回放
- [ ] NewsBar.playbackHistory UI实现
- [ ] 测试完整流程

## 五、数据流图

```
游戏事件 → GameState.processTurn()
           ↓
      NewsSystem.recordEvent()
           ↓
      生成News对象 → newsQueue (3回合窗口)
           ↓
  5秒轮询 → getNextNews() → 随机选择一条
           ↓
      addToHistory() → newsHistory (最多100条)
           ↓
      NewsBar.displayNews() → 前端展示
           
游戏结束 → getAllHistory() → NewsBar.playbackHistory()
```

## 六、关键技术细节

### 6.1 时间管理
- 回合计算：2秒/次（不变）
- 新闻播报：5秒/次（独立定时器）
- 新闻队列：保留过去6秒（3回合）的事件
- 回放速度：2秒/条

### 6.2 新闻优先级
```javascript
const eventPriority = {
  game_start: 10,        // 最重要
  victory: 10,
  defeat: 10,
  believers_100: 9,
  cross_border_start: 8,
  believers_50: 7,
  opponent_timeout: 6,
  good_person_click: 5,
  opponent_click_success: 5,
  believers_25: 4,
  believers_10: 3,
  opponent_appear: 3,
  wealth_change: 2       // 最不重要
};
```

### 6.3 模板变量替换
```javascript
fillTemplate(template, data, media) {
  return template
    .replace('{media}', media)
    .replace('{country}', this.getCountryName(data.countryId))
    .replace('{religion}', '新信仰') // 可配置
    .replace('{source}', this.getCountryName(data.sourceCountry))
    .replace('{target}', this.getCountryName(data.targetCountry));
}
```

### 6.4 媒体选择算法伪代码
```javascript
selectMedia(countryId, eventType) {
  const country = this.gameState.getCountry(countryId);
  
  // 1. 确定国家媒体池
  let mediaPool = mediaOutlets[countryId];
  
  if (!mediaPool || country.wealthLevel < 5) {
    // 穷国：使用邻国或网络媒体
    const neighborMedia = this.getNeighborMedia(country.neighbors);
    mediaPool = [...neighborMedia, ...mediaOutlets.social];
  }
  
  // 2. 根据事件类型调整概率
  if (eventType.includes('opponent')) {
    // 反对者事件倾向网络媒体
    mediaPool = [...mediaPool, ...mediaOutlets.social, ...mediaOutlets.social];
  }
  
  if (eventType.includes('cross_border')) {
    // 跨国事件倾向国际媒体
    mediaPool = [...mediaPool, ...mediaOutlets.international];
  }
  
  // 3. 随机选择
  return mediaPool[Math.floor(Math.random() * mediaPool.length)];
}
```

## 七、测试要点

1. **时间解耦测试**：回合2秒，新闻5秒，不互相阻塞
2. **队列窗口测试**：只播报3回合内的事件
3. **历史限制测试**：超过100条后正确采样删除
4. **媒体选择测试**：不同国家/事件类型选择合理媒体
5. **模板覆盖测试**：所有事件类型都有对应新闻
6. **回放测试**：游戏结束后正确播放所有历史
7. **边界情况**：无事件时不播报，多事件时随机选择

## 八、未来扩展

1. **新闻影响传播**：播报过的事件提高传播效率
2. **新闻优先级动态调整**：根据玩家行为调整
3. **媒体立场系统**：不同媒体有不同播报倾向
4. **多语言支持**：根据国家使用不同语言播报
5. **新闻互动**：玩家可以"控制"或"屏蔽"某些媒体

---

**文档版本**：v1.0  
**创建日期**：2025-11-20  
**最后更新**：2025-11-20
