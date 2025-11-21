// NewsBar.js - 新闻播报栏组件（改造自EventBar）

export class NewsBar {
  constructor(containerId, gameState) {
    this.container = document.getElementById(containerId);
    this.gameState = gameState;
    this.currentNews = null;
    this.broadcastInterval = null;
    this.isExpanded = false;
    this.init();
  }

  init() {
    this.render();
    this.setupEventListeners();
    this.showInitialMessage();
  }

  // 显示初始消息
  showInitialMessage() {
    const newsText = document.getElementById('news-text');
    if (newsText && !this.gameState.isStarted()) {
      newsText.textContent = '点击世界地图上的任意国家，开始传播你的思想...';
      newsText.style.color = '#ffd700';
    }
  }

  // 开始新闻播报（5秒轮询）
  startBroadcast() {
    // 清除可能存在的旧定时器
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
    }

    // 首次立即播报
    this.broadcastNews();

    // 设置5秒轮询
    this.broadcastInterval = setInterval(() => {
      this.broadcastNews();
    }, 5000);

    console.log('📻 新闻播报系统已启动（5秒/次）');
  }

  // 停止新闻播报
  stopBroadcast() {
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
      this.broadcastInterval = null;
      console.log('📻 新闻播报系统已停止');
    }
  }

  // 播报新闻（从NewsSystem获取）
  broadcastNews() {
    if (!this.gameState || !this.gameState.newsSystem) return;

    const news = this.gameState.newsSystem.getNextNews();
    if (news) {
      this.displayNews(news);
    }
  }

  // 显示新闻
  displayNews(news) {
    const newsText = document.getElementById('news-text');
    if (!newsText) return;

    this.currentNews = news;
    newsText.textContent = news.content;
    newsText.style.color = '#ecf0f1';
    newsText.style.fontWeight = 'normal';

    // 添加淡入动画
    newsText.style.animation = 'none';
    setTimeout(() => {
      newsText.style.animation = 'fadeIn 0.5s ease-in';
    }, 10);

    console.log(`📺 播报新闻: ${news.content}`);
  }

  // 立即显示特定新闻（不等待轮询，用于重要事件）
  displayNewsImmediately(eventType, data) {
    if (!this.gameState || !this.gameState.newsSystem) return;

    // 生成新闻并立即显示
    const news = this.gameState.newsSystem.generateNewsImmediately(eventType, data);
    if (news) {
      this.displayNews(news);
      // 同时添加到历史记录
      this.gameState.newsSystem.addToHistory(news);
    }
  }

  // 显示游戏结束新闻
  showGameEndNews(isVictory) {
    const eventType = isVictory ? 'victory' : 'defeat';
    
    // 记录游戏结束新闻
    this.gameState.newsSystem.recordEvent(eventType, {
      countryId: this.gameState.startCountry || 'GLOBAL'
    });

    // 立即播报
    this.broadcastNews();

    // 停止定时播报
    this.stopBroadcast();

    // 高亮显示
    const newsText = document.getElementById('news-text');
    if (newsText) {
      newsText.style.color = isVictory ? '#ffd700' : '#e74c3c';
      newsText.style.fontWeight = 'bold';
    }
  }

  // 渲染UI
  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div id="news-bar-main" style="
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
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 16px;">📰</span>
          <span id="news-text">等待新闻...</span>
        </div>
      </div>
      <div id="news-history-panel" style="
        display: none;
        margin-top: 10px;
        padding: 15px;
        background-color: rgba(13, 27, 42, 0.95);
        border: 2px solid #1976d2;
        border-radius: 6px;
        max-height: 400px;
        overflow-y: auto;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h3 style="margin: 0; color: #1976d2; font-size: 14px;">新闻历史</h3>
          <button id="close-history" style="
            background: none;
            border: none;
            color: #e74c3c;
            cursor: pointer;
            font-size: 18px;
            padding: 0;
          ">×</button>
        </div>
        <div id="news-history-content" style="
          max-height: 350px;
          overflow-y: auto;
        ">
          <!-- 历史新闻将在这里显示 -->
        </div>
      </div>
    `;

    // 添加CSS动画
    if (!document.getElementById('news-bar-styles')) {
      const style = document.createElement('style');
      style.id = 'news-bar-styles';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        #news-bar-main:hover {
          border-color: #64b5f6;
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
        }
        
        #news-history-content::-webkit-scrollbar {
          width: 8px;
        }
        
        #news-history-content::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        
        #news-history-content::-webkit-scrollbar-thumb {
          background: #1976d2;
          border-radius: 4px;
        }
        
        #news-history-content::-webkit-scrollbar-thumb:hover {
          background: #64b5f6;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // 设置事件监听
  setupEventListeners() {
    const newsBarMain = document.getElementById('news-bar-main');
    const closeHistoryBtn = document.getElementById('close-history');

    // 点击新闻栏展开/收起历史
    if (newsBarMain) {
      newsBarMain.addEventListener('click', () => {
        this.toggleHistory();
      });
    }

    // 点击关闭按钮
    if (closeHistoryBtn) {
      closeHistoryBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.collapseHistory();
      });
    }
  }

  // 切换历史面板
  toggleHistory() {
    if (this.isExpanded) {
      this.collapseHistory();
    } else {
      this.expandHistory();
    }
  }

  // 展开历史面板
  expandHistory() {
    const panel = document.getElementById('news-history-panel');
    if (panel) {
      panel.style.display = 'block';
      this.isExpanded = true;
      this.updateHistoryDisplay();
    }
  }

  // 收起历史面板
  collapseHistory() {
    const panel = document.getElementById('news-history-panel');
    if (panel) {
      panel.style.display = 'none';
      this.isExpanded = false;
    }
  }

  // 更新历史记录显示
  updateHistoryDisplay() {
    const content = document.getElementById('news-history-content');
    if (!content) return;

    const history = this.gameState.newsSystem.newsHistory;

    if (history.length === 0) {
      content.innerHTML = '<p style="color: #bdc3c7; font-style: italic; text-align: center;">暂无历史记录</p>';
      return;
    }

    // 倒序显示（最新的在最上面）
    content.innerHTML = [...history].reverse().map(news => {
      const time = new Date(news.timestamp).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      return `
        <div style="
          margin-bottom: 8px;
          padding: 10px;
          background-color: rgba(25, 118, 210, 0.1);
          border-radius: 4px;
          border-left: 3px solid #1976d2;
        ">
          <div style="color: #64b5f6; font-size: 10px; margin-bottom: 4px;">${time}</div>
          <div style="color: #ecf0f1; font-size: 12px;">${news.content}</div>
        </div>
      `;
    }).join('');
  }

  // 游戏结束后播放所有历史新闻（回放功能）
  playbackHistory() {
    const history = this.gameState.newsSystem.getAllHistory();
    
    if (history.length === 0) {
      console.log('📺 没有历史新闻可回放');
      return;
    }

    // 展开历史面板
    this.expandHistory();
    
    // 停止当前播报
    this.stopBroadcast();

    console.log(`📺 开始回放 ${history.length} 条历史新闻`);

    let index = 0;
    const playbackInterval = setInterval(() => {
      if (index >= history.length) {
        clearInterval(playbackInterval);
        console.log('📺 新闻回放完成');
        return;
      }

      this.displayNews(history[index]);
      this.updateHistoryDisplay(); // 同时更新历史显示
      index++;
    }, 2000); // 每2秒播放一条
  }

  // 清理资源
  destroy() {
    this.stopBroadcast();
  }
}
