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

