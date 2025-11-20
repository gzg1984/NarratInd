// EventBar.js - 事件栏组件（悬浮在地图上方，可折叠）
export class EventBar {
  constructor(containerId, infoBar, getStarNameFn, mapArea, gameState) {
    this.container = document.getElementById(containerId);
    this.infoBar = infoBar;
    this.getStarName = getStarNameFn;
    this.mapArea = mapArea;
    this.gameState = gameState;
    this.eventTimer = null;
    this.eventHistory = [];
    this.maxHistoryLength = 10; // 最多显示10条历史
    this.isExpanded = false; // 是否展开
    this.latestEvent = null; // 最新事件
    this.init();
  }

  init() {
    this.render();
    this.setupEventListeners();
    this.startEventLoop();
    this.showInitialPrompt();
  }

  // 显示初始提示
  showInitialPrompt() {
    if (!this.gameState.isStarted()) {
      const starName = this.getStarName();
      const promptText = `欢迎来到叙事工业！点击世界地图上的任意国家，开始传播"${starName}"的观念...`;
      
      const notificationText = document.getElementById('event-text');
      if (notificationText) {
        notificationText.textContent = promptText;
        notificationText.style.color = '#ffd700';
      }
    }
  }

  // 显示游戏开始事件
  showGameStartEvent(countryId) {
    const starName = this.getStarName();
    const startText = `"${starName}"的观念开始在"${countryId}"传播！`;
    
    this.addEventToHistory(startText, 100, countryId);
    
    // 重置通知文本颜色
    const notificationText = document.getElementById('event-text');
    if (notificationText) {
      notificationText.style.color = '#ecf0f1';
    }
  }

  // 显示胜利事件
  showVictoryEvent() {
    const starName = this.getStarName();
    
    // 动态导入胜利消息
    import('../data/victoryMessages.js').then(module => {
      const victoryMessage = module.getRandomVictoryMessage(starName);
      
      this.addEventToHistory(victoryMessage, 0, 'GLOBAL');
      
      // 高亮显示胜利消息
      const notificationText = document.getElementById('event-text');
      if (notificationText) {
        notificationText.textContent = victoryMessage;
        notificationText.style.color = '#ffd700';
        notificationText.style.fontWeight = 'bold';
      }
      
      // 停止事件循环
      if (this.eventTimer) {
        clearInterval(this.eventTimer);
        this.eventTimer = null;
      }
    });
  }

  render() {
    if (!this.container) return;
    
    // 渲染悬浮的事件通知栏
    this.container.innerHTML = `
      <div id="event-notification" style="
        cursor: pointer;
        padding: 10px 15px;
        background-color: rgba(13, 27, 42, 0.95);
        border: 2px solid #1976d2;
        border-radius: 6px;
        color: #ecf0f1;
        font-size: 13px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
      ">
        <span id="event-text">等待事件发生...</span>
      </div>
      <div id="event-log-panel" style="
        display: none;
        margin-top: 10px;
        padding: 15px;
        background-color: rgba(13, 27, 42, 0.95);
        border: 2px solid #1976d2;
        border-radius: 8px;
        max-height: 400px;
        overflow-y: auto;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      ">
        <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #64b5f6; border-bottom: 1px solid #1976d2; padding-bottom: 5px;">事件历史</h3>
        <div id="event-log" style="font-size: 12px; line-height: 1.6;">
          <p style="color: #bdc3c7; font-style: italic;">暂无历史记录</p>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const notification = document.getElementById('event-notification');
    if (notification) {
      notification.addEventListener('click', () => this.togglePanel());
    }
  }

  // 切换面板展开/收起
  togglePanel() {
    this.isExpanded = !this.isExpanded;
    const panel = document.getElementById('event-log-panel');
    if (panel) {
      panel.style.display = this.isExpanded ? 'block' : 'none';
    }
  }

  // 开始事件循环
  startEventLoop() {
    // 动态导入配置
    import('../data/gameConfig.js').then(module => {
      const interval = module.getTurnInterval();
      
      this.eventTimer = setInterval(() => {
        if (this.gameState.isStarted()) {
          this.triggerPeriodEvents();
        }
      }, interval); // 使用配置的回合间隔
      
      console.log(`事件循环已启动，间隔: ${interval}ms`);
    });
  }

  // 停止事件循环
  stopEventLoop() {
    if (this.eventTimer) {
      clearInterval(this.eventTimer);
      this.eventTimer = null;
    }
  }

  // 触发周期内所有国家的事件（新系统）
  triggerPeriodEvents() {
    const infected = this.gameState.getInfectedCountries();
    if (infected.length === 0) return;

    // 处理一个回合的所有事件
    const allEvents = this.gameState.processTurn();

    // 只显示信徒变化最大的事件
    if (allEvents.length > 0) {
      this.showTopEvent(allEvents);
    }

    // 更新所有已感染国家的视觉效果
    if (this.mapArea) {
      this.mapArea.updateAllInfectedCountries();
    }

    // 更新总信徒数显示
    this.updateTotalBelievers();
    
    // 更新技能树财富显示
    if (window.skillTree) {
      window.skillTree.updateWealthDisplay();
    }
  }

  // 显示信徒变化最大的事件
  showTopEvent(events) {
    // 过滤出有信徒变化的事件
    const believerEvents = events.filter(e => e.believers > 0);
    
    if (believerEvents.length === 0) return;
    
    // 找到信徒变化最大的事件
    const topEvent = believerEvents.reduce((max, event) => 
      event.believers > max.believers ? event : max
    );

    const starName = this.getStarName();
    const fullText = `${topEvent.countryId}: ${topEvent.eventName}`;
    
    this.addEventToHistory(fullText, topEvent.believers, topEvent.countryId);
  }

  // 更新总信徒数显示
  updateTotalBelievers() {
    if (this.infoBar) {
      const totalBelievers = this.gameState.getTotalBelievers();
      const totalPopulation = this.gameState.totalPopulation;
      this.infoBar.updateStats(totalBelievers, 0, 0, totalPopulation);
    }
  }

  // 添加事件到历史记录
  addEventToHistory(eventText, believers, countryId) {
    const timestamp = new Date().toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
    
    this.eventHistory.unshift({
      text: eventText,
      believers: believers,
      countryId: countryId,
      time: timestamp
    });
    
    // 限制历史记录长度
    if (this.eventHistory.length > this.maxHistoryLength) {
      this.eventHistory.pop();
    }
    
    // 更新最新事件显示
    this.latestEvent = { text: eventText, believers: believers };
    this.updateNotification();
    
    // 更新历史记录显示
    this.updateEventLog();
  }

  // 更新通知栏显示
  updateNotification() {
    const notificationText = document.getElementById('event-text');
    if (notificationText && this.latestEvent) {
      notificationText.textContent = `${this.latestEvent.text} (+${this.latestEvent.believers} 信徒)`;
    }
  }

  // 更新事件日志显示
  updateEventLog() {
    const logContainer = document.getElementById('event-log');
    if (!logContainer) return;
    
    if (this.eventHistory.length === 0) {
      logContainer.innerHTML = '<p style="color: #bdc3c7; font-style: italic;">暂无历史记录</p>';
      return;
    }
    
    logContainer.innerHTML = this.eventHistory.map(event => `
      <div style="margin-bottom: 8px; padding: 8px; background-color: rgba(25, 118, 210, 0.1); border-radius: 4px; border-left: 3px solid #1976d2;">
        <div style="color: #64b5f6; font-size: 10px; margin-bottom: 3px;">${event.time}</div>
        <div style="color: #ecf0f1;">${event.text}</div>
        <div style="color: #4caf50; font-size: 11px; margin-top: 3px;">+${event.believers} 信徒</div>
      </div>
    `).join('');
  }

  // 设置事件列表（供其他组件调用）
  setEventList(newEventList) {
    this.eventList = newEventList;
  }

  // 获取事件列表
  getEventList() {
    return this.eventList;
  }
}