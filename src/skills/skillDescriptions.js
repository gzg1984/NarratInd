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
    description: '同情心是一种天生缺陷，利用同情心，可以提升你的传播能力。但当你的财富增加时，会导致反效果。',
    detailedDescription: [
      '【低财富加成】财富值<10时，所有传播事件概率翻倍',
      '【高财富惩罚】财富值>10时，传播概率减半，反对者概率增加50%',
      '【财富转移减半】从国家转移的财富减半，差额返还国家GDP',
      '【特殊新闻】低财富/高财富状态会触发专属新闻'
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
   * 原罪天赋
   * 效果算法详见: SKILL_EFFECTS_SPEC.md - SE-ORIGINAL_SIN-*
   */
  original_sin: {
    name: '原罪',
    description: '人做错事情是正常的，但你可以让他们相信这不正常。提升你的传播能力。',
    detailedDescription: [
      '【传播速度翻倍】所有传播事件的概率翻倍',
      '【可叠加】可与同情天赋的低财富加成叠加（4倍）',
      '【普遍效果】影响所有传播类型事件'
    ].join('\n')
  },

  /**
   * 逻辑天赋（示例，待实现）
   */
  logic: {
    name: '逻辑',
    description: '待定义效果',
    detailedDescription: '待定义详细描述'
  },

  /**
   * 进步主义天赋
   */
  s_progress: {
    name: '进步主义',
    description: '让富裕且有知识的高级知识分子为我的教义背书',
    detailedDescription: [
      '【前置要求】需要同时解锁神父和美学天赋',
      '【传播强化】所有传播事件概率×4',
      '【反对者压制】反对者出现概率-90%',
      '【反击加强】反击成功率+50%',
      '【脱教者转化】当国家所有居民都是信徒或脱教者时，50%概率触发好人事件从脱教者转化（效果减半）',
      '【财富损耗】财富转移扣除10%（支付给进步主义教授）'
    ].join('\n')
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
