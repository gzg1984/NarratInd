/**
 * 初始特性选择UI组件
 * 在游戏开始前显示特性选择对话框
 */

import { getAvailableTraits } from './traitConfig.js';

export class TraitSelectionUI {
  constructor(onTraitSelected) {
    this.onTraitSelected = onTraitSelected;
    this.overlay = null;
  }

  /**
   * 显示特性选择对话框
   */
  show() {
    // 创建遮罩层
    this.overlay = document.createElement('div');
    this.overlay.className = 'trait-selection-overlay';
    
    // 创建对话框
    const dialog = document.createElement('div');
    dialog.className = 'trait-selection-dialog';
    
    // 标题
    const title = document.createElement('h2');
    title.textContent = '选择初始特性';
    title.className = 'trait-selection-title';
    dialog.appendChild(title);
    
    // 描述
    const description = document.createElement('p');
    description.textContent = '选择一个初始特性来开始你的传播之旅';
    description.className = 'trait-selection-description';
    dialog.appendChild(description);
    
    // 特性列表容器
    const traitsContainer = document.createElement('div');
    traitsContainer.className = 'traits-container';
    
    // 获取所有可用特性
    const traits = getAvailableTraits();
    
    // 为每个特性创建选项卡
    traits.forEach(trait => {
      const traitCard = this.createTraitCard(trait);
      traitsContainer.appendChild(traitCard);
    });
    
    dialog.appendChild(traitsContainer);
    
    // 添加到页面
    this.overlay.appendChild(dialog);
    document.body.appendChild(this.overlay);
  }

  /**
   * 创建特性卡片
   */
  createTraitCard(trait) {
    const card = document.createElement('div');
    card.className = 'trait-card';
    
    // 图标
    const icon = document.createElement('div');
    icon.className = 'trait-icon';
    icon.textContent = trait.icon;
    card.appendChild(icon);
    
    // 名称
    const name = document.createElement('div');
    name.className = 'trait-name';
    name.textContent = trait.name;
    card.appendChild(name);
    
    // 描述
    const description = document.createElement('div');
    description.className = 'trait-description';
    description.textContent = trait.description;
    card.appendChild(description);
    
    // 效果列表
    const effects = document.createElement('div');
    effects.className = 'trait-effects';
    effects.innerHTML = this.formatEffects(trait.effects);
    card.appendChild(effects);
    
    // 点击选择
    card.addEventListener('click', () => {
      this.selectTrait(trait.id);
    });
    
    return card;
  }

  /**
   * 格式化效果显示
   */
  formatEffects(effects) {
    const effectsList = [];
    
    if (effects.initialWealth) {
      effectsList.push(`初始财富 +${effects.initialWealth}`);
    }
    if (effects.spreadProbability) {
      const bonus = ((effects.spreadProbability - 1) * 100).toFixed(0);
      effectsList.push(`传播概率 +${bonus}%`);
    }
    
    return effectsList.map(e => `<div class="trait-effect">✓ ${e}</div>`).join('');
  }

  /**
   * 选择特性
   */
  selectTrait(traitId) {
    this.hide();
    if (this.onTraitSelected) {
      this.onTraitSelected(traitId);
    }
  }

  /**
   * 隐藏对话框
   */
  hide() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
      this.overlay = null;
    }
  }
}
