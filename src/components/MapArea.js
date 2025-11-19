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
    
    // 使用 img 标签加载 SVG，确保完整显示
    this.container.innerHTML = `
      <img id="world-map-svg" src="assets/world.svg" alt="世界地图" style="width:100%;height:auto;display:block;max-width:100%;">
      <div id="info-bar-container"></div>
    `;
    
    // 等待图片加载完成
    const imgElement = document.getElementById('world-map-svg');
    if (imgElement) {
      imgElement.addEventListener('load', () => {
        this.onSvgLoaded();
        console.log('地图尺寸:', imgElement.naturalWidth, 'x', imgElement.naturalHeight);
      });
    }
  }

  onSvgLoaded() {
    console.log('SVG 地图加载完成');
    // SVG 加载完成后可以访问其中的元素
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