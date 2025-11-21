// localization.js - 本地化配置文件

/**
 * 当前语言设置
 * 可以通过 setLanguage() 函数动态修改
 * 支持的语言: 'zh-CN' (简体中文), 'en-US' (英语)
 */
let currentLanguage = 'zh-CN';

/**
 * 设置当前语言
 * @param {string} lang - 语言代码 ('zh-CN' 或 'en-US')
 */
export function setLanguage(lang) {
  if (languageConfig[lang]) {
    currentLanguage = lang;
    console.log('语言已切换为:', lang);
  } else {
    console.warn('不支持的语言:', lang);
  }
}

/**
 * 获取当前语言
 * @returns {string} 当前语言代码
 */
export function getCurrentLanguage() {
  return currentLanguage;
}

/**
 * 语言配置对象
 * 包含所有支持的语言及其翻译
 */
const languageConfig = {
  'zh-CN': {
    countries: {
      // 北美洲
      US: '美国',
      CA: '加拿大',
      MX: '墨西哥',
      GT: '危地马拉',
      BZ: '伯利兹',
      HN: '洪都拉斯',
      SV: '萨尔瓦多',
      NI: '尼加拉瓜',
      CR: '哥斯达黎加',
      PA: '巴拿马',
      CU: '古巴',
      JM: '牙买加',
      HT: '海地',
      DO: '多米尼加',
      BS: '巴哈马',
      BB: '巴巴多斯',
      TT: '特立尼达和多巴哥',
      PR: '波多黎各',
      AG: '安提瓜和巴布达',
      
      // 南美洲
      BR: '巴西',
      AR: '阿根廷',
      CL: '智利',
      CO: '哥伦比亚',
      PE: '秘鲁',
      VE: '委内瑞拉',
      EC: '厄瓜多尔',
      BO: '玻利维亚',
      PY: '巴拉圭',
      UY: '乌拉圭',
      GY: '圭亚那',
      SR: '苏里南',
      GF: '法属圭亚那',
      
      // 欧洲
      GB: '英国',
      FR: '法国',
      DE: '德国',
      IT: '意大利',
      ES: '西班牙',
      RU: '俄罗斯',
      PL: '波兰',
      UA: '乌克兰',
      RO: '罗马尼亚',
      NL: '荷兰',
      BE: '比利时',
      GR: '希腊',
      PT: '葡萄牙',
      SE: '瑞典',
      NO: '挪威',
      DK: '丹麦',
      FI: '芬兰',
      CH: '瑞士',
      AT: '奥地利',
      IE: '爱尔兰',
      AL: '阿尔巴尼亚',
      LU: '卢森堡',
      CY: '塞浦路斯',
      IS: '冰岛',
      HR: '克罗地亚',
      SI: '斯洛文尼亚',
      BA: '波斯尼亚和黑塞哥维那',
      RS: '塞尔维亚',
      ME: '黑山',
      MK: '北马其顿',
      XK: '科索沃',
      SK: '斯洛伐克',
      LT: '立陶宛',
      LV: '拉脱维亚',
      EE: '爱沙尼亚',
      MD: '摩尔多瓦',
      
      // 亚洲
      CN: '中国',
      JP: '日本',
      KR: '韩国',
      IN: '印度',
      ID: '印度尼西亚',
      PK: '巴基斯坦',
      BD: '孟加拉国',
      PH: '菲律宾',
      VN: '越南',
      TH: '泰国',
      MY: '马来西亚',
      SG: '新加坡',
      MM: '缅甸',
      KH: '柬埔寨',
      LA: '老挝',
      NP: '尼泊尔',
      LK: '斯里兰卡',
      AF: '阿富汗',
      KZ: '哈萨克斯坦',
      UZ: '乌兹别克斯坦',
      TM: '土库曼斯坦',
      KG: '吉尔吉斯斯坦',
      TJ: '塔吉克斯坦',
      MN: '蒙古',
      TW: '台湾',
      HK: '香港',
      MO: '澳门',
      BN: '文莱',
      TL: '东帝汶',
      BT: '不丹',
      MV: '马尔代夫',
      
      // 中东
      SA: '沙特阿拉伯',
      IR: '伊朗',
      IQ: '伊拉克',
      TR: '土耳其',
      EG: '埃及',
      AE: '阿联酋',
      IL: '以色列',
      SY: '叙利亚',
      YE: '也门',
      JO: '约旦',
      LB: '黎巴嫩',
      OM: '阿曼',
      KW: '科威特',
      QA: '卡塔尔',
      BH: '巴林',
      PS: '巴勒斯坦',
      GE: '格鲁吉亚',
      AM: '亚美尼亚',
      AZ: '阿塞拜疆',
      
      // 非洲
      ZA: '南非',
      NG: '尼日利亚',
      ET: '埃塞俄比亚',
      KE: '肯尼亚',
      TZ: '坦桑尼亚',
      UG: '乌干达',
      DZ: '阿尔及利亚',
      MA: '摩洛哥',
      SD: '苏丹',
      GH: '加纳',
      AO: '安哥拉',
      MZ: '莫桑比克',
      MG: '马达加斯加',
      CM: '喀麦隆',
      CI: '科特迪瓦',
      NE: '尼日尔',
      ML: '马里',
      ZM: '赞比亚',
      ZW: '津巴布韦',
      LY: '利比亚',
      TN: '突尼斯',
      EH: '西撒哈拉',
      SS: '南苏丹',
      GH: '加纳',
      CI: '科特迪瓦',
      SN: '塞内加尔',
      ML: '马里',
      BF: '布基纳法索',
      BJ: '贝宁',
      TG: '多哥',
      LR: '利比里亚',
      SL: '塞拉利昂',
      GN: '几内亚',
      GW: '几内亚比绍',
      GM: '冈比亚',
      MR: '毛里塔尼亚',
      TD: '乍得',
      CF: '中非共和国',
      CD: '刚果民主共和国',
      CG: '刚果共和国',
      GA: '加蓬',
      GQ: '赤道几内亚',
      KE: '肯尼亚',
      SO: '索马里',
      DJ: '吉布提',
      ER: '厄立特里亚',
      RW: '卢旺达',
      BI: '布隆迪',
      NA: '纳米比亚',
      BW: '博茨瓦纳',
      MW: '马拉维',
      LS: '莱索托',
      SZ: '斯威士兰',
      MU: '毛里求斯',
      SC: '塞舌尔',
      RE: '留尼汪',
      KM: '科摩罗',
      ST: '圣多美和普林西比',
      CV: '佛得角',
      
      // 大洋洲
      AU: '澳大利亚',
      NZ: '新西兰',
      PG: '巴布亚新几内亚',
      FJ: '斐济',
      SB: '所罗门群岛',
      VU: '瓦努阿图',
      NC: '新喀里多尼亚',
      PF: '法属波利尼西亚',
      WS: '萨摩亚',
      TO: '汤加',
      KI: '基里巴斯',
      TV: '图瓦卢',
      NR: '瑙鲁',
      PW: '帕劳',
      FM: '密克罗尼西亚',
      MH: '马绍尔群岛'
    },
    
    media: {
      // 美国媒体
      'CNN': 'CNN',
      'NBC': 'NBC',
      'ABC': 'ABC',
      'Fox News': '福克斯新闻',
      'New York Times': '纽约时报',
      
      // 英国媒体
      'BBC': 'BBC',
      'The Guardian': '卫报',
      'Sky News': '天空新闻',
      
      // 中国媒体
      '新华社': '新华社',
      'CGTN': 'CGTN',
      '人民日报': '人民日报',
      
      // 日本媒体
      'NHK': 'NHK',
      '朝日新闻': '朝日新闻',
      
      // 韩国媒体
      'KBS': 'KBS',
      '联合通讯社': '联合通讯社',
      
      // 法国媒体
      '法新社': '法新社',
      'France 24': '法国24',
      
      // 德国媒体
      '德国之声': '德国之声',
      '明镜周刊': '明镜周刊',
      
      // 俄罗斯媒体
      '塔斯社': '塔斯社',
      'RT': 'RT',
      
      // 印度媒体
      'NDTV': 'NDTV',
      '印度时报': '印度时报',
      
      // 巴西媒体
      '环球电视网': '环球电视网',
      '圣保罗页报': '圣保罗页报',
      
      // 澳大利亚媒体
      'ABC Australia': '澳大利亚广播公司',
      'SBS': 'SBS',
      
      // 加拿大媒体
      'CBC': 'CBC',
      'CTV News': 'CTV新闻',
      
      // 墨西哥媒体
      'Televisa': '特莱维萨',
      'TV Azteca': '阿兹特克电视台',
      
      // 西班牙媒体
      '埃菲社': '埃菲社',
      'El País': '国家报',
      
      // 意大利媒体
      '安莎社': '安莎社',
      'RAI': 'RAI',
      
      // 中东媒体
      '阿拉伯卫星台': '阿拉伯卫星台',
      'Al Jazeera': '半岛电视台',
      'Al Arabiya': '阿拉比亚电视台',
      '阿联酋通讯社': '阿联酋通讯社',
      'Gulf News': '海湾新闻',
      'i24News': 'i24新闻',
      'Haaretz': '国土报',
      '阿纳多卢通讯社': '阿纳多卢通讯社',
      'TRT': 'TRT',
      '中东通讯社': '中东通讯社',
      'Al-Ahram': '金字塔报',
      
      // 非洲媒体
      'SABC': 'SABC',
      'News24': 'News24',
      'Channels TV': 'Channels电视台',
      'The Guardian Nigeria': '尼日利亚卫报',
      
      // 阿根廷媒体
      'Clarín': '号角报',
      'La Nación': '国民报',
      
      // 社交媒体
      'X': 'X',
      'Facebook': 'Facebook',
      'Reddit': 'Reddit',
      'TikTok': 'TikTok',
      'YouTube': 'YouTube',
      'Instagram': 'Instagram',
      
      // 国际通讯社
      '路透社': '路透社',
      '美联社': '美联社',
      '法新社': '法新社',
      '彭博社': '彭博社',
      'Reuters': '路透社',
      'AP': '美联社',
      'AFP': '法新社',
      'Bloomberg': '彭博社'
    }
  },
  
  'en-US': {
    countries: {
      // 北美洲
      US: 'United States',
      CA: 'Canada',
      MX: 'Mexico',
      GT: 'Guatemala',
      BZ: 'Belize',
      HN: 'Honduras',
      SV: 'El Salvador',
      NI: 'Nicaragua',
      CR: 'Costa Rica',
      PA: 'Panama',
      CU: 'Cuba',
      JM: 'Jamaica',
      HT: 'Haiti',
      DO: 'Dominican Republic',
      BS: 'Bahamas',
      BB: 'Barbados',
      TT: 'Trinidad and Tobago',
      PR: 'Puerto Rico',
      AG: 'Antigua and Barbuda',
      
      // 南美洲
      BR: 'Brazil',
      AR: 'Argentina',
      CL: 'Chile',
      CO: 'Colombia',
      PE: 'Peru',
      VE: 'Venezuela',
      EC: 'Ecuador',
      BO: 'Bolivia',
      PY: 'Paraguay',
      UY: 'Uruguay',
      GY: 'Guyana',
      SR: 'Suriname',
      GF: 'French Guiana',
      
      // 欧洲
      GB: 'United Kingdom',
      FR: 'France',
      DE: 'Germany',
      IT: 'Italy',
      ES: 'Spain',
      RU: 'Russia',
      PL: 'Poland',
      UA: 'Ukraine',
      RO: 'Romania',
      NL: 'Netherlands',
      BE: 'Belgium',
      GR: 'Greece',
      PT: 'Portugal',
      SE: 'Sweden',
      NO: 'Norway',
      DK: 'Denmark',
      FI: 'Finland',
      CH: 'Switzerland',
      AT: 'Austria',
      IE: 'Ireland',
      AL: 'Albania',
      LU: 'Luxembourg',
      CY: 'Cyprus',
      IS: 'Iceland',
      HR: 'Croatia',
      SI: 'Slovenia',
      BA: 'Bosnia and Herzegovina',
      RS: 'Serbia',
      ME: 'Montenegro',
      MK: 'North Macedonia',
      XK: 'Kosovo',
      SK: 'Slovakia',
      LT: 'Lithuania',
      LV: 'Latvia',
      EE: 'Estonia',
      MD: 'Moldova',
      
      // 亚洲
      CN: 'China',
      JP: 'Japan',
      KR: 'South Korea',
      IN: 'India',
      ID: 'Indonesia',
      PK: 'Pakistan',
      BD: 'Bangladesh',
      PH: 'Philippines',
      VN: 'Vietnam',
      TH: 'Thailand',
      MY: 'Malaysia',
      SG: 'Singapore',
      MM: 'Myanmar',
      KH: 'Cambodia',
      LA: 'Laos',
      NP: 'Nepal',
      LK: 'Sri Lanka',
      AF: 'Afghanistan',
      KZ: 'Kazakhstan',
      UZ: 'Uzbekistan',
      TM: 'Turkmenistan',
      KG: 'Kyrgyzstan',
      TJ: 'Tajikistan',
      MN: 'Mongolia',
      TW: 'Taiwan',
      HK: 'Hong Kong',
      MO: 'Macau',
      BN: 'Brunei',
      TL: 'East Timor',
      BT: 'Bhutan',
      MV: 'Maldives',
      
      // 中东
      SA: 'Saudi Arabia',
      IR: 'Iran',
      IQ: 'Iraq',
      TR: 'Turkey',
      EG: 'Egypt',
      AE: 'UAE',
      IL: 'Israel',
      SY: 'Syria',
      YE: 'Yemen',
      JO: 'Jordan',
      LB: 'Lebanon',
      OM: 'Oman',
      KW: 'Kuwait',
      QA: 'Qatar',
      BH: 'Bahrain',
      PS: 'Palestine',
      GE: 'Georgia',
      AM: 'Armenia',
      AZ: 'Azerbaijan',
      
      // 非洲
      ZA: 'South Africa',
      NG: 'Nigeria',
      ET: 'Ethiopia',
      KE: 'Kenya',
      TZ: 'Tanzania',
      UG: 'Uganda',
      DZ: 'Algeria',
      MA: 'Morocco',
      SD: 'Sudan',
      GH: 'Ghana',
      AO: 'Angola',
      MZ: 'Mozambique',
      MG: 'Madagascar',
      CM: 'Cameroon',
      CI: 'Ivory Coast',
      NE: 'Niger',
      ML: 'Mali',
      ZM: 'Zambia',
      ZW: 'Zimbabwe',
      LY: 'Libya',
      TN: 'Tunisia',
      EH: 'Western Sahara',
      SS: 'South Sudan',
      GH: 'Ghana',
      CI: 'Ivory Coast',
      SN: 'Senegal',
      ML: 'Mali',
      BF: 'Burkina Faso',
      BJ: 'Benin',
      TG: 'Togo',
      LR: 'Liberia',
      SL: 'Sierra Leone',
      GN: 'Guinea',
      GW: 'Guinea-Bissau',
      GM: 'Gambia',
      MR: 'Mauritania',
      TD: 'Chad',
      CF: 'Central African Republic',
      CD: 'Democratic Republic of the Congo',
      CG: 'Republic of the Congo',
      GA: 'Gabon',
      GQ: 'Equatorial Guinea',
      KE: 'Kenya',
      SO: 'Somalia',
      DJ: 'Djibouti',
      ER: 'Eritrea',
      RW: 'Rwanda',
      BI: 'Burundi',
      NA: 'Namibia',
      BW: 'Botswana',
      MW: 'Malawi',
      LS: 'Lesotho',
      SZ: 'Eswatini',
      MU: 'Mauritius',
      SC: 'Seychelles',
      RE: 'Réunion',
      KM: 'Comoros',
      ST: 'São Tomé and Príncipe',
      CV: 'Cape Verde',
      
      // 大洋洲
      AU: 'Australia',
      NZ: 'New Zealand',
      PG: 'Papua New Guinea',
      FJ: 'Fiji',
      SB: 'Solomon Islands',
      VU: 'Vanuatu',
      NC: 'New Caledonia',
      PF: 'French Polynesia',
      WS: 'Samoa',
      TO: 'Tonga',
      KI: 'Kiribati',
      TV: 'Tuvalu',
      NR: 'Nauru',
      PW: 'Palau',
      FM: 'Micronesia',
      MH: 'Marshall Islands'
    },
    
    media: {
      // 媒体英文名称（大部分保持原样）
      'CNN': 'CNN',
      'NBC': 'NBC',
      'ABC': 'ABC',
      'Fox News': 'Fox News',
      'New York Times': 'New York Times',
      'BBC': 'BBC',
      'The Guardian': 'The Guardian',
      'Sky News': 'Sky News',
      '新华社': 'Xinhua',
      'CGTN': 'CGTN',
      '人民日报': "People's Daily",
      'NHK': 'NHK',
      '朝日新闻': 'Asahi Shimbun',
      'KBS': 'KBS',
      '联合通讯社': 'Yonhap',
      '法新社': 'AFP',
      'France 24': 'France 24',
      '德国之声': 'Deutsche Welle',
      '明镜周刊': 'Der Spiegel',
      '塔斯社': 'TASS',
      'RT': 'RT',
      'NDTV': 'NDTV',
      '印度时报': 'Times of India',
      '环球电视网': 'Globo',
      '圣保罗页报': 'Folha de S.Paulo',
      'ABC Australia': 'ABC Australia',
      'SBS': 'SBS',
      'CBC': 'CBC',
      'CTV News': 'CTV News',
      'Televisa': 'Televisa',
      'TV Azteca': 'TV Azteca',
      '埃菲社': 'EFE',
      'El País': 'El País',
      '安莎社': 'ANSA',
      'RAI': 'RAI',
      '阿拉伯卫星台': 'Al Jazeera',
      'Al Jazeera': 'Al Jazeera',
      'Al Arabiya': 'Al Arabiya',
      '阿联酋通讯社': 'WAM',
      'Gulf News': 'Gulf News',
      'i24News': 'i24News',
      'Haaretz': 'Haaretz',
      '阿纳多卢通讯社': 'Anadolu Agency',
      'TRT': 'TRT',
      '中东通讯社': 'MENA',
      'Al-Ahram': 'Al-Ahram',
      'SABC': 'SABC',
      'News24': 'News24',
      'Channels TV': 'Channels TV',
      'The Guardian Nigeria': 'The Guardian Nigeria',
      'Clarín': 'Clarín',
      'La Nación': 'La Nación',
      'X': 'X',
      'Facebook': 'Facebook',
      'Reddit': 'Reddit',
      'TikTok': 'TikTok',
      'YouTube': 'YouTube',
      'Instagram': 'Instagram',
      '路透社': 'Reuters',
      '美联社': 'Associated Press',
      '彭博社': 'Bloomberg',
      'Reuters': 'Reuters',
      'AP': 'Associated Press',
      'AFP': 'AFP',
      'Bloomberg': 'Bloomberg'
    }
  }
};

/**
 * 获取国家的本地化名称
 * @param {string} countryId - 国家代码
 * @returns {string} 本地化的国家名称
 */
export function getLocalizedCountryName(countryId) {
  const langData = languageConfig[currentLanguage];
  if (!langData || !langData.countries) {
    return countryId; // 降级处理
  }
  return langData.countries[countryId] || countryId;
}

/**
 * 获取媒体的本地化名称
 * @param {string} mediaName - 媒体名称
 * @returns {string} 本地化的媒体名称
 */
export function getLocalizedMediaName(mediaName) {
  const langData = languageConfig[currentLanguage];
  if (!langData || !langData.media) {
    return mediaName; // 降级处理
  }
  return langData.media[mediaName] || mediaName;
}

/**
 * 批量获取所有国家的本地化名称
 * @returns {Object} 国家代码到本地化名称的映射
 */
export function getAllLocalizedCountries() {
  const langData = languageConfig[currentLanguage];
  return langData?.countries || {};
}

/**
 * 批量获取所有媒体的本地化名称
 * @returns {Object} 媒体名称到本地化名称的映射
 */
export function getAllLocalizedMedia() {
  const langData = languageConfig[currentLanguage];
  return langData?.media || {};
}

/**
 * 检查是否支持某种语言
 * @param {string} lang - 语言代码
 * @returns {boolean} 是否支持
 */
export function isSupportedLanguage(lang) {
  return !!languageConfig[lang];
}

/**
 * 获取所有支持的语言列表
 * @returns {Array<string>} 支持的语言代码数组
 */
export function getSupportedLanguages() {
  return Object.keys(languageConfig);
}
