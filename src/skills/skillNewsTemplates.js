/**
 * 技能相关新闻模板
 * 按技能分类组织，避免与主新闻系统混淆
 */

export const skillNewsTemplates = {
  // 同情天赋新闻
  compassion: {
    // 低财富传播加成触发新闻
    low_wealth_boost: {
      level: 3,
      templates: [
        "{country}的贫穷国民认为{star}帮助了他们度过困难时期。",
        "在困难时期，{country}的人们感受到了{star}的温暖。",
        "{country}的穷人说：'{star}理解我们的苦难。'",
        "贫困让{country}的人民更接近{star}的教诲。"
      ]
    },
    
    // 高财富反对者失败新闻
    high_wealth_hypocrisy: {
      level: 3,
      templates: [
        "{philosopher}认为{star}非常虚伪，利用着人们的同情心大肆敛财。",
        "{philosopher}指责{star}：'他们一边宣扬同情，一边积累财富！'",
        "{philosopher}讽刺道：'{star}的同情心似乎只对富人有效。'",
        "{philosopher}说：'{star}用贫困者的故事赚钱，这才是真正的剥削。'"
      ]
    }
  },
  
  // 未来可扩展其他技能新闻
  // justice: {},
  // wisdom: {},
  // courage: {}
};
