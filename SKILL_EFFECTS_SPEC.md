# 天赋效果需求文档

本文档记录所有天赋的计算效果算法，每个效果都有唯一编号。修改天赋效果时必须同步更新本文档。

## 编号规则

- `SE-XXX-YY`: SE=Skill Effect, XXX=天赋ID, YY=效果序号

---

## SE-COMPASSION: 同情天赋

### SE-COMPASSION-01: 低财富传播加成（贫穷的力量）

**效果描述**: 当玩家财富值低于10时，所有传播事件概率翻倍

**计算公式**:
```
if (玩家财富 < 10) {
  传播概率修正 = 2.0
  // 首次触发时显示新闻（Level 3）
} else {
  传播概率修正 = 1.0
}
```

**触发新闻**: 首次激活时触发 `compassion_low_wealth_boost`（Level 3）
- 模板: "{country}的贫穷国民认为{star}帮助了他们度过困难时期。"

**实现位置**: `src/skills/compassionEffects.js` - `getSpreadProbabilityModifier()`

**应用场景**: 所有传播事件（selfSpread, attractDissatisfied, realHelp, crossBorder）

---

### SE-COMPASSION-02: 基于财富的传播和反对者调整

**效果描述**: 根据玩家财富值，动态调整传播概率和反对者概率

**计算公式**:
```
if (玩家财富 < 10) {
  传播概率修正 = 2.0  // 翻倍
  反对者概率修正 = 0.5  // 降低50%
} else if (玩家财富 > 10) {
  传播概率修正 = 0.5  // 减半
  反对者概率修正 = 1.5  // 增加50%
} else {
  // 财富 = 10时，保持默认
  传播概率修正 = 1.0
  反对者概率修正 = 1.0
}
```

**反对者失败新闻**: 替换为 `compassion_high_wealth_hypocrisy`（Level 3）
- 模板: "{philosopher}认为{star}非常虚伪，利用着人们的同情心大肆敛财。"

**实现位置**: `src/skills/compassionEffects.js` - `getSpreadProbabilityModifier()`, `getOpponentProbabilityModifier()`

**应用场景**: 
- 传播事件概率计算
- 反对者事件概率计算
- 反对者点击失败新闻替换

---

### SE-COMPASSION-03: 财富转移速度减半

**效果描述**: 降低财富转移速度为一半，差额返还给国家

**计算公式**:
```
原始转移量 = 国家GDP × 信徒占比 × 基础转移率
实际转移量 = 原始转移量 × 0.5
返还国家量 = 原始转移量 - 实际转移量

玩家财富 += 实际转移量
国家GDP += 返还国家量
```

**实现位置**: `src/skills/compassionEffects.js` - `getWealthTransferModifier()`

**应用场景**: 每回合财富转移计算（gameState.updateWealth）

---

### SE-COMPASSION-04: 好人事件增强（荆棘王冠）【已废弃】

**状态**: 已移除，不再使用

---

### SE-COMPASSION-05: 固化国家事件优化【已废弃】

**状态**: 已移除，不再使用

---

## SE-PROGRESS: 进步主义天赋

### SE-PROGRESS-01: 传播概率强化

**效果描述**: 所有传播事件概率×4

**前置要求**: 必须同时解锁神父（s_priest）和美学（s_aesthetics）天赋

**计算公式**:
```
if (hasSkill('s_progress')) {
  传播概率 *= 4.0
}
```

**实现位置**: `src/data/events.js` - 所有传播事件的calculate函数
- selfSpread
- attractDissatisfied
- realHelp
- cross_border_spread

**叠加效果**: 可与神父（×2）、美学（最高×8）叠加

---

### SE-PROGRESS-02: 反对者概率压制

**效果描述**: 反对者出现概率降低90%

**计算公式**:
```
if (hasSkill('s_progress')) {
  反对者概率 *= 0.1  // 降低90%
}
```

**实现位置**: `src/components/SpecialEvents.js` - checkEvents方法

**应用时机**: 在全球信徒比率调整后应用

---

### SE-PROGRESS-03: 反击成功率提升

**效果描述**: 点击反对者的成功率+50%（加法）

**计算公式**:
```
if (hasSkill('s_progress')) {
  成功率 += 0.5
  成功率 = min(成功率, 0.98)  // 上限98%
}
```

**实现位置**: `src/components/SpecialEvents.js` - OPPONENT事件的effect函数

**叠加效果**: 可与同情天赋的成功率修正叠加

---

### SE-PROGRESS-04: 好人事件脱教者转化

**效果描述**: 当国家所有居民都是信徒或脱教者时，50%概率允许好人事件触发，从脱教者中转化信徒，转化效果为普通的一半

**前置条件**:
```
信徒数 + 脱教者数 >= 国家总人口
脱教者数 > 0
```

**触发逻辑**:
```
if (totalConverted >= population && apostates > 0) {
  if (Math.random() < 0.5) {
    允许好人事件触发
  }
}
```

**效果计算**:
```
if (isProgressConversion) {
  effectMultiplier *= 0.5  // 转化效果减半
}

// 优先从脱教者转化
apostatesConverted = min(totalBelievers, apostates)
apostates -= apostatesConverted
believers += apostatesConverted
```

**实现位置**: 
- `src/components/SpecialEvents.js` - shouldTriggerEvent方法（触发判定）
- `src/components/SpecialEvents.js` - GOOD_PERSON事件的effect函数（效果计算）

**设计意图**: 让高级知识分子（进步主义教授）能够说服脱教者重新信教，但效果不如首次传播

---

### SE-PROGRESS-05: 财富转移损耗

**效果描述**: 财富转移时扣除10%，扣除部分消失（支付给进步主义教授）

**计算公式**:
```
if (hasSkill('s_progress')) {
  progressTax = modifiedTransferAmount × 0.1
  modifiedTransferAmount *= 0.9  // 扣除10%
}
```

**实现位置**: `src/utils/gameState.js` - updateWealth方法

**应用时机**: 在美学天赋加成之后，最终转移前应用

**设计意图**: 进步主义教授需要报酬，这是使用他们背书的代价

---

## 未来天赋效果编号预留

### SE-REFUGEE: 难民天赋
- SE-REFUGEE-01: 待定义
- SE-REFUGEE-02: 待定义

### SE-CHOSEN: 神选天赋
- SE-CHOSEN-01: 待定义
- SE-CHOSEN-02: 待定义

### SE-LOGIC: 逻辑天赋
- SE-LOGIC-01: 待定义
- SE-LOGIC-02: 待定义

---

## 修改历史

| 日期 | 编号 | 修改内容 | 修改者 |
|------|------|---------|--------|
| 2025-11-26 | SE-COMPASSION-* | 初始创建，定义同情天赋所有效果 | System |
| 2025-11-26 | SE-PROGRESS-* | 添加进步主义天赋完整效果规格 | System |

