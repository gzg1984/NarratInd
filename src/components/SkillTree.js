// SkillTree.js - 天赋树组件
import { getSkillDescription } from '../skills/skillDescriptions.js';
import { getFormattedQuote } from '../skills/skillQuotes.js';

export class SkillTree {
  constructor(containerId, gameState) {
    this.container = document.getElementById(containerId);
    this.gameState = gameState; // 游戏状态引用
    this.unlockedSkillsCount = 0; // ⭐ 已解锁天赋数量（用于动态价格计算）
    
    // ⭐ 使用外部配置文件加载天赋描述
    const compassionDesc = getSkillDescription('compassion');
    const compassionQuote = getFormattedQuote('compassion');
    const originalSinDesc = getSkillDescription('original_sin');
    const originalSinQuote = getFormattedQuote('original_sin');
    
    this.currentTab = 'wealth'; // 当前激活的Tab
    
    this.skills = {
      wealth: {
        type: 'hexgrid',
        centerX: 160,
        centerY: 130,
        hexSize: 26,
        hexes: [
          // Layer 1 - 核心（1个）
          { id: 'holy_war', name: '圣战', icon: '⚡', q: 0, r: 0, layer: 1, cost: 10000, baseCost: 10000, unlocked: false,
            desc: '发动圣战掠夺财富', adjacentTo: ['jizya', 'confiscate', 'slavery', 'inquisition', 'monopoly', 'land_grab'] },
          
          // Layer 2 - 中层（6个）
          { id: 'jizya', name: '吉兹亚税', icon: '⚖️', q: 1, r: 0, layer: 2, cost: 1000, baseCost: 1000, unlocked: false,
            desc: '向异教徒征收人头税', adjacentTo: ['holy_war'] },
          { id: 'confiscate', name: '抄家异教徒', icon: '🏚️', q: 1, r: -1, layer: 2, cost: 1000, baseCost: 1000, unlocked: false,
            desc: '没收异教徒财产', adjacentTo: ['holy_war'] },
          { id: 'slavery', name: '奴隶制', icon: '⛓️', q: 0, r: -1, layer: 2, cost: 1000, baseCost: 1000, unlocked: false,
            desc: '奴役异教徒劳动', adjacentTo: ['holy_war'] },
          { id: 'inquisition', name: '宗教裁判', icon: '⚔️', q: -1, r: 0, layer: 2, cost: 1000, baseCost: 1000, unlocked: false,
            desc: '审判异端并没收财产', adjacentTo: ['holy_war'] },
          { id: 'monopoly', name: '宗教垄断', icon: '🏦', q: -1, r: 1, layer: 2, cost: 1000, baseCost: 1000, unlocked: false,
            desc: '垄断关键行业', adjacentTo: ['holy_war'] },
          { id: 'land_grab', name: '土地掠夺', icon: '🗺️', q: 0, r: 1, layer: 2, cost: 1000, baseCost: 1000, unlocked: false,
            desc: '掠夺异教徒土地', adjacentTo: ['holy_war'] },
          
          // Layer 3 - 外围（12个）
          { id: 'tithe', name: '十一税', icon: '📜', q: 2, r: 0, layer: 3, cost: 100, baseCost: 100, unlocked: false,
            desc: '每回合从信徒获得财富', adjacentTo: ['jizya', 'forced_labor'] },
          { id: 'forced_labor', name: '义务劳动', icon: '⚒️', q: 1, r: -2, layer: 3, cost: 100, baseCost: 100, unlocked: false,
            desc: '强制信徒劳动获得财富', adjacentTo: ['confiscate'] },
          { id: 'relic', name: '圣物交易', icon: '💎', q: -2, r: 0, layer: 3, cost: 100, baseCost: 100, unlocked: false,
            desc: '售卖圣物获得财富', adjacentTo: ['charity', 'inquisition'] },
          { id: 'indulgence', name: '赎罪券', icon: '📃', q: 0, r: -2, layer: 3, cost: 100, baseCost: 100, unlocked: false,
            desc: '出售赎罪券获得财富', adjacentTo: ['slavery', 'confiscate'] },
          { id: 'pilgrimage', name: '朝圣税', icon: '🕌', q: -1, r: -1, layer: 3, cost: 100, baseCost: 100, unlocked: false,
            desc: '向朝圣者收取税金', adjacentTo: ['slavery'] },
          { id: 'charity', name: '慈善募捐', icon: '🎗️', q: -3, r: 0, layer: 3, cost: 0, baseCost: 0, unlocked: false,
            desc: '财富<10时真实帮助概率×2，富国再×2；财富转移速度×2', adjacentTo: [] },
          { id: 'blessing', name: '祝福收费', icon: '✨', q: -2, r: 1, layer: 3, cost: 100, baseCost: 100, unlocked: false,
            desc: '为信徒祝福收费', adjacentTo: ['inquisition'] },
          { id: 'monastery', name: '修道院产业', icon: '🏛️', q: -1, r: 2, layer: 3, cost: 100, baseCost: 100, unlocked: false,
            desc: '修道院经营产业', adjacentTo: ['monopoly', 'inquisition'] },
          { id: 'church_tax', name: '教会税', icon: '📋', q: 0, r: 2, layer: 3, cost: 100, baseCost: 100, unlocked: false,
            desc: '向教区征收税金', adjacentTo: ['monopoly'] },
          { id: 'donation', name: '强制捐献', icon: '💰', q: 1, r: 1, layer: 3, cost: 100, baseCost: 100, unlocked: false,
            desc: '要求信徒定期捐献', adjacentTo: ['land_grab', 'monopoly'] },
          { id: 'temple', name: '神殿贡品', icon: '🎁', q: 2, r: 1, layer: 3, cost: 100, baseCost: 100, unlocked: false,
            desc: '收集神殿贡品', adjacentTo: ['land_grab'] },
          { id: 'ritual_fee', name: '仪式费用', icon: '🔮', q: 1, r: -1, layer: 3, cost: 100, baseCost: 100, unlocked: false,
            desc: '举行仪式收费', adjacentTo: ['jizya', 'land_grab'] }
        ]
      },
      spread: [
        // Tier 1
        { id: 'compassion', name: compassionDesc.name, icon: '🥣', cost: 0, baseCost: 0, unlocked: false, x: 20, y: 30, tier: 1,
          desc: compassionDesc.description,
          quote: compassionQuote },
        { id: 'original_sin', name: originalSinDesc.name, icon: '⛓️', cost: 0, baseCost: 0, unlocked: false, x: 50, y: 30, tier: 1,
          desc: originalSinDesc.description,
          quote: originalSinQuote },
        { id: 's_aesthetics', name: '美学', icon: '🎨', cost: 0, baseCost: 0, unlocked: false, x: 80, y: 30, tier: 1,
          desc: '所有传播事件×2；富裕地区再×2；教团财富>10时再×2；信徒>50%国家的财富转移速度×2' },
        
        // Tier 2
        { id: 's_slavery', name: '奴隶制', cost: 1000, baseCost: 1000, unlocked: false, x: 50, y: 80, tier: 2,
          requires: ['original_sin'], desc: '富国向穷国传播概率增加' },
        { id: 's_priest', name: '神父', icon: '✝️', cost: 2, baseCost: 2, unlocked: false, x: 20, y: 80, tier: 2,
          requires: ['compassion', 'original_sin'], desc: '所有传播概率×2，财富转移×2但国家财富消耗×2；信徒>5%国家的好人事件自动触发' },
        { id: 's_dogma', name: '教条', cost: 1000, baseCost: 1000, unlocked: false, x: 80, y: 80, tier: 2,
          requires: ['s_aesthetics'], desc: '提高"不满"和"主动传播"，信徒翻倍' },
        
        // Tier 3
        { id: 's_progress', name: '进步主义', cost: 4, baseCost: 4, unlocked: false, x: 65, y: 130, tier: 3,
          requires: ['s_priest', 's_aesthetics'], desc: '所有传播×4，反对者概率-90%，反击成功率+50%，好人可从脱教者转化，财富转移-10%' },
        { id: 's_conspiracy', name: '阴谋论', cost: 10000, baseCost: 10000, unlocked: false, x: 35, y: 130, tier: 3,
          requires: ['s_slavery', 's_priest'], desc: '所有国家提高"不满"概率，信徒翻倍' },
        { id: 's_family', name: '家族传播', cost: 10000, baseCost: 10000, unlocked: false, x: 80, y: 130, tier: 3,
          requires: ['s_dogma'], desc: '降低"主动传播"和"不满"，大幅提高"帮助到人"，增加财富' },
        
        // Tier 4
        { id: 's_corrupt', name: '腐化', cost: 100000, baseCost: 100000, unlocked: false, x: 25, y: 180, tier: 4,
          requires: ['s_conspiracy'], desc: '信徒>50%地区削减财富' },
        { id: 's_divide', name: '割裂', cost: 100000, baseCost: 100000, unlocked: false, x: 45, y: 180, tier: 4,
          requires: ['s_conspiracy'], desc: '信徒>50%地区削减财富' },
        { id: 's_replace', name: '替换', cost: 100000, baseCost: 100000, unlocked: false, x: 75, y: 180, tier: 4,
          requires: ['s_conspiracy', 's_family', 's_dogma', 's_priest', 's_aesthetics'], 
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
        
        <!-- Tab切换按钮 -->
        <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 15px; border-bottom: 2px solid #1976d2; padding-bottom: 10px;">
          <button 
            class="skill-tab" 
            data-tab="wealth"
            style="
              background-color: ${this.currentTab === 'wealth' ? '#1976d2' : '#2c3e50'};
              color: white;
              border: 2px solid ${this.currentTab === 'wealth' ? '#64b5f6' : '#34495e'};
              border-radius: 8px;
              padding: 8px 20px;
              cursor: pointer;
              font-size: 14px;
              font-weight: bold;
              transition: all 0.3s;
            "
          >💰 敛财</button>
          <button 
            class="skill-tab" 
            data-tab="spread"
            style="
              background-color: ${this.currentTab === 'spread' ? '#1976d2' : '#2c3e50'};
              color: white;
              border: 2px solid ${this.currentTab === 'spread' ? '#64b5f6' : '#34495e'};
              border-radius: 8px;
              padding: 8px 20px;
              cursor: pointer;
              font-size: 14px;
              font-weight: bold;
              transition: all 0.3s;
            "
          >🌍 传播</button>
          <button 
            class="skill-tab" 
            data-tab="trait"
            style="
              background-color: ${this.currentTab === 'trait' ? '#1976d2' : '#2c3e50'};
              color: white;
              border: 2px solid ${this.currentTab === 'trait' ? '#64b5f6' : '#34495e'};
              border-radius: 8px;
              padding: 8px 20px;
              cursor: pointer;
              font-size: 14px;
              font-weight: bold;
              transition: all 0.3s;
            "
          >✨ 特质</button>
        </div>

        <!-- 天赋树内容区域 -->
        <div style="display: flex; justify-content: center; align-items: center; min-height: 300px;">
          <!-- 财富网格 -->
          <div class="tree-column" style="display: ${this.currentTab === 'wealth' ? 'flex' : 'none'}; flex-direction: column; align-items: center;">
            <div style="position: relative; width: 340px; height: 280px;">
              ${this.renderHexGrid()}
            </div>
          </div>
          
          <!-- 传播树 -->
          <div class="tree-column" style="display: ${this.currentTab === 'spread' ? 'flex' : 'none'}; flex-direction: column; align-items: center;">
            <svg width="100" height="220" style="display: block;">
              ${this.renderTreeLines(this.skills.spread, 'spread')}
              ${this.renderTreeNodes(this.skills.spread, 'spread')}
            </svg>
          </div>
          
          <!-- 特质树 -->
          <div class="tree-column" style="display: ${this.currentTab === 'trait' ? 'flex' : 'none'}; flex-direction: column; align-items: center;">
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

  // 六边形坐标转像素坐标
  hexToPixel(q, r, size, centerX, centerY) {
    const x = size * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
    const y = size * (3 / 2 * r);
    return { x: x + centerX, y: y + centerY };
  }

  // 检查六边形是否可解锁（邻接条件满足）
  canUnlockHex(hex) {
    if (hex.unlocked) return false;
    
    // 没有邻接要求（外围格子），可以直接解锁
    if (!hex.adjacentTo || hex.adjacentTo.length === 0) {
      return true;
    }
    
    // 检查是否至少有一个邻接格子已解锁
    return hex.adjacentTo.some(adjId => {
      const adjHex = this.skills.wealth.hexes.find(h => h.id === adjId);
      return adjHex && adjHex.unlocked;
    });
  }

  // 渲染六边形网格
  renderHexGrid() {
    const { hexes, centerX, centerY, hexSize } = this.skills.wealth;
    
    return hexes.map(hex => {
      const pos = this.hexToPixel(hex.q, hex.r, hexSize, centerX, centerY);
      
      // 根据状态确定颜色
      let bgColor, borderColor;
      if (hex.unlocked) {
        bgColor = '#4caf50'; // 绿色-已解锁
        borderColor = '#2e7d32';
      } else if (this.canUnlockHex(hex)) {
        // ⭐ 可解锁状态：检查财富是否足够
        const realTimeCost = this.calculateRealTimeCost(hex);
        const currentWealth = this.getWealth();
        const canAfford = currentWealth >= realTimeCost;
        
        // 背景色始终为灰色
        bgColor = '#90a4ae';
        
        // ⭐ 边框颜色：财富足够=绿色，不足=红色
        borderColor = canAfford ? '#4caf50' : '#f44336';
      } else {
        bgColor = '#424242'; // 深灰-未解锁
        borderColor = '#616161';
      }
      
      const icon = hex.icon || (hex.unlocked ? '✓' : '?');
      
      return `
        <div 
          class="hex-skill" 
          data-hex-id="${hex.id}"
          style="
            position: absolute;
            left: ${pos.x - hexSize}px;
            top: ${pos.y - hexSize}px;
            width: ${hexSize * 2}px;
            height: ${hexSize * 2}px;
            background-color: ${bgColor};
            clip-path: polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%);
            border: 2px solid ${borderColor};
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
          "
        >
          <span style="
            font-size: 18px;
            font-weight: bold;
            color: white;
            pointer-events: none;
          ">${icon}</span>
        </div>
      `;
    }).join('');
  }

  setupEventListeners() {
    // 为所有技能节点添加点击事件
    setTimeout(() => {
      // 处理Tab切换按钮
      const tabButtons = this.container.querySelectorAll('.skill-tab');
      tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const tab = e.target.getAttribute('data-tab');
          this.switchTab(tab);
        });
      });

      // 处理树状技能节点
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

      // 处理六边形节点
      const hexNodes = this.container.querySelectorAll('.hex-skill');
      hexNodes.forEach(hexNode => {
        hexNode.addEventListener('click', (e) => {
          const hexId = e.currentTarget.getAttribute('data-hex-id');
          this.unlockSkill(hexId);
        });
        
        hexNode.addEventListener('mouseenter', (e) => {
          const hexId = e.currentTarget.getAttribute('data-hex-id');
          this.showTooltip(hexId, e);
        });
        
        hexNode.addEventListener('mouseleave', () => {
          this.hideTooltip();
        });
      });
    }, 100);
  }

  // 切换Tab
  switchTab(tab) {
    this.currentTab = tab;
    this.render();
    this.setupEventListeners();
  }

  // 解锁技能
  /**
   * ⭐ 计算天赋的实时价格
   * 公式：实时价格 = 基础价格 + (已解锁天赋数 × 动态乘数 × 天赋层级)
   * 动态乘数：解锁<5个天赋时为1，≥5个天赋时为2
   */
  calculateRealTimeCost(skill) {
    if (!skill.baseCost && skill.baseCost !== 0) {
      skill.baseCost = skill.cost; // 兼容旧数据
    }
    // ⭐ 动态乘数：前5个天赋×1，之后×2
    const dynamicMultiplier = this.unlockedSkillsCount < 5 ? 1 : 2;
    return skill.baseCost + (this.unlockedSkillsCount * dynamicMultiplier * (skill.tier || 1));
  }

  /**
   * ⭐ 更新所有天赋的实时价格
   */
  updateAllSkillCosts() {
    for (const [type, tree] of Object.entries(this.skills)) {
      if (type === 'wealth' && tree.type === 'hexgrid') {
        for (const hex of tree.hexes) {
          hex.cost = this.calculateRealTimeCost(hex);
        }
      } else if (Array.isArray(tree)) {
        for (const skill of tree) {
          skill.cost = this.calculateRealTimeCost(skill);
        }
      }
    }
  }

  unlockSkill(skillId) {
    let skill = null;
    let treeType = null;
    let isHexGrid = false;
    
    // 查找技能（包括六边形网格）
    for (const [type, tree] of Object.entries(this.skills)) {
      if (type === 'wealth' && tree.type === 'hexgrid') {
        // 六边形网格
        const found = tree.hexes.find(h => h.id === skillId);
        if (found) {
          skill = found;
          treeType = type;
          isHexGrid = true;
          break;
        }
      } else if (Array.isArray(tree)) {
        // 普通树
        const found = tree.find(s => s.id === skillId);
        if (found) {
          skill = found;
          treeType = type;
          break;
        }
      }
    }
    
    if (!skill) return;
    
    // 检查是否已解锁
    if (skill.unlocked) {
      alert('该天赋已解锁！');
      return;
    }
    
    // 检查前置条件
    const canUnlock = isHexGrid ? this.canUnlockHex(skill) : this.canUnlock(skill, treeType);
    if (!canUnlock) {
      alert(isHexGrid ? '需要先解锁相邻的天赋！' : '需要先解锁前置天赋！');
      return;
    }
    
    // ⭐ 使用实时价格
    const realTimeCost = this.calculateRealTimeCost(skill);
    const currentWealth = this.getWealth();
    if (currentWealth < realTimeCost) {
      alert(`财富不足！需要 ${realTimeCost}，当前只有 ${currentWealth}`);
      return;
    }
    
    // 解锁技能
    if (this.gameState) {
      this.gameState.wealth -= realTimeCost;
    }
    skill.unlocked = true;
    this.unlockedSkillsCount++; // ⭐ 增加已解锁计数
    
    // ⭐ 更新所有天赋的实时价格
    this.updateAllSkillCosts();
    
    console.log(`\n========================================`);
    console.log(`🎯 解锁天赋: ${skill.name} (ID: ${skillId})`);
    console.log(`💰 当前财富: ${this.gameState ? this.gameState.wealth : 'N/A'}`);
    console.log(`✨ 传播事件新闻将使用特殊模板（如财富<10）`);
    console.log(`========================================\n`);
    
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
    let isHexGrid = false;
    
    // 查找技能（包括六边形网格）
    for (const [type, tree] of Object.entries(this.skills)) {
      if (type === 'wealth' && tree.type === 'hexgrid') {
        const found = tree.hexes.find(h => h.id === skillId);
        if (found) {
          skill = found;
          treeType = type;
          isHexGrid = true;
          break;
        }
      } else if (Array.isArray(tree)) {
        const found = tree.find(s => s.id === skillId);
        if (found) {
          skill = found;
          treeType = type;
          break;
        }
      }
    }
    
    if (!skill) return;
    
    const tooltip = document.getElementById('skill-tooltip');
    if (tooltip) {
      const canUnlock = isHexGrid ? this.canUnlockHex(skill) : this.canUnlock(skill, treeType);
      const requirementText = isHexGrid ? '需要相邻天赋' : '需要前置天赋';
      const statusText = skill.unlocked ? '✓ 已解锁' : (canUnlock ? '可解锁' : `✕ ${requirementText}`);
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
    for (const [type, tree] of Object.entries(this.skills)) {
      if (type === 'wealth' && tree.type === 'hexgrid') {
        const hex = tree.hexes.find(h => h.id === skillId);
        if (hex && hex.unlocked) return true;
      } else if (Array.isArray(tree)) {
        const skill = tree.find(s => s.id === skillId);
        if (skill && skill.unlocked) return true;
      }
    }
    return false;
  }

  // 获取所有已解锁的技能
  getUnlockedSkills() {
    const unlocked = [];
    for (const [type, tree] of Object.entries(this.skills)) {
      if (type === 'wealth' && tree.type === 'hexgrid') {
        tree.hexes.forEach(hex => {
          if (hex.unlocked) {
            unlocked.push({ ...hex, treeType: type });
          }
        });
      } else if (Array.isArray(tree)) {
        tree.forEach(skill => {
          if (skill.unlocked) {
            unlocked.push({ ...skill, treeType: type });
          }
        });
      }
    }
    return unlocked;
  }
}