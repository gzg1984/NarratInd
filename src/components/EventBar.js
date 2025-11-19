// EventBar.js - 事件栏组件（悬浮在地图上方，可折叠）
export class EventBar {
  constructor(containerId, infoBar, getStarNameFn) {
    this.container = document.getElementById(containerId);
    this.infoBar = infoBar;
    this.getStarName = getStarNameFn;
    this.eventTimer = null;
    this.eventList = [
      { text: '"你的明星"的信徒自发地传播，扩大的影响。', believers: 10 },
      { text: '"你的明星"吸引了一部分对现状不满的人。', believers: 10 },
      { text: '"你的明星"真的帮助到了某些人。', believers: 10 }
    ];
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
    this.eventTimer = setInterval(() => {
      this.triggerRandomEvent();
    }, 2000); // 每2秒触发一次
  }

  // 停止事件循环
  stopEventLoop() {
    if (this.eventTimer) {
      clearInterval(this.eventTimer);
      this.eventTimer = null;
    }
  }

  // 触发随机事件
  triggerRandomEvent() {
    const randomIndex = Math.floor(Math.random() * this.eventList.length);
    const event = this.eventList[randomIndex];
    
    // 获取明星名字并替换
    const starName = this.getStarName();
    const eventText = event.text.replace('"你的明星"', `"${starName}"`);
    
    // 添加到历史记录
    this.addEventToHistory(eventText, event.believers);
    
    // 更新信徒数量
    if (this.infoBar) {
      const currentStats = this.infoBar.getStats();
      this.infoBar.updateStats(
        currentStats.infected + event.believers,
        currentStats.deaths,
        currentStats.cured
      );
    }
  }

  // 添加事件到历史记录
  addEventToHistory(eventText, believers) {
    const timestamp = new Date().toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
    
    this.eventHistory.unshift({
      text: eventText,
      believers: believers,
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