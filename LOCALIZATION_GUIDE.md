# 本地化系统使用说明

## 概述

本地化配置已集中在 `src/data/localization.js` 文件中，支持多语言切换。

## 文件结构

```
src/data/localization.js     # 本地化配置文件（国家名、媒体名等）
src/data/newsTemplates.js    # 新闻模板（已改用本地化配置）
src/components/NewsSystem.js # 新闻系统（已集成本地化）
src/app.js                   # 暴露语言切换接口
```

## 当前支持的语言

- `zh-CN` - 简体中文（默认）
- `en-US` - 英语

## 使用方法

### 1. 查看当前语言

在浏览器控制台中：

```javascript
window.getLanguage()
// 返回: 'zh-CN'
```

### 2. 切换语言

在浏览器控制台中：

```javascript
window.switchLanguage('en-US')  // 切换到英语
window.switchLanguage('zh-CN')  // 切换回中文
```

> **注意**：切换语言后会自动重新加载页面以应用更改。

### 3. 在 Footer 中添加语言切换按钮

未来可以在 `index.html` 的 footer 中添加：

```html
<footer>
  <button onclick="window.switchLanguage('zh-CN')">中文</button>
  <button onclick="window.switchLanguage('en-US')">English</button>
</footer>
```

## 本地化配置内容

### 国家名称

已配置的国家（部分示例）：

| 代码 | 中文 | English |
|------|------|---------|
| US | 美国 | United States |
| CN | 中国 | China |
| JP | 日本 | Japan |
| YE | 也门 | Yemen |

共配置了约 **70+ 个国家**。

### 媒体名称

已配置的媒体（部分示例）：

| 原始名称 | 中文 | English |
|----------|------|---------|
| CNN | CNN | CNN |
| BBC | BBC | BBC |
| 新华社 | 新华社 | Xinhua |
| Fox News | 福克斯新闻 | Fox News |
| Al Jazeera | 半岛电视台 | Al Jazeera |

共配置了约 **50+ 个媒体机构**。

## 扩展新语言

在 `localization.js` 中的 `languageConfig` 对象添加新语言：

```javascript
const languageConfig = {
  'zh-CN': { ... },
  'en-US': { ... },
  'ja-JP': {  // 新增日语
    countries: {
      US: 'アメリカ',
      CN: '中国',
      JP: '日本',
      // ...
    },
    media: {
      'CNN': 'CNN',
      'BBC': 'BBC',
      // ...
    }
  }
};
```

## 添加新国家

在 `localization.js` 的每个语言配置中添加：

```javascript
'zh-CN': {
  countries: {
    // 现有国家...
    XX: '新国家名称'
  }
}
```

## API 参考

### `setLanguage(lang)`
设置当前语言。

### `getCurrentLanguage()`
获取当前语言代码。

### `getLocalizedCountryName(countryId)`
获取国家的本地化名称。

### `getLocalizedMediaName(mediaName)`
获取媒体的本地化名称。

### `isSupportedLanguage(lang)`
检查是否支持某种语言。

### `getSupportedLanguages()`
获取所有支持的语言列表。

## 测试

刷新页面后，新闻系统会自动使用本地化的国家和媒体名称：

- **中文**：`BBC：在美国发现了一种新的思潮：[明星名字]`
- **英语**：`BBC: A new trend discovered in United States: [Star Name]`

## 注意事项

1. **默认语言**：网页默认使用 `zh-CN`（简体中文）
2. **降级处理**：如果某个国家/媒体没有配置翻译，会显示原始代码/名称
3. **页面重载**：当前实现中，切换语言会重新加载页面（简单高效）
4. **未来优化**：可以改为无刷新切换（需要重新渲染所有文本）

---

**创建日期**：2025-11-20
