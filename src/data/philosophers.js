// philosophers.js - 哲学家名单数据

/**
 * 著名哲学家列表
 * 用于反对者系统随机选择人物名称
 */
export const philosophers = [
  {
    name: '苏格拉底',
    nameEn: 'Socrates',
    era: '古希腊',
    description: '西方哲学的奠基人之一'
  },
  {
    name: '柏拉图',
    nameEn: 'Plato',
    era: '古希腊',
    description: '理念论的创立者'
  },
  {
    name: '亚里士多德',
    nameEn: 'Aristotle',
    era: '古希腊',
    description: '逻辑学和形而上学的奠基人'
  },
  {
    name: '笛卡尔',
    nameEn: 'Descartes',
    era: '近代',
    description: '我思故我在'
  },
  {
    name: '康德',
    nameEn: 'Kant',
    era: '近代',
    description: '批判哲学的创立者'
  },
  {
    name: '黑格尔',
    nameEn: 'Hegel',
    era: '近代',
    description: '辩证法大师'
  },
  {
    name: '尼采',
    nameEn: 'Nietzsche',
    era: '近代',
    description: '上帝已死'
  },
  {
    name: '萨特',
    nameEn: 'Sartre',
    era: '现代',
    description: '存在主义哲学家'
  },
  {
    name: '罗素',
    nameEn: 'Russell',
    era: '现代',
    description: '分析哲学创始人之一'
  },
  {
    name: '维特根斯坦',
    nameEn: 'Wittgenstein',
    era: '现代',
    description: '语言哲学大师'
  }
];

/**
 * 随机获取一个哲学家
 * @returns {Object} 哲学家对象
 */
export function getRandomPhilosopher() {
  const index = Math.floor(Math.random() * philosophers.length);
  return philosophers[index];
}

/**
 * 根据当前语言获取哲学家名字
 * @param {Object} philosopher - 哲学家对象
 * @param {string} language - 语言代码 ('zh-CN' 或 'en-US')
 * @returns {string} 哲学家名字
 */
export function getPhilosopherName(philosopher, language = 'zh-CN') {
  return language === 'en-US' ? philosopher.nameEn : philosopher.name;
}
