// MapArea.js - 地图区域组件
export class MapArea {
  constructor(containerId, gameState) {
    this.container = document.getElementById(containerId);
    this.svgElement = null;
    this.gameState = gameState;
    this.infectedRegions = new Map();
    this.init();
  }

  init() {
    // 创建地图容器
    this.render();
    this.setupEventListeners();
  }

  render() {
    if (!this.container) return;
    
    // 使用 object 标签加载 SVG，可以访问和修改内部元素
    this.container.innerHTML = `
      <div id="event-bar-container"></div>
      <object id="world-map-svg" data="assets/world.svg" type="image/svg+xml" style="width:100%;height:auto;display:block;max-width:100%;pointer-events: auto;">
        您的浏览器不支持 SVG
      </object>
      <div id="info-bar-container"></div>
    `;
    
    // 等待 SVG 加载完成
    const objectElement = document.getElementById('world-map-svg');
    if (objectElement) {
      objectElement.addEventListener('load', () => {
        this.svgElement = objectElement.contentDocument;
        this.onSvgLoaded();
      });
    }
  }

  onSvgLoaded() {
    console.log('SVG 地图加载完成');
    if (this.svgElement) {
      // 获取所有国家/地区的 path 元素
      const paths = this.svgElement.querySelectorAll('path');
      console.log('找到', paths.length, '个地区');
    }
  }

  setupEventListeners() {
    // 等待 SVG 加载后设置点击事件
    const objectElement = document.getElementById('world-map-svg');
    if (objectElement) {
      objectElement.addEventListener('load', () => {
        if (this.svgElement) {
          // 在 SVG 内部设置点击事件
          this.svgElement.addEventListener('click', (e) => this.handleMapClick(e));
        }
      });
    }
  }

  handleMapClick(event) {
    // 需要访问 SVG 内部的元素
    let target = event.target;
    
    // 如果点击的是 object 本身，尝试获取 SVG 内部元素
    if (target.tagName === 'OBJECT') {
      return;
    }
    
    // 如果点击的是 path 元素（国家）
    if (target.tagName === 'path') {
      const countryId = target.getAttribute('id');
      console.log('点击国家:', countryId);
      
      // 如果游戏未开始，点击任意国家开始游戏
      if (!this.gameState.isStarted()) {
        if (countryId && this.gameState.getCountry(countryId)) {
          const started = this.gameState.startGame(countryId);
          if (started) {
            this.updateCountryVisual(countryId);
            // 通知 EventBar 显示开始事件
            if (this.onGameStart) {
              this.onGameStart(countryId);
            }
          }
        }
      } else {
        // 游戏已开始，显示国家信息
        this.showCountryInfo(countryId);
      }
    }
  }
  
  // 设置游戏开始回调
  setGameStartCallback(callback) {
    this.onGameStart = callback;
  }

  // 显示国家信息
  showCountryInfo(countryId) {
    const country = this.gameState.getCountry(countryId);
    if (country) {
      const percentage = (country.believers / country.population * 100).toFixed(2);
      alert(`国家: ${countryId}\n人口: ${(country.population / 1000000).toFixed(1)}M\n信徒: ${country.believers}\n占比: ${percentage}%\n财富等级: ${country.wealthLevel}`);
    }
  }

  // 根据国家ID更新视觉效果
  updateCountryVisual(countryId) {
    if (!this.svgElement) return;
    
    const country = this.gameState.getCountry(countryId);
    if (!country) return;
    
    const paths = this.svgElement.querySelectorAll(`path[id="${countryId}"]`);
    if (paths.length === 0) return;
    
    // 计算白度（根据信徒占比）
    // 确保不超过100%
    const percentage = Math.min(country.believers / country.population, 1.0);
    const whiteness = Math.min(percentage * 2, 1); // 50%时完全白色
    
    // 如果国家刚被感染，先设置为深色（接近黑色）
    const color = this.calculateInfectionColor(whiteness);
    
    paths.forEach(path => {
      // 标记为已感染
      if (!path.getAttribute('data-infected')) {
        path.setAttribute('data-infected', 'true');
      }
      
      // 直接设置颜色，不使用 CSS 过渡
      path.setAttribute('fill', color);
      path.style.fill = color;
    });
  }

  // 更新所有已感染国家的视觉效果
  updateAllInfectedCountries() {
    const infected = this.gameState.getInfectedCountries();
    infected.forEach(country => {
      this.updateCountryVisual(country.id);
    });
  }

  // 计算感染颜色（从 SVG 默认颜色黑色渐变到白色）
  calculateInfectionColor(whiteness) {
    // SVG 默认填充色是黑色 RGB(0, 0, 0) -> 白色 RGB(255, 255, 255)
    const baseR = 0;
    const baseG = 0;
    const baseB = 0;
    const targetR = 255;
    const targetG = 255;
    const targetB = 255;
    
    const r = Math.round(baseR + (targetR - baseR) * whiteness);
    const g = Math.round(baseG + (targetG - baseG) * whiteness);
    const b = Math.round(baseB + (targetB - baseB) * whiteness);
    
    return `rgb(${r}, ${g}, ${b})`;
  }

  // 更新地图状态（例如：改变国家颜色表示感染程度）
  updateRegion(regionId, infectionLevel) {
    if (!this.svgElement) return;
    
    const region = this.svgElement.getElementById(regionId);
    if (region) {
      // 根据感染程度改变颜色
      const colors = ['#4CAF50', '#FFC107', '#FF5722', '#C62828'];
      region.style.fill = colors[infectionLevel] || colors[0];
    }
  }
}