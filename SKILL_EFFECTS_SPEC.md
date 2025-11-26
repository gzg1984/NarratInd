# 天赋效果需求文档

本文档记录所有天赋的计算效果算法，每个效果都有唯一编号。修改天赋效果时必须同步更新本文档。

## 编号规则

- `SE-XXX-YY`: SE=Skill Effect, XXX=天赋ID, YY=效果序号

---

## SE-COMPASSION: 同情天赋

### SE-COMPASSION-01: 反对者出现概率降低

**效果描述**: 降低反对者（哲学家）事件的出现概率

**计算公式**:
```
最终概率 = 基础概率 × 0.5
```

**实现位置**: `src/skills/compassionEffects.js` - `getOpponentProbabilityModifier()`

**应用场景**: 每回合检测是否生成反对者事件时

---

### SE-COMPASSION-02: 穷国向富国传播加成

**效果描述**: 当信仰从贫穷国家传播到富裕国家时，成功率翻倍

**计算公式**:
```
if (源国家财富等级 < 目标国家财富等级) {
  传播成功率 = 基础成功率 × 2.0
} else {
  传播成功率 = 基础成功率 × 1.0
}
```

**财富等级判定**: 使用 `country.wealthLevel` (1-10)

**实现位置**: `src/skills/compassionEffects.js` - `getPoorToRichSpreadModifier()`

**应用场景**: 跨国传播时计算成功率

---

### SE-COMPASSION-03: 好人事件增强（荆棘王冠）

**效果描述**: 好人事件有概率变为增强版本，效果翻倍并能转化脱教者

**触发概率**: 20%

**增强效果**:
1. 信徒增长效果 × 2.0
2. 图标变更为 👑（王冠）
3. 优先转化脱教者（脱教者 → 信徒）
4. 添加特殊视觉效果（金色光晕）

**计算公式**:
```
基础效果 = 3次信徒主动传播的效果
if (触发荆棘王冠, 概率20%) {
  最终效果 = 基础效果 × 2.0
  
  // 转化脱教者
  转化数量 = min(最终效果信徒数, 当前脱教者数)
  country.apostates -= 转化数量
}
```

**实现位置**: `src/skills/compassionEffects.js` - `getGoodPersonEffect()`

**应用场景**: 生成好人事件时判定是否为荆棘王冠版本

---

### SE-COMPASSION-04: 固化国家事件优化

**效果描述**: 已固化国家（信徒+脱教者=总人口）跳过普通好人事件，只显示荆棘王冠版本

**判定条件**:
```
固化判定 = (country.believers + country.apostates >= country.population)

if (固化判定 && !是荆棘王冠版本) {
  跳过事件生成
}

if (固化判定 && 是荆棘王冠版本 && country.apostates === 0) {
  跳过事件生成（无脱教者可转化）
}
```

**实现位置**: `src/components/SpecialEvents.js` - `spawnEvent()` 方法

**应用场景**: 生成好人事件前的预检查

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

