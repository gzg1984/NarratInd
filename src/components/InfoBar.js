// InfoBar.js - 信息栏组件（悬浮在地图上显示统计信息）
export class InfoBar {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.stats = {
      infected: 0,
      deaths: 0,
      cured: 0
    };
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div id="infection-stats">
        <div class="stat-item">
          <span class="stat-label">信徒:</span>
          <span class="stat-value" id="infected-count">0</span>
        </div>
        <!-- <div class="stat-item">
          <span class="stat-label">死亡人数:</span>
          <span class="stat-value" id="death-count">0</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">治愈人数:</span>
          <span class="stat-value" id="cured-count">0</span>
        </div> -->
      </div>
    `;
  }

  // 更新统计数据
  updateStats(infected, deaths, cured) {
    this.stats = { infected, deaths, cured };
    
    const infectedElement = document.getElementById('infected-count');
    const deathElement = document.getElementById('death-count');
    const curedElement = document.getElementById('cured-count');
    
    if (infectedElement) infectedElement.textContent = infected.toLocaleString();
    if (deathElement) deathElement.textContent = deaths.toLocaleString();
    if (curedElement) curedElement.textContent = cured.toLocaleString();
  }

  getStats() {
    return this.stats;
  }
}