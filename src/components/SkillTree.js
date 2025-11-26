// SkillTree.js - 天赋树组件
import { getSkillDescription } from '../skills/skillDescriptions.js';
import { getFormattedQuote } from '../skills/skillQuotes.js';

export class SkillTree {
  constructor(containerId, gameState) {
    this.container = document.getElementById(containerId);
    this.gameState = gameState; // 游戏状态引用
    
    // ⭐ 使用外部配置文件加载天赋描述
    const compassionDesc = getSkillDescription('compassion');
    const compassionQuote = getFormattedQuote('compassion');
    
    this.skills = {
      wealth: [
        { id: 'w1', name: '基础积累', cost: 10, unlocked: false, x: 50, y: 50 },
        { id: 'w2', name: '投资收益', cost: 20, unlocked: false, x: 50, y: 120, requires: ['w1'] },
        { id: 'w3', name: '资本运作', cost: 30, unlocked: false, x: 50, y: 190, requires: ['w2'] }
      ],
      spread: [
        // Tier 1
        { id: 'compassion', name: compassionDesc.name, icon: '🥣', cost: 0, unlocked: false, x: 20, y: 30, tier: 1,
          desc: compassionDesc.description,
          quote: compassionQuote },
        { id: 's_chosen', name: '神选', cost: 0, unlocked: false, x: 50, y: 30, tier: 1,
          desc: '富裕国家更高概率触发"主动传播"，信徒翻倍' },
        { id: 's_logic', name: '逻辑', cost: 0, unlocked: false, x: 80, y: 30, tier: 1,
          desc: '提高"帮助到人"概率，信徒翻倍，提高国家财富' },
        
        // Tier 2
        { id: 's_slavery', name: '奴隶制', cost: 1000, unlocked: false, x: 50, y: 80, tier: 2,
          requires: ['s_chosen'], desc: '富国向穷国传播概率增加' },
        { id: 's_refugee', name: '难民', cost: 1000, unlocked: false, x: 20, y: 80, tier: 2,
          requires: ['compassion'], desc: '穷国向富国传播，拉低富国财富' },
        { id: 's_dogma', name: '教条', cost: 1000, unlocked: false, x: 80, y: 80, tier: 2,
          requires: ['s_logic'], desc: '提高"不满"和"主动传播"，信徒翻倍' },
        
        // Tier 3
        { id: 's_progress', name: '进步主义', cost: 10000, unlocked: false, x: 65, y: 130, tier: 3,
          requires: ['s_dogma', 's_slavery'], desc: '富国极高概率"主动传播"，信徒翻倍' },
        { id: 's_conspiracy', name: '阴谋论', cost: 10000, unlocked: false, x: 35, y: 130, tier: 3,
          requires: ['s_slavery', 's_refugee'], desc: '所有国家提高"不满"概率，信徒翻倍' },
        { id: 's_family', name: '家族传播', cost: 10000, unlocked: false, x: 80, y: 130, tier: 3,
          requires: ['s_dogma'], desc: '降低"主动传播"和"不满"，大幅提高"帮助到人"，增加财富' },
        
        // Tier 4
        { id: 's_corrupt', name: '腐化', cost: 100000, unlocked: false, x: 25, y: 180, tier: 4,
          requires: ['s_conspiracy'], desc: '信徒>50%地区削减财富' },
        { id: 's_divide', name: '割裂', cost: 100000, unlocked: false, x: 45, y: 180, tier: 4,
          requires: ['s_conspiracy'], desc: '信徒>50%地区削减财富' },
        { id: 's_replace', name: '替换', cost: 100000, unlocked: false, x: 75, y: 180, tier: 4,
          requires: ['s_conspiracy', 's_family', 's_dogma', 's_refugee'], 
          desc: '信徒<50%地区削减财富，更高概率"主动传播"，信徒翻倍' }
      ],
      trait: [
        { id: 't1', name: '亲和力', cost: 10, unlocked: false, x: 50, y: 50 },
        { id: 't2', name: '影响力', cost: 20, unlocked: false, x: 50, y: 120, requires: ['t1'] },
        { id: 't3', name: '领导力', cost: 30, unlocked: false, x: 50, y: 190, requires: ['t2'] }
      ]
    };
    this.init();
  }

  init() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div style="padding: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h3 style="margin: 0; font-size: 16px; color: #64b5f6;">天赋树</h3>
          <div style="font-size: 14px; color: #ffd700;">
            💰 财富: <span id="wealth-display">0</span>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-around; gap: 10px;">
          <!-- 财富树 -->
          <div class="tree-column">
            <h4 style="text-align: center; color: #64b5f6; font-size: 13px; margin-bottom: 10px;">财富</h4>
            <svg width="100" height="250" style="display: block;">
              ${this.renderTreeLines(this.skills.wealth, 'wealth')}
              ${this.renderTreeNodes(this.skills.wealth, 'wealth')}
            </svg>
          </div>
          
          <!-- 传播树 -->
          <div class="tree-column">
            <h4 style="text-align: center; color: #64b5f6; font-size: 13px; margin-bottom: 10px;">传播</h4>
            <svg width="100" height="220" style="display: block;">
              ${this.renderTreeLines(this.skills.spread, 'spread')}
              ${this.renderTreeNodes(this.skills.spread, 'spread')}
            </svg>
          </div>
          
          <!-- 特质树 -->
          <div class="tree-column">
            <h4 style="text-align: center; color: #64b5f6; font-size: 13px; margin-bottom: 10px;">特质</h4>
            <svg width="100" height="250" style="display: block;">
              ${this.renderTreeLines(this.skills.trait, 'trait')}
              ${this.renderTreeNodes(this.skills.trait, 'trait')}
            </svg>
          </div>
        </div>
        
        <div id="skill-tooltip" style="
          display: none;
          position: absolute;
          background: rgba(13, 27, 42, 0.95);
          border: 2px solid #1976d2;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 12px;
          color: #ecf0f1;
          pointer-events: none;
          z-index: 1000;
        "></div>
      </div>
    `;
  }

  // 渲染树的连接线
  renderTreeLines(skills, treeType) {
    let lines = '';
    skills.forEach(skill => {
      if (skill.requires) {
        skill.requires.forEach(reqId => {
          const reqSkill = skills.find(s => s.id === reqId);
          if (reqSkill) {
            const color = skill.unlocked && reqSkill.unlocked ? '#1976d2' : '#555';
            lines += `<line x1="${reqSkill.x}" y1="${reqSkill.y}" x2="${skill.x}" y2="${skill.y}" stroke="${color}" stroke-width="2"/>`;
          }
        });
      }
    });
    return lines;
  }

  // 检查技能是否可解锁（前置条件满足）
  canUnlock(skill, treeType) {
    if (skill.unlocked) return false;
    
    // 检查前置条件
    if (skill.requires) {
      const tree = this.skills[treeType];
      const allUnlocked = skill.requires.every(reqId => {
        const reqSkill = tree.find(s => s.id === reqId);
        return reqSkill && reqSkill.unlocked;
      });
      return allUnlocked;
    }
    
    // 没有前置条件，可以解锁
    return true;
  }

  // 渲染树的节点
  renderTreeNodes(skills, treeType) {
    return skills.map(skill => {
      let color;
      let icon;
      
      // ⭐ 如果天赋有自定义图标，优先使用
      if (skill.icon) {
        icon = skill.icon;
        // 有自定义图标时，根据状态调整颜色
        if (skill.unlocked) {
          color = '#4caf50'; // 绿色
        } else if (this.canUnlock(skill, treeType)) {
          color = '#c62828'; // 红色
        } else {
          color = '#555555'; // 灰色
        }
      } else {
        // 默认图标逻辑
        if (skill.unlocked) {
          color = '#4caf50';
          icon = '✓';
        } else if (this.canUnlock(skill, treeType)) {
          color = '#c62828';
          icon = '?';
        } else {
          color = '#555555';
          icon = '✕';
        }
      }
      
      return `
        <circle 
          cx="${skill.x}" 
          cy="${skill.y}" 
          r="12" 
          fill="${color}" 
          stroke="#1976d2" 
          stroke-width="2" 
          style="cursor: pointer;"
          data-skill-id="${skill.id}"
          class="skill-node"
        />
        <text 
          x="${skill.x}" 
          y="${skill.y + 4}" 
          text-anchor="middle" 
          fill="white" 
          font-size="${skill.icon ? '12' : '10'}"
          font-weight="bold"
          style="pointer-events: none;"
        >${icon}</text>
      `;
    }).join('');
  }

  setupEventListeners() {
    // 为所有技能节点添加点击事件
    setTimeout(() => {
      const nodes = this.container.querySelectorAll('.skill-node');
      nodes.forEach(node => {
        node.addEventListener('click', (e) => {
          const skillId = e.target.getAttribute('data-skill-id');
          this.unlockSkill(skillId);
        });
        
        // 添加悬停提示
        node.addEventListener('mouseenter', (e) => {
          const skillId = e.target.getAttribute('data-skill-id');
          this.showTooltip(skillId, e);
        });
        
        node.addEventListener('mouseleave', () => {
          this.hideTooltip();
        });
      });
    }, 100);
  }

  // 解锁技能
  unlockSkill(skillId) {
    let skill = null;
    let treeType = null;
    
    // 查找技能
    for (const [type, tree] of Object.entries(this.skills)) {
      const found = tree.find(s => s.id === skillId);
      if (found) {
        skill = found;
        treeType = type;
        break;
      }
    }
    
    if (!skill) return;
    
    // 检查是否已解锁
    if (skill.unlocked) {
      alert('该天赋已解锁！');
      return;
    }
    
    // 检查前置条件
    if (!this.canUnlock(skill, treeType)) {
      alert('需要先解锁前置天赋！');
      return;
    }
    
    // 检查财富是否足够
    const currentWealth = this.getWealth();
    if (currentWealth < skill.cost) {
      alert(`财富不足！需要 ${skill.cost}，当前只有 ${currentWealth}`);
      return;
    }
    
    // 解锁技能
    if (this.gameState) {
      this.gameState.wealth -= skill.cost;
    }
    skill.unlocked = true;
    
    // 重新渲染
    this.render();
    this.setupEventListeners();
    this.updateWealthDisplay();
    
    console.log(`解锁天赋: ${skill.name} (${skill.desc})`);
  }

  // 显示提示框
  showTooltip(skillId, event) {
    let skill = null;
    let treeType = null;
    
    for (const [type, tree] of Object.entries(this.skills)) {
      const found = tree.find(s => s.id === skillId);
      if (found) {
        skill = found;
        treeType = type;
        break;
      }
    }
    
    if (!skill) return;
    
    const tooltip = document.getElementById('skill-tooltip');
    if (tooltip) {
      const canUnlock = this.canUnlock(skill, treeType);
      const statusText = skill.unlocked ? '✓ 已解锁' : (canUnlock ? '可解锁' : '✕ 需要前置天赋');
      const statusColor = skill.unlocked ? '#4caf50' : (canUnlock ? '#ffd700' : '#888');
      
      // ⭐ 添加引用显示支持
      const quoteHtml = skill.quote ? `<div style="color: #95a5a6; font-size: 10px; font-style: italic; margin: 4px 0; border-left: 2px solid #7f8c8d; padding-left: 6px;">${skill.quote}</div>` : '';
      
      tooltip.innerHTML = `
        <strong style="color: #64b5f6;">${skill.name}</strong><br>
        ${skill.desc ? `<div style="color: #bdc3c7; font-size: 11px; margin: 4px 0;">${skill.desc}</div>` : ''}
        ${quoteHtml}
        消耗: <span style="color: #ffd700;">${skill.cost}</span> 财富<br>
        状态: <span style="color: ${statusColor};">${statusText}</span>
      `;
      tooltip.style.display = 'block';
      tooltip.style.left = (event.pageX + 10) + 'px';
      tooltip.style.top = (event.pageY + 10) + 'px';
    }
  }

  // 隐藏提示框
  hideTooltip() {
    const tooltip = document.getElementById('skill-tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }

  // 增加财富
  addWealth(amount) {
    if (this.gameState) {
      this.gameState.wealth += amount;
    }
    this.updateWealthDisplay();
  }

  // 获取财富
  getWealth() {
    return this.gameState ? this.gameState.wealth : 0;
  }

  // 更新财富显示
  updateWealthDisplay() {
    const display = document.getElementById('wealth-display');
    if (display) {
      // 只显示整数部分
      display.textContent = Math.floor(this.getWealth());
    }
  }

  // 检查技能是否已解锁
  hasSkill(skillId) {
    for (const tree of Object.values(this.skills)) {
      const skill = tree.find(s => s.id === skillId);
      if (skill && skill.unlocked) {
        return true;
      }
    }
    return false;
  }

  // 获取所有已解锁的技能
  getUnlockedSkills() {
    const unlocked = [];
    for (const [type, tree] of Object.entries(this.skills)) {
      tree.forEach(skill => {
        if (skill.unlocked) {
          unlocked.push({ ...skill, treeType: type });
        }
      });
    }
    return unlocked;
  }
}