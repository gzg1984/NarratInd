/**
 * 天赋引用语录配置
 * 此文件保存所有天赋的标语/引用语句，方便统一修改
 * 
 * 格式说明：
 * - quote: 引用语句（显示在天赋悬浮提示框中）
 * - source: 引用来源（可选）
 */

export const skillQuotes = {
  /**
   * 同情天赋
   */
  compassion: {
    quote: '贫穷的人有福了，因为神的国是你们的。',
    source: '路加福音 6:20'
  },

  /**
   * 难民天赋（示例，待实现）
   */
  refugee: {
    quote: '待添加引用语句',
    source: '待定义来源'
  },

  /**
   * 原罪天赋
   */
  original_sin: {
    quote: '我们都如羊走迷，各人偏行己路；',/*耶和华使我们众人的罪孽都归在他身上。*/
    source: '以赛亚书 53:6'
  },

  /**
   * 逻辑天赋（示例，待实现）
   */
  logic: {
    quote: '待添加引用语句',
    source: '待定义来源'
  }
};

/**
 * 获取天赋引用语句
 * @param {string} skillId - 天赋ID
 * @returns {object} 引用对象 {quote, source}
 */
export function getSkillQuote(skillId) {
  return skillQuotes[skillId] || {
    quote: '',
    source: ''
  };
}

/**
 * 获取格式化的引用文本（带引号）
 * @param {string} skillId - 天赋ID
 * @returns {string} 格式化的引用文本
 */
export function getFormattedQuote(skillId) {
  const quoteData = getSkillQuote(skillId);
  if (!quoteData.quote) return '';
  
  return `"${quoteData.quote}"`;
}
