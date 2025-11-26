/**
 * 天赋说明文本配置
 * 此文件保存所有天赋的说明文字，方便统一修改
 * 
 * 格式说明：
 * - name: 天赋名称
 * - description: 简短描述（显示在天赋树上）
 * - detailedDescription: 详细描述（可选，用于详细说明面板）
 */

export const skillDescriptions = {
  /**
   * 同情天赋
   * 效果算法详见: SKILL_EFFECTS_SPEC.md - SE-COMPASSION-*
   */
  compassion: {
    name: '同情',
    description: '反对者概率↓，穷→富传播↑，好人事件可转化脱教者',
    detailedDescription: [
      '降低反对者出现概率',
      '增强从贫穷国家向富裕国家的传播',
      '好人事件有概率触发荆棘王冠版本',
      '荆棘王冠版本效果翻倍并能转化脱教者'
    ].join('\n')
  },

  /**
   * 难民天赋（示例，待实现）
   */
  refugee: {
    name: '难民',
    description: '待定义效果',
    detailedDescription: '待定义详细描述'
  },

  /**
   * 神选天赋（示例，待实现）
   */
  chosen: {
    name: '神选',
    description: '待定义效果',
    detailedDescription: '待定义详细描述'
  },

  /**
   * 逻辑天赋（示例，待实现）
   */
  logic: {
    name: '逻辑',
    description: '待定义效果',
    detailedDescription: '待定义详细描述'
  }
};

/**
 * 获取天赋描述
 * @param {string} skillId - 天赋ID
 * @returns {object} 天赋描述对象
 */
export function getSkillDescription(skillId) {
  return skillDescriptions[skillId] || {
    name: '未知天赋',
    description: '暂无描述',
    detailedDescription: '暂无详细描述'
  };
}
