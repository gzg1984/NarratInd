// newsTemplates.js - 新闻模板库

/**
 * 新闻模板
 * 变量说明：
 * {media} - 媒体机构名称
 * {country} - 国家名称
 * {religion} - 宗教名称（默认"新信仰"）
 * {source} - 来源国家
 * {target} - 目标国家
 */
export const newsTemplates = {
  // 游戏开始
  game_start: [
    '{media}：在{country}发现了一种新的思潮：{religion}。',
    '{media}：{country}出现了神秘的{religion}，引发关注。',
    '{media}：{country}民众开始追随一种新的精神运动：{religion}',
    '{media}：{country}惊现新兴的{religion}，专家称其影响深远。'
  ],
  
  // 信徒增长里程碑
  believers_10: [
    '{media}：{country}约10%的人口已接受{religion}。',
    '{media}：{religion}在{country}快速蔓延，已有十分之一人口加入。',
    '{media}：{country}出现宗教热潮，一成民众皈依{religion}。'
  ],
  
  believers_25: [
    '{media}：{country}四分之一人口信奉{religion}，社会开始分化。',
    '{media}：{religion}在{country}势力扩张，信徒已达人口四分之一。',
    '{media}：{country}宗教版图改写，{religion}占据重要地位。'
  ],
  
  believers_50: [
    '{media}：{religion}已成为{country}的主流信仰，但批评的声音也开始增多。',
    '{media}：{country}过半人口信仰{religion}，政局可能生变，反对者开始发声。',
    '{media}：历史性时刻：{religion}在{country}占据多数，不过质疑声音也随之而来。',
    '{media}：{country}宗教革命完成，{religion}成为主流，批判性讨论同时升温。'
  ],
  
  believers_75: [
    '{media}：{religion}在{country}占据绝对优势地位。',
    '{media}：{country}四分之三民众信奉{religion}，传统信仰式微。',
    '{media}：{religion}在{country}大获全胜，反对声音几近消失。'
  ],
  
  believers_100: [
    '{media}：{country}全境皈依{religion}，完成信仰统一。',
    '{media}：{country}成为{religion}圣地，全民信教。',
    '{media}：{country}宣布{religion}为国教，实现百分百信仰。',
    '{media}：历史见证：{country}成为首个{religion}纯信仰国。'
  ],
  
  // 跨国传播
  cross_border_start: [
    '{media}：{religion}的风潮从{source}传播到了{target}。',
    '{media}：{target}发现来自{source}的宗教渗透迹象。',
    '{media}：{source}信徒越境进入{target}，引发争议。',
    '{media}：{target}边境出现{religion}传教者，来自{source}。',
    '{media}：{religion}跨国传播：{source}→{target}路线开启。'
  ],
  
  // 好人事件
  good_person_click: [
    '{media}：{country}一位慈善家公开支持{religion}。',
    '{media}：{country}社会活动家为{religion}发声。',
    '{media}：{religion}在{country}获得名人背书。',
    '{media}：{country}知名人士皈依{religion}，引发热议。',
    '{media}：{country}意见领袖称赞{religion}改变了他的人生。'
  ],
  
  good_person_timeout: [
    '{media}：{country}一场支持{religion}的集会因故取消。',
    '{media}：{country}的{religion}支持者集会遭遇冷遇。'
  ],
  
  // 反对者事件
  opponent_appear: [
    '{media}：{country}出现抗议{religion}的示威活动。',
    '{media}：{country}民众质疑{religion}的合法性。',
    '{media}：{religion}在{country}遭遇强烈反对声浪。',
    '{media}：{country}反对派组织大规模抵制{religion}运动。'
  ],
  
  opponent_click_success: [
    '{media}：近日，抗议{religion}的{person}被证实患有精神疾病。',
    '{media}：{person}被曝丑闻，声誉扫地，其在{country}的影响力大减。',
    '{media}：调查显示，{person}在{country}的抗议活动系境外势力操纵。',
    '{media}：{country}警方逮捕了反{religion}煽动者{person}。',
    '{media}：{person}被曝接受非法资金，{country}民众哗然。',
    '{media}：{religion}批评者{person}在{country}因造谣被起诉。'
  ],
  
  opponent_timeout: [
    '{media}：{country}的反{religion}运动愈演愈烈，大批信徒脱离。',
    '{media}：{religion}在{country}遭遇信任危机，教徒纷纷退出。',
    '{media}：{country}爆发脱教潮，{religion}陷入困境。',
    '{media}：{country}反对派获胜，{religion}信徒大规模流失。'
  ],
  
  // ⭐ 新增：反对者抵抗成功事件（点击失败2次+完成传播）
  opponent_resist: [
    '{media}：即使面对{religion}的抹黑，{person}依然成功宣扬了他的观点，引发了大家对{religion}的思考。',
    '{media}：{person}在{country}的演讲引发轰动，尽管{religion}试图封锁消息。',
    '{media}：{religion}多次试图压制{person}，但其影响力反而在{country}不断扩大。',
    '{media}：{person}的理论在{country}广泛传播，{religion}的打压手段遭到质疑。',
    '{media}：{person}坚持批判{religion}，在{country}赢得了更多支持者。'
  ],
  
  // ⭐ 新增：反对者被摧毁事件（玩家成功打击导致血量归零）
  opponent_destroyed: [
    '{media}：{person}目前已经名誉扫地，不得不退出公共视野。',
    '{media}：{person}在{country}彻底失去影响力，被迫销声匿迹。',
    '{media}：{person}的理论在{country}遭到彻底否定，本人已隐居。',
    '{media}：{person}因丑闻缠身，宣布退出反{religion}运动。',
    '{media}：{person}在{country}的声誉崩塌，再无发声空间。'
  ],
  
  // ⭐ 新增：反对者转移事件
  opponent_migrate: [
    '{media}：哲学家{person}离开{source}，现身{target}继续其批判运动。',
    '{media}：{person}从{source}转战{target}，{religion}的影响力面临新挑战。',
    '{media}：{person}在{source}遭遇压制后，转移至{target}寻求支持。',
    '{media}：{person}的思想从{source}传播到{target}，引发两地讨论。',
    '{media}：{person}战略转移至{target}，{religion}在该地区的地位受到威胁。'
  ],
  
  // ⭐ 新增：哲学家侵略事件
  philosopher_invade: [
    '{media}：【重大新闻】著名哲学家{person}从{source}出发，主动进入{target}发起反{religion}运动！',
    '{media}：震惊！{person}以{source}为基地，对{target}的{religion}信徒发起思想攻势！',
    '{media}：{person}率领反对者联盟从{source}侵入{target}，{religion}面临严峻挑战！',
    '{media}：警报！{person}的影响力已扩展至{target}，当地{religion}信徒面临信仰危机！',
    '{media}：{person}从{source}发起反攻，{target}成为新战场，{religion}陷入被动！'
  ],
  
  // ⭐ 新增：哲学家逃跑事件
  philosopher_escape: [
    '{media}：{person}在{source}遭遇强力打压，紧急撤退至{target}。',
    '{media}：{person}从{source}战略转移，在{target}重整旗鼓准备反攻。',
    '{media}：{person}逃离{source}，但其思想已在{target}扎根，{religion}未能彻底获胜。',
    '{media}：{person}在{source}失利后退往{target}，专家称其仍具威胁。',
    '{media}：{person}暂时离开{source}战场，转战{target}继续抵抗{religion}扩张。'
  ],
  
  // 财富变化
  wealth_gain: [
    '{media}：{religion}基金会获得巨额捐款。',
    '{media}：{religion}商业帝国版图扩张。',
    '{media}：{religion}投资获利，财富激增。'
  ],
  
  wealth_drain: [
    '{media}：{religion}涉嫌金融欺诈，资金链紧张。',
    '{media}：{religion}财务丑闻曝光，捐款骤减。'
  ],
  
  // 信徒流失事件
  believer_loss: [
    '{media}：{country}经济崩溃，{religion}信徒大量流失。',
    '{media}：贫困导致{country}民众对{religion}失去信心。',
    '{media}：{country}民生凋敝，{religion}被指责失职。'
  ],
  
  // 全球里程碑
  global_believers_50: [
    '{media}：{religion}的迅速传播引起了社会讨论的热潮，开始有一些享有盛誉的学者开始研究{religion}了。',
    '{media}：全球过半人口信仰{religion}，学术界开始严肃对待这一现象。',
    '{media}：{religion}席卷全球，顶尖学者纷纷投入研究。',
    '{media}：{religion}成为全球主流思潮，知识分子展开深度讨论。'
  ],
  
  // 游戏结束
  victory: [
    '{media}：{religion}成为全球唯一信仰，新纪元到来。',
    '{media}：人类历史翻开新篇章，{religion}统一世界。',
    '{media}：全球宗教大一统，{religion}完成历史使命。'
  ],
  
  defeat: [
    '{media}：{religion}思潮消亡，被历史遗忘。',
    '{media}：{religion}运动彻底失败，创始人下落不明。',
    '{media}：{religion}时代终结，世界恢复原貌。'
  ]
};

/**
 * 媒体机构配置
 */
export const mediaOutlets = {
  // 主要国家的本地媒体
  US: ['CNN', 'NBC', 'ABC', 'Fox News', 'New York Times'],
  GB: ['BBC', 'The Guardian', 'Sky News'],
  CN: ['新华社', 'CGTN', '人民日报'],
  JP: ['NHK', '朝日新闻'],
  KR: ['KBS', '联合通讯社'],
  FR: ['法新社', 'France 24'],
  DE: ['德国之声', '明镜周刊'],
  RU: ['塔斯社', 'RT'],
  IN: ['NDTV', '印度时报'],
  BR: ['环球电视网', '圣保罗页报'],
  AU: ['ABC Australia', 'SBS'],
  CA: ['CBC', 'CTV News'],
  MX: ['Televisa', 'TV Azteca'],
  ES: ['埃菲社', 'El País'],
  IT: ['安莎社', 'RAI'],
  
  // 中东地区
  SA: ['阿拉伯卫星台', 'Al Arabiya'],
  AE: ['阿联酋通讯社', 'Gulf News'],
  IL: ['i24News', 'Haaretz'],
  TR: ['阿纳多卢通讯社', 'TRT'],
  EG: ['中东通讯社', 'Al-Ahram'],
  
  // 其他重要国家
  ZA: ['SABC', 'News24'],
  NG: ['Channels TV', 'The Guardian Nigeria'],
  AR: ['Clarín', 'La Nación'],
  
  // 全球网络媒体
  social: ['X', 'Facebook', 'Reddit', 'TikTok', 'YouTube', 'Instagram'],
  
  // 国际通讯社
  international: ['路透社', '美联社', '法新社', '彭博社']
};

/**
 * 根据国家获取合适的媒体机构
 * @param {string} countryId - 国家ID
 * @param {Array} neighbors - 邻国列表
 * @param {number} wealthLevel - 财富等级
 * @returns {string} 媒体机构名称
 */
export function getMediaForCountry(countryId, neighbors = [], wealthLevel = 5) {
  // 1. 如果国家有本地媒体
  if (mediaOutlets[countryId]) {
    // 70%概率使用本地媒体
    if (Math.random() < 0.7) {
      const localMedia = mediaOutlets[countryId];
      return localMedia[Math.floor(Math.random() * localMedia.length)];
    }
    // 30%概率使用国际或网络媒体
    const globalPool = [...mediaOutlets.international, ...mediaOutlets.social];
    return globalPool[Math.floor(Math.random() * globalPool.length)];
  }
  
  // 2. 穷国或小国：使用邻国或网络媒体
  const mediaPool = [];
  
  // 尝试从邻国获取媒体
  if (neighbors && neighbors.length > 0) {
    for (const neighborId of neighbors) {
      if (mediaOutlets[neighborId]) {
        mediaPool.push(...mediaOutlets[neighborId]);
      }
    }
  }
  
  // 添加网络媒体
  mediaPool.push(...mediaOutlets.social);
  
  // 如果还是没有，使用国际媒体
  if (mediaPool.length === 0) {
    mediaPool.push(...mediaOutlets.international);
  }
  
  return mediaPool[Math.floor(Math.random() * mediaPool.length)];
}

/**
 * 根据事件类型选择媒体（考虑事件特性）
 * @param {string} countryId - 国家ID
 * @param {string} eventType - 事件类型
 * @param {Object} country - 国家对象
 * @returns {string} 媒体机构名称
 */
export function getMediaForEvent(countryId, eventType, country) {
  const neighbors = country?.neighbors || [];
  const wealthLevel = country?.wealthLevel || 5;
  
  // 跨国事件倾向使用国际媒体
  if (eventType.includes('cross_border')) {
    if (Math.random() < 0.5) {
      const intl = mediaOutlets.international;
      return intl[Math.floor(Math.random() * intl.length)];
    }
  }
  
  // 反对者事件倾向使用网络媒体
  if (eventType.includes('opponent')) {
    if (Math.random() < 0.4) {
      const social = mediaOutlets.social;
      return social[Math.floor(Math.random() * social.length)];
    }
  }
  
  // 其他情况使用通用逻辑
  return getMediaForCountry(countryId, neighbors, wealthLevel);
}

// 导入本地化配置
import { getLocalizedCountryName, getLocalizedMediaName } from './localization.js';

/**
 * 获取国家显示名称（使用本地化配置）
 * @param {string} countryId - 国家ID
 * @returns {string} 本地化的国家名称
 */
export function getCountryDisplayName(countryId) {
  return getLocalizedCountryName(countryId);
}

/**
 * 获取媒体显示名称（使用本地化配置）
 * @param {string} mediaName - 媒体名称
 * @returns {string} 本地化的媒体名称
 */
export function getMediaDisplayName(mediaName) {
  return getLocalizedMediaName(mediaName);
}
