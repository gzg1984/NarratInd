// MapArea.js - 地图区域组件
export class MapArea {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.svgElement = null;
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
      
      // 初始化所有地区颜色
      this.infectedRegions = new Map(); // 存储感染等级
    }
  }

  setupEventListeners() {
    // 设置地图点击事件
    if (this.container) {
      this.container.addEventListener('click', (e) => this.handleMapClick(e));
    }
  }

  handleMapClick(event) {
    // 处理地图点击事件
    console.log('地图被点击:', event.target);
    
    // 可以根据点击的区域做不同处理
    // 例如：显示国家信息、传播病毒等
  }

  // 随机感染一个地区（让它变白）
  infectRandomRegion() {
    if (!this.svgElement) return;
    
    const paths = this.svgElement.querySelectorAll('path');
    if (paths.length === 0) return;
    
    // 随机选择一个地区
    const randomIndex = Math.floor(Math.random() * paths.length);
    const region = paths[randomIndex];
    const regionId = region.getAttribute('id');
    
    // 获取当前感染等级
    let currentLevel = this.infectedRegions.get(regionId) || 0;
    
    // 增加感染等级（最多到10级，完全白色）
    if (currentLevel < 10) {
      currentLevel++;
      this.infectedRegions.set(regionId, currentLevel);
      
      // 计算颜色（从原色逐渐变白）
      const whiteness = currentLevel / 10;
      const color = this.calculateInfectionColor(whiteness);
      
      region.setAttribute('fill', color);
      region.style.fill = color;
      
      console.log(`地区 ${regionId || '未命名'} 感染等级: ${currentLevel}/10`);
    }
  }

  // 计算感染颜色（从蓝色渐变到白色）
  calculateInfectionColor(whiteness) {
    // 基础蓝色 RGB(30, 58, 95) -> 白色 RGB(255, 255, 255)
    const baseR = 30;
    const baseG = 58;
    const baseB = 95;
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