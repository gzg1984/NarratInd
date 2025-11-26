// CountryInfoBar.js - 国家信息栏组件（底部固定显示）
export class CountryInfoBar {
  constructor(containerId, gameState) {
    this.container = document.getElementById(containerId);
    this.gameState = gameState;
    this.currentCountryId = null;
    this.isVisible = false;
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div id="country-info-panel" class="country-info-hidden">
        <div class="country-info-header">
          <span class="country-info-title" id="country-name">选择一个国家查看信息</span>
          <button class="country-info-close" id="country-info-close-btn">×</button>
        </div>
        <div class="country-info-content">
          <div class="country-info-grid">
            <div class="country-info-item">
              <span class="country-info-label">人口：</span>
              <span class="country-info-value" id="country-population">-</span>
            </div>
            <div class="country-info-item">
              <span class="country-info-label">信徒：</span>
              <span class="country-info-value" id="country-believers">-</span>
            </div>
            <div class="country-info-item">
              <span class="country-info-label">信徒占比：</span>
              <span class="country-info-value" id="country-believer-ratio">-</span>
            </div>
            <div class="country-info-item">
              <span class="country-info-label">脱教者：</span>
              <span class="country-info-value" id="country-apostates">-</span>
            </div>
            <div class="country-info-item">
              <span class="country-info-label">脱教者占比：</span>
              <span class="country-info-value" id="country-apostate-ratio">-</span>
            </div>
            <div class="country-info-item">
              <span class="country-info-label">财富等级：</span>
              <span class="country-info-value" id="country-wealth">-</span>
            </div>
            <div class="country-info-item">
              <span class="country-info-label">GDP：</span>
              <span class="country-info-value" id="country-gdp">-</span>
            </div>
            <div class="country-info-item">
              <span class="country-info-label">GDP比率：</span>
              <span class="country-info-value" id="country-gdp-ratio">-</span>
            </div>
            <div class="country-info-item">
              <span class="country-info-label">感染状态：</span>
              <span class="country-info-value" id="country-infected">-</span>
            </div>
            <div class="country-info-item">
              <span class="country-info-label">交通：</span>
              <span class="country-info-value" id="country-transport">-</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // 设置关闭按钮事件
    const closeBtn = document.getElementById('country-info-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }
  }

  /**
   * 显示或切换国家信息
   * @param {string} countryId - 国家ID
   */
  showCountry(countryId) {
    const country = this.gameState.getCountry(countryId);
    if (!country) {
      console.warn('国家不存在:', countryId);
      return;
    }

    // 如果点击同一个国家，切换显示/隐藏
    if (this.currentCountryId === countryId && this.isVisible) {
      this.hide();
      return;
    }

    // 显示新国家信息
    this.currentCountryId = countryId;
    this.updateCountryData(country);
    this.show();
  }

  /**
   * 更新国家数据显示
   * @param {object} country - 国家对象
   */
  updateCountryData(country) {
    // 国家名称
    const nameElement = document.getElementById('country-name');
    if (nameElement) {
      nameElement.textContent = country.id || '未知国家';
    }

    // 人口
    const populationElement = document.getElementById('country-population');
    if (populationElement) {
      populationElement.textContent = `${(country.population / 1000000).toFixed(2)}M (${country.population.toLocaleString()})`;
    }

    // 信徒
    const believersElement = document.getElementById('country-believers');
    if (believersElement) {
      believersElement.textContent = country.believers.toLocaleString();
    }

    // 信徒占比
    const believerRatioElement = document.getElementById('country-believer-ratio');
    if (believerRatioElement) {
      const percentage = (country.believers / country.population * 100).toFixed(2);
      believerRatioElement.textContent = `${percentage}%`;
      // 根据占比改变颜色
      believerRatioElement.style.color = this.getPercentageColor(parseFloat(percentage));
    }

    // 脱教者
    const apostates = country.apostates || 0;
    const apostatesElement = document.getElementById('country-apostates');
    if (apostatesElement) {
      apostatesElement.textContent = apostates.toLocaleString();
      apostatesElement.style.color = apostates > 0 ? '#e74c3c' : '#ecf0f1';
    }

    // 脱教者占比
    const apostateRatioElement = document.getElementById('country-apostate-ratio');
    if (apostateRatioElement) {
      const apostatePercentage = (apostates / country.population * 100).toFixed(2);
      apostateRatioElement.textContent = `${apostatePercentage}%`;
      apostateRatioElement.style.color = apostates > 0 ? '#e74c3c' : '#7f8c8d';
    }

    // 财富等级
    const wealthElement = document.getElementById('country-wealth');
    if (wealthElement) {
      wealthElement.textContent = `${country.wealthLevel}/10`;
    }

    // GDP
    const gdpElement = document.getElementById('country-gdp');
    if (gdpElement) {
      gdpElement.textContent = `${country.gdp.toFixed(2)} (原始: ${country.originalGdp.toFixed(2)})`;
    }

    // GDP比率
    const gdpRatioElement = document.getElementById('country-gdp-ratio');
    if (gdpRatioElement) {
      const gdpRatio = (country.gdp / country.originalGdp * 100).toFixed(1);
      gdpRatioElement.textContent = `${gdpRatio}%`;
      // 根据比率改变颜色
      if (parseFloat(gdpRatio) < 50) {
        gdpRatioElement.style.color = '#e74c3c';
      } else if (parseFloat(gdpRatio) < 80) {
        gdpRatioElement.style.color = '#f39c12';
      } else {
        gdpRatioElement.style.color = '#2ecc71';
      }
    }

    // 感染状态
    const infectedElement = document.getElementById('country-infected');
    if (infectedElement) {
      if (country.infected) {
        infectedElement.textContent = '已感染';
        infectedElement.style.color = '#2ecc71';
      } else {
        infectedElement.textContent = '未感染';
        infectedElement.style.color = '#7f8c8d';
      }
    }

    // 交通设施
    const transportElement = document.getElementById('country-transport');
    if (transportElement) {
      const facilities = [];
      if (country.hasAirport) facilities.push('✈️机场');
      if (country.hasPort) facilities.push('⚓港口');
      if (country.neighbors && country.neighbors.length > 0) {
        facilities.push(`🚗陆路×${country.neighbors.length}`);
      }
      transportElement.textContent = facilities.length > 0 ? facilities.join(' ') : '无';
    }
  }

  /**
   * 根据百分比返回颜色
   * @param {number} percentage - 百分比值
   * @returns {string} 颜色值
   */
  getPercentageColor(percentage) {
    if (percentage < 10) return '#7f8c8d';
    if (percentage < 30) return '#3498db';
    if (percentage < 50) return '#2ecc71';
    if (percentage < 70) return '#f39c12';
    if (percentage < 90) return '#e67e22';
    return '#e74c3c';
  }

  /**
   * 显示信息栏
   */
  show() {
    const panel = document.getElementById('country-info-panel');
    if (panel) {
      panel.classList.remove('country-info-hidden');
      panel.classList.add('country-info-visible');
      this.isVisible = true;
    }
  }

  /**
   * 隐藏信息栏
   */
  hide() {
    const panel = document.getElementById('country-info-panel');
    if (panel) {
      panel.classList.remove('country-info-visible');
      panel.classList.add('country-info-hidden');
      this.isVisible = false;
      this.currentCountryId = null;
    }
  }

  /**
   * 刷新当前显示的国家信息
   */
  refresh() {
    if (this.isVisible && this.currentCountryId) {
      const country = this.gameState.getCountry(this.currentCountryId);
      if (country) {
        this.updateCountryData(country);
      }
    }
  }
}
