# 初始特性系统 (Traits System)

## 目录结构
```
src/traits/
  ├── traitConfig.js      # 特性配置定义
  ├── TraitManager.js     # 特性管理器
  └── TraitSelectionUI.js # 特性选择UI组件
```

## 概述
初始特性系统允许玩家在游戏开始前选择一个特性，这个特性会在整个游戏过程中生效。

## 文件说明

### 1. traitConfig.js
定义所有可用的初始特性配置。

**当前可用特性：**
- **富裕起点** (wealthy_start): 初始财富+6

**未来可扩展特性示例：**
- 魅力非凡：传播概率+20%
- 虔诚信徒：初始信徒+1000
- 黑暗使者：反对者伤害+50%

### 2. TraitManager.js
管理选中的特性，并将特性效果应用到游戏状态。

**主要方法：**
- `setTrait(traitId)`: 设置选中的特性
- `hasTrait(traitId)`: 检查是否拥有某个特性
- `getInitialWealthBonus()`: 获取初始财富加成
- `applyToGameState(gameState)`: 应用特性效果到游戏状态

### 3. TraitSelectionUI.js
在游戏开始前显示特性选择对话框。

**特点：**
- 优雅的卡片式设计
- 悬停动画效果
- 清晰的效果说明

## 使用流程

1. **游戏启动** → 输入明星名字
2. **特性选择** → 显示特性选择对话框
3. **选择特性** → 点击特性卡片
4. **应用效果** → 特性效果应用到游戏初始状态
5. **开始游戏** → 选择起始地区

## 添加新特性

在 `traitConfig.js` 中添加新特性定义：

```javascript
export const TRAITS = {
  // ... 现有特性
  
  NEW_TRAIT: {
    id: 'new_trait',
    name: '新特性名称',
    description: '特性描述',
    icon: '🌟',
    effects: {
      // 自定义效果属性
      customEffect: value
    }
  }
};
```

然后在 `TraitManager.js` 中添加对应的效果应用逻辑。

## 效果类型

当前支持的效果类型：
- `initialWealth`: 初始财富加成
- `spreadProbability`: 传播概率修正（未来）

可以根据需要扩展更多效果类型。
