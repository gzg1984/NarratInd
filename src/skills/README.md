# 天赋系统目录说明

本目录包含所有天赋相关的代码、配置和文档。

## 目录结构

```
src/skills/
├── SkillEffectManager.js      # 天赋效果管理器（核心）
├── compassionEffects.js       # 同情天赋效果实现
├── skillDescriptions.js       # 天赋说明文本配置
└── skillQuotes.js             # 天赋引用语录配置
```

## 文件说明

### SkillEffectManager.js
天赋效果管理器，集中管理所有天赋的效果计算和应用。

**主要方法**：
- `getModifier(effectType, context)` - 获取天赋效果修正值
- `isSkillUnlocked(skillId)` - 检查天赋是否已解锁
- `shouldSkipGoodPersonEvent(country, isCrownedVersion)` - 同情天赋专用逻辑

**使用示例**：
```javascript
// 在 gameState.js 中
this.skillEffectManager = new SkillEffectManager(skillTree);
const modifier = this.skillEffectManager.getModifier('opponent_probability');
```

### compassionEffects.js
同情天赋的具体效果实现。

**导出函数**：
- `getOpponentProbabilityModifier()` - SE-COMPASSION-01
- `getPoorToRichSpreadModifier(sourceCountry, targetCountry)` - SE-COMPASSION-02
- `getGoodPersonEffect()` - SE-COMPASSION-03
- `shouldSkipGoodPersonEvent(country, isCrownedVersion)` - SE-COMPASSION-04

**所有算法详见**：`/SKILL_EFFECTS_SPEC.md`

### skillDescriptions.js
天赋的说明文本配置，方便统一修改。

**数据格式**：
```javascript
{
  skillId: {
    name: '天赋名称',
    description: '简短描述（显示在天赋树上）',
    detailedDescription: '详细描述（可选）'
  }
}
```

### skillQuotes.js
天赋的引用语录配置，用于显示在悬浮提示框中。

**数据格式**：
```javascript
{
  skillId: {
    quote: '引用语句',
    source: '引用来源（可选）'
  }
}
```

## 添加新天赋的步骤

### 1. 更新效果规范文档
在 `/SKILL_EFFECTS_SPEC.md` 中添加新天赋的效果编号和算法说明。

```markdown
## SE-NEWSKILL: 新天赋名称

### SE-NEWSKILL-01: 效果1名称
**计算公式**: ...
**实现位置**: ...
```

### 2. 创建效果实现文件
在 `src/skills/` 目录下创建 `newSkillEffects.js`：

```javascript
/**
 * 新天赋效果实现
 * 参考: SKILL_EFFECTS_SPEC.md - SE-NEWSKILL-*
 */

export function getEffect1() {
  // 实现 SE-NEWSKILL-01
  return modifier;
}
```

### 3. 更新 SkillEffectManager
在 `SkillEffectManager.js` 中导入并添加新天赋的处理逻辑：

```javascript
import * as newSkillEffects from './newSkillEffects.js';

// 在 getModifier 方法中添加
if (this.isSkillUnlocked('newSkill')) {
  return this.getNewSkillEffect(effectType, context);
}
```

### 4. 添加配置文本
在 `skillDescriptions.js` 和 `skillQuotes.js` 中添加新天赋的文本：

```javascript
// skillDescriptions.js
newSkill: {
  name: '新天赋',
  description: '简短描述'
}

// skillQuotes.js
newSkill: {
  quote: '引用语句',
  source: '来源'
}
```

### 5. 更新 SkillTree.js
在 `src/components/SkillTree.js` 中添加新天赋节点：

```javascript
const newSkillDesc = getSkillDescription('newSkill');
const newSkillQuote = getFormattedQuote('newSkill');

{
  id: 'newSkill',
  name: newSkillDesc.name,
  desc: newSkillDesc.description,
  quote: newSkillQuote,
  // ... 其他配置
}
```

### 6. 应用效果
在需要应用效果的地方调用：

```javascript
const modifier = gameState.getSkillModifier('effect_type', context);
```

## 注意事项

1. **所有效果算法必须在 `SKILL_EFFECTS_SPEC.md` 中有文档记录**
2. **修改效果时必须同步更新规范文档和代码**
3. **在代码注释中引用效果编号**，如：`// 参考: SKILL_EFFECTS_SPEC.md - SE-COMPASSION-01`
4. **配置文件与逻辑代码分离**，便于非程序员修改文案
5. **使用 SkillEffectManager 统一管理**，避免在各处散落天赋逻辑

## 相关文档

- **效果规范**：`/SKILL_EFFECTS_SPEC.md`
- **游戏配置**：`/src/data/gameConfig.js`
- **天赋树UI**：`/src/components/SkillTree.js`
- **游戏状态**：`/src/utils/gameState.js`
