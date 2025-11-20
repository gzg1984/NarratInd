// countryData.js - 国家数据配置和初始化

// 国家初始数据配置
// 格式: [国家ID, 人口(百万), 财富等级(1-10), 邻国列表]
export const initialCountryData = [
  // 北美洲
  ['US', 330, 10, ['CA', 'MX']], // 美国
  ['CA', 38, 9, ['US']], // 加拿大
  ['MX', 128, 5, ['US', 'GT', 'BZ']], // 墨西哥
  ['GT', 17, 3, ['MX', 'BZ', 'HN', 'SV']], // 危地马拉
  ['BZ', 0.4, 4, ['MX', 'GT']], // 伯利兹
  ['HN', 10, 3, ['GT', 'SV', 'NI']], // 洪都拉斯
  ['SV', 6, 3, ['GT', 'HN']], // 萨尔瓦多
  ['NI', 6.5, 3, ['HN', 'CR']], // 尼加拉瓜
  ['CR', 5, 5, ['NI', 'PA']], // 哥斯达黎加
  ['PA', 4, 5, ['CR', 'CO']], // 巴拿马
  ['CU', 11, 4, []], // 古巴
  ['JM', 3, 4, []], // 牙买加
  ['HT', 11, 2, ['DO']], // 海地
  ['DO', 11, 4, ['HT']], // 多米尼加
  ['BS', 0.4, 7, []], // 巴哈马
  ['BB', 0.3, 7, []], // 巴巴多斯
  ['TT', 1.4, 6, []], // 特立尼达和多巴哥
  
  // 南美洲
  ['BR', 212, 6, ['UY', 'AR', 'PY', 'BO', 'PE', 'CO', 'VE', 'GY', 'SR', 'GF']], // 巴西
  ['AR', 45, 5, ['CL', 'BO', 'PY', 'BR', 'UY']], // 阿根廷
  ['CL', 19, 6, ['PE', 'BO', 'AR']], // 智利
  ['CO', 51, 4, ['PA', 'VE', 'BR', 'PE', 'EC']], // 哥伦比亚
  ['PE', 33, 4, ['EC', 'CO', 'BR', 'BO', 'CL']], // 秘鲁
  ['VE', 28, 4, ['CO', 'BR', 'GY']], // 委内瑞拉
  ['EC', 17, 4, ['CO', 'PE']], // 厄瓜多尔
  ['BO', 12, 3, ['PE', 'BR', 'PY', 'AR', 'CL']], // 玻利维亚
  ['PY', 7, 3, ['AR', 'BR', 'BO']], // 巴拉圭
  ['UY', 3.5, 6, ['AR', 'BR']], // 乌拉圭
  ['GY', 0.8, 3, ['VE', 'BR', 'SR']], // 圭亚那
  ['SR', 0.6, 4, ['GY', 'BR', 'GF']], // 苏里南
  ['GF', 0.3, 6, ['SR', 'BR']], // 法属圭亚那
  
  // 西欧
  ['GB', 67, 9, ['IE']], // 英国
  ['FR', 65, 9, ['ES', 'BE', 'LU', 'DE', 'CH', 'IT']], // 法国
  ['DE', 83, 10, ['DK', 'PL', 'CZ', 'AT', 'CH', 'FR', 'LU', 'BE', 'NL']], // 德国
  ['IT', 60, 8, ['FR', 'CH', 'AT', 'SI']], // 意大利
  ['ES', 47, 8, ['PT', 'FR']], // 西班牙
  ['PT', 10, 7, ['ES']], // 葡萄牙
  ['NL', 17, 9, ['BE', 'DE']], // 荷兰
  ['BE', 11, 9, ['FR', 'LU', 'DE', 'NL']], // 比利时
  ['LU', 0.6, 10, ['BE', 'FR', 'DE']], // 卢森堡
  ['CH', 8.5, 10, ['FR', 'DE', 'AT', 'IT']], // 瑞士
  ['AT', 9, 9, ['DE', 'CZ', 'SK', 'HU', 'SI', 'IT', 'CH']], // 奥地利
  ['IE', 5, 8, ['GB']], // 爱尔兰
  ['GR', 10.5, 7, ['AL', 'MK', 'BG', 'TR']], // 希腊
  
  // 北欧
  ['SE', 10, 9, ['NO', 'FI']], // 瑞典
  ['NO', 5, 10, ['SE', 'FI', 'RU']], // 挪威
  ['FI', 5, 9, ['SE', 'NO', 'RU']], // 芬兰
  ['DK', 6, 9, ['DE']], // 丹麦
  ['IS', 0.4, 9, []], // 冰岛
  
  // 东欧
  ['PL', 38, 6, ['DE', 'CZ', 'SK', 'UA', 'BY', 'LT']], // 波兰
  ['RO', 19, 5, ['HU', 'RS', 'BG', 'UA', 'MD']], // 罗马尼亚
  ['CZ', 10.5, 7, ['DE', 'PL', 'SK', 'AT']], // 捷克
  ['HU', 9.7, 6, ['AT', 'SK', 'UA', 'RO', 'RS', 'HR', 'SI']], // 匈牙利
  ['BG', 7, 5, ['RO', 'RS', 'MK', 'GR', 'TR']], // 保加利亚
  ['SK', 5.5, 6, ['PL', 'CZ', 'AT', 'HU', 'UA']], // 斯洛伐克
  ['HR', 4, 6, ['SI', 'HU', 'RS', 'BA', 'ME']], // 克罗地亚
  ['SI', 2, 7, ['IT', 'AT', 'HU', 'HR']], // 斯洛文尼亚
  ['BA', 3.3, 4, ['HR', 'RS', 'ME']], // 波斯尼亚
  ['RS', 7, 5, ['HU', 'RO', 'BG', 'MK', 'XK', 'ME', 'BA', 'HR']], // 塞尔维亚
  ['ME', 0.6, 5, ['BA', 'RS', 'XK', 'AL']], // 黑山
  ['AL', 2.9, 4, ['ME', 'XK', 'MK', 'GR']], // 阿尔巴尼亚
  ['MK', 2.1, 4, ['RS', 'BG', 'GR', 'AL', 'XK']], // 北马其顿
  ['XK', 1.8, 3, ['RS', 'ME', 'AL', 'MK']], // 科索沃
  ['UA', 44, 4, ['PL', 'SK', 'HU', 'RO', 'MD', 'RU', 'BY']], // 乌克兰
  ['BY', 9.5, 5, ['PL', 'LT', 'LV', 'RU', 'UA']], // 白俄罗斯
  ['MD', 2.6, 3, ['RO', 'UA']], // 摩尔多瓦
  ['LT', 2.8, 6, ['PL', 'BY', 'LV']], // 立陶宛
  ['LV', 1.9, 6, ['EE', 'RU', 'BY', 'LT']], // 拉脱维亚
  ['EE', 1.3, 7, ['LV', 'RU']], // 爱沙尼亚
  
  // 俄罗斯和中亚
  ['RU', 146, 6, ['NO', 'FI', 'EE', 'LV', 'BY', 'UA', 'GE', 'AZ', 'KZ', 'CN', 'MN', 'KP']], // 俄罗斯
  ['KZ', 19, 5, ['RU', 'CN', 'KG', 'UZ', 'TM']], // 哈萨克斯坦
  ['UZ', 34, 3, ['KZ', 'KG', 'TJ', 'AF', 'TM']], // 乌兹别克斯坦
  ['TM', 6, 4, ['KZ', 'UZ', 'AF', 'IR']], // 土库曼斯坦
  ['KG', 6.5, 3, ['KZ', 'UZ', 'TJ', 'CN']], // 吉尔吉斯斯坦
  ['TJ', 9.5, 2, ['UZ', 'KG', 'CN', 'AF']], // 塔吉克斯坦
  
  // 东亚
  ['CN', 1400, 7, ['MN', 'RU', 'KP', 'KR', 'VN', 'LA', 'MM', 'IN', 'BT', 'NP', 'PK', 'AF', 'TJ', 'KG', 'KZ']], // 中国
  ['JP', 126, 9, ['KR']], // 日本
  ['KR', 52, 8, ['KP', 'CN', 'JP']], // 韩国
  ['KP', 26, 2, ['CN', 'RU', 'KR']], // 朝鲜
  ['MN', 3.3, 4, ['RU', 'CN']], // 蒙古
  ['TW', 24, 8, ['CN']], // 台湾
  ['HK', 7.5, 9, ['CN']], // 香港
  ['MO', 0.7, 8, ['CN']], // 澳门
  
  // 东南亚
  ['ID', 273, 4, ['MY', 'PG', 'TL']], // 印尼
  ['PH', 110, 3, []], // 菲律宾
  ['VN', 97, 4, ['CN', 'LA', 'KH']], // 越南
  ['TH', 70, 5, ['MM', 'LA', 'KH', 'MY']], // 泰国
  ['MY', 32, 6, ['TH', 'ID', 'BN', 'SG']], // 马来西亚
  ['SG', 6, 10, ['MY']], // 新加坡
  ['MM', 54, 2, ['BD', 'IN', 'CN', 'LA', 'TH']], // 缅甸
  ['LA', 7, 2, ['CN', 'VN', 'KH', 'TH', 'MM']], // 老挝
  ['KH', 16, 2, ['TH', 'LA', 'VN']], // 柬埔寨
  ['BN', 0.4, 8, ['MY']], // 文莱
  ['TL', 1.3, 2, ['ID']], // 东帝汶
  ['PG', 9, 2, ['ID']], // 巴布亚新几内亚
  
  // 南亚
  ['IN', 1380, 4, ['PK', 'CN', 'NP', 'BT', 'MM', 'BD']], // 印度
  ['PK', 220, 3, ['IN', 'AF', 'IR', 'CN']], // 巴基斯坦
  ['BD', 164, 2, ['IN', 'MM']], // 孟加拉国
  ['NP', 29, 2, ['CN', 'IN']], // 尼泊尔
  ['BT', 0.8, 3, ['CN', 'IN']], // 不丹
  ['LK', 22, 3, []], // 斯里兰卡
  ['MV', 0.5, 5, []], // 马尔代夫
  ['AF', 39, 1, ['PK', 'IR', 'TM', 'UZ', 'TJ', 'CN']], // 阿富汗
  
  // 中东
  ['SA', 35, 8, ['IQ', 'JO', 'YE', 'OM', 'AE', 'QA', 'KW']], // 沙特阿拉伯
  ['IR', 84, 5, ['IQ', 'TR', 'AZ', 'AM', 'TM', 'AF', 'PK']], // 伊朗
  ['IQ', 40, 4, ['TR', 'SY', 'JO', 'SA', 'KW', 'IR']], // 伊拉克
  ['TR', 84, 6, ['GR', 'BG', 'GE', 'AM', 'AZ', 'IR', 'IQ', 'SY']], // 土耳其
  ['SY', 17, 2, ['TR', 'IQ', 'JO', 'IL', 'LB']], // 叙利亚
  ['JO', 10, 4, ['SY', 'IQ', 'SA', 'IL', 'PS']], // 约旦
  ['IL', 9, 8, ['LB', 'SY', 'JO', 'PS', 'EG']], // 以色列
  ['PS', 5, 3, ['IL', 'JO', 'EG']], // 巴勒斯坦
  ['LB', 6.8, 5, ['SY', 'IL']], // 黎巴嫩
  ['YE', 30, 2, ['SA', 'OM']], // 也门
  ['OM', 5, 7, ['SA', 'YE', 'AE']], // 阿曼
  ['AE', 10, 10, ['SA', 'OM']], // 阿联酋
  ['QA', 2.9, 10, ['SA']], // 卡塔尔
  ['KW', 4.3, 9, ['IQ', 'SA']], // 科威特
  ['BH', 1.7, 8, []], // 巴林
  ['CY', 1.2, 7, []], // 塞浦路斯
  ['GE', 3.7, 4, ['RU', 'AZ', 'AM', 'TR']], // 格鲁吉亚
  ['AM', 3, 4, ['GE', 'AZ', 'IR', 'TR']], // 亚美尼亚
  ['AZ', 10, 5, ['RU', 'GE', 'AM', 'IR', 'TR']], // 阿塞拜疆
  
  // 北非
  ['EG', 102, 4, ['LY', 'SD', 'IL', 'PS']], // 埃及
  ['LY', 7, 5, ['EG', 'SD', 'TD', 'NE', 'DZ', 'TN']], // 利比亚
  ['TN', 12, 5, ['DZ', 'LY']], // 突尼斯
  ['DZ', 43, 5, ['MA', 'EH', 'MR', 'ML', 'NE', 'LY', 'TN']], // 阿尔及利亚
  ['MA', 37, 4, ['ES', 'DZ', 'EH']], // 摩洛哥
  ['EH', 0.6, 2, ['MA', 'DZ', 'MR']], // 西撒哈拉
  ['SD', 43, 2, ['EG', 'LY', 'TD', 'CF', 'SS', 'ET', 'ER']], // 苏丹
  ['SS', 11, 1, ['SD', 'ET', 'KE', 'UG', 'CD', 'CF']], // 南苏丹
  
  // 西非
  ['NG', 206, 2, ['BJ', 'NE', 'TD', 'CM']], // 尼日利亚
  ['GH', 31, 2, ['CI', 'BF', 'TG']], // 加纳
  ['CI', 26, 3, ['LR', 'GN', 'ML', 'BF', 'GH']], // 科特迪瓦
  ['SN', 17, 2, ['MR', 'ML', 'GN', 'GW', 'GM']], // 塞内加尔
  ['ML', 20, 1, ['SN', 'MR', 'DZ', 'NE', 'BF', 'CI', 'GN']], // 马里
  ['BF', 21, 1, ['ML', 'NE', 'BJ', 'TG', 'GH', 'CI']], // 布基纳法索
  ['NE', 24, 1, ['DZ', 'LY', 'TD', 'NG', 'BJ', 'BF', 'ML']], // 尼日尔
  ['BJ', 12, 2, ['TG', 'BF', 'NE', 'NG']], // 贝宁
  ['TG', 8, 2, ['GH', 'BF', 'BJ']], // 多哥
  ['LR', 5, 1, ['SL', 'GN', 'CI']], // 利比里亚
  ['SL', 8, 1, ['LR', 'GN']], // 塞拉利昂
  ['GN', 13, 1, ['SN', 'ML', 'CI', 'LR', 'SL', 'GW']], // 几内亚
  ['GW', 2, 1, ['SN', 'GN']], // 几内亚比绍
  ['GM', 2.4, 2, ['SN']], // 冈比亚
  ['MR', 4.6, 2, ['SN', 'ML', 'DZ', 'EH']], // 毛里塔尼亚
  ['CM', 26, 2, ['NG', 'TD', 'CF', 'CG', 'GA', 'GQ']], // 喀麦隆
  ['TD', 16, 1, ['LY', 'SD', 'CF', 'CM', 'NG', 'NE']], // 乍得
  ['CF', 5, 1, ['TD', 'SD', 'SS', 'CD', 'CG', 'CM']], // 中非
  
  // 中非
  ['CD', 90, 1, ['CF', 'SS', 'UG', 'RW', 'BI', 'TZ', 'ZM', 'AO', 'CG']], // 刚果民主共和国
  ['CG', 5.5, 2, ['GA', 'CM', 'CF', 'CD', 'AO']], // 刚果共和国
  ['GA', 2.2, 5, ['GQ', 'CM', 'CG']], // 加蓬
  ['GQ', 1.4, 6, ['CM', 'GA']], // 赤道几内亚
  ['AO', 32, 3, ['CG', 'CD', 'ZM', 'NA']], // 安哥拉
  
  // 东非
  ['KE', 53, 2, ['ET', 'SS', 'UG', 'TZ', 'SO']], // 肯尼亚
  ['ET', 115, 1, ['ER', 'DJ', 'SO', 'KE', 'SS', 'SD']], // 埃塞俄比亚
  ['UG', 45, 1, ['SS', 'KE', 'TZ', 'RW', 'CD']], // 乌干达
  ['TZ', 60, 1, ['KE', 'UG', 'RW', 'BI', 'CD', 'ZM', 'MW', 'MZ']], // 坦桑尼亚
  ['RW', 13, 1, ['UG', 'TZ', 'BI', 'CD']], // 卢旺达
  ['BI', 12, 1, ['RW', 'TZ', 'CD']], // 布隆迪
  ['SO', 16, 1, ['DJ', 'ET', 'KE']], // 索马里
  ['DJ', 1, 2, ['ER', 'ET', 'SO']], // 吉布提
  ['ER', 3.5, 1, ['SD', 'ET', 'DJ']], // 厄立特里亚
  
  // 南部非洲
  ['ZA', 59, 5, ['NA', 'BW', 'ZW', 'MZ', 'SZ', 'LS']], // 南非
  ['NA', 2.5, 4, ['AO', 'ZM', 'BW', 'ZA']], // 纳米比亚
  ['BW', 2.3, 5, ['NA', 'ZM', 'ZW', 'ZA']], // 博茨瓦纳
  ['ZW', 15, 2, ['ZM', 'MZ', 'ZA', 'BW']], // 津巴布韦
  ['MZ', 31, 1, ['TZ', 'MW', 'ZM', 'ZW', 'ZA', 'SZ']], // 莫桑比克
  ['MW', 19, 1, ['TZ', 'MZ', 'ZM']], // 马拉维
  ['ZM', 18, 2, ['CD', 'TZ', 'MW', 'MZ', 'ZW', 'BW', 'NA', 'AO']], // 赞比亚
  ['LS', 2.1, 2, ['ZA']], // 莱索托
  ['SZ', 1.2, 3, ['ZA', 'MZ']], // 斯威士兰
  ['MG', 28, 1, []], // 马达加斯加
  ['MU', 1.3, 6, []], // 毛里求斯
  ['SC', 0.1, 7, []], // 塞舌尔
  ['RE', 0.9, 6, []], // 留尼汪
  ['KM', 0.9, 2, []], // 科摩罗
  ['ST', 0.2, 3, []], // 圣多美和普林西比
  ['CV', 0.6, 3, []], // 佛得角
  
  // 大洋洲
  ['AU', 26, 9, ['ID', 'PG']], // 澳大利亚
  ['NZ', 5, 9, []], // 新西兰
  ['FJ', 0.9, 4, []], // 斐济
  ['SB', 0.7, 2, []], // 所罗门群岛
  ['VU', 0.3, 3, []], // 瓦努阿图
  ['NC', 0.3, 7, []], // 新喀里多尼亚
  ['PF', 0.3, 6, []], // 法属波利尼西亚
  ['WS', 0.2, 3, []], // 萨摩亚
  ['TO', 0.1, 3, []], // 汤加
  ['KI', 0.1, 2, []], // 基里巴斯
  ['TV', 0.01, 3, []], // 图瓦卢
  ['NR', 0.01, 5, []], // 瑙鲁
  ['PW', 0.02, 6, []], // 帕劳
  ['FM', 0.1, 3, []], // 密克罗尼西亚
  ['MH', 0.06, 4, []], // 马绍尔群岛
  
  // 加勒比和其他小国家/地区
  ['PR', 3.2, 7, []], // 波多黎各
  ['AG', 0.1, 6, []], // 安提瓜和巴布达
  ['DM', 0.07, 5, []], // 多米尼克
  ['GD', 0.1, 5, []], // 格林纳达
  ['KN', 0.05, 6, []], // 圣基茨和尼维斯
  ['LC', 0.2, 5, []], // 圣卢西亚
  ['VC', 0.1, 5, []], // 圣文森特和格林纳丁斯
  ['AI', 0.015, 7, []], // 安圭拉
  ['AW', 0.1, 8, []], // 阿鲁巴
  ['BM', 0.06, 9, []], // 百慕大
  ['BQ', 0.03, 6, []], // 荷属加勒比
  ['CW', 0.16, 7, []], // 库拉索
  ['KY', 0.07, 9, []], // 开曼群岛
  ['MS', 0.005, 6, []], // 蒙特塞拉特
  ['SX', 0.04, 7, []], // 荷属圣马丁
  ['TC', 0.04, 8, []], // 特克斯和凯科斯群岛
  ['VG', 0.03, 8, []], // 英属维尔京群岛
  ['VI', 0.1, 8, []], // 美属维尔京群岛
  
  // 欧洲小国和地区
  ['AD', 0.08, 8, []], // 安道尔
  ['MC', 0.04, 10, []], // 摩纳哥
  ['SM', 0.03, 8, []], // 圣马力诺
  ['VA', 0.001, 9, []], // 梵蒂冈
  ['LI', 0.04, 10, []], // 列支敦士登
  ['MT', 0.5, 7, []], // 马耳他
  ['GI', 0.03, 9, []], // 直布罗陀
  ['FO', 0.05, 9, []], // 法罗群岛
  ['GL', 0.06, 7, []], // 格陵兰
  ['AX', 0.03, 8, []], // 奥兰群岛
  ['SJ', 0.003, 9, []], // 斯瓦尔巴和扬马延
  ['GG', 0.06, 9, []], // 根西岛
  ['JE', 0.1, 9, []], // 泽西岛
  ['IM', 0.08, 9, []], // 马恩岛
  
  // 其他地区和特殊区域
  ['AS', 0.05, 6, []], // 美属萨摩亚
  ['BL', 0.01, 8, []], // 圣巴泰勒米
  ['BV', 0, 0, []], // 布韦岛（无人居住）
  ['CC', 0.001, 6, []], // 科科斯群岛
  ['CK', 0.02, 5, []], // 库克群岛
  ['CX', 0.002, 6, []], // 圣诞岛
  ['FK', 0.003, 7, []], // 福克兰群岛
  ['GS', 0, 0, []], // 南乔治亚和南桑威奇群岛（无人居住）
  ['GU', 0.17, 7, []], // 关岛
  ['HM', 0, 0, []], // 赫德岛和麦克唐纳群岛（无人居住）
  ['IO', 0.003, 6, []], // 英属印度洋领地
  ['JU', 0, 0, []], // 未知（可能是SVG错误）
  ['GO', 0, 0, []], // 未知（可能是SVG错误）
  ['MF', 0.04, 7, []], // 法属圣马丁
  ['MP', 0.06, 7, []], // 北马里亚纳群岛
  ['MQ', 0.4, 7, []], // 马提尼克
  ['GP', 0.4, 7, []], // 瓜德罗普
  ['YT', 0.3, 5, []], // 马约特
  ['NF', 0.002, 6, []], // 诺福克岛
  ['NU', 0.002, 5, []], // 纽埃
  ['PM', 0.006, 8, []], // 圣皮埃尔和密克隆
  ['PN', 0.0005, 5, []], // 皮特凯恩群岛
  ['SH', 0.006, 6, []], // 圣赫勒拿
  ['TF', 0.0001, 6, []], // 法属南部和南极领地
  ['TK', 0.002, 4, []], // 托克劳
  ['UM', 0.0003, 6, []], // 美国本土外小岛屿
  ['WF', 0.01, 5, []], // 瓦利斯和富图纳
];

/**
 * 创建国家对象
 * @param {string} id - 国家ID
 * @param {number} population - 人口（已转换为实际数）
 * @param {number} wealthLevel - 财富等级 (1-10)
 * @param {Array<string>} neighbors - 邻国ID列表
 * @returns {Object} 国家对象
 */
export function createCountry(id, population, wealthLevel, neighbors = []) {
  return {
    id: id,
    population: population,
    wealthLevel: wealthLevel,
    neighbors: neighbors, // 邻国列表
    believers: 0, // 当前信徒数
    infected: false, // 是否已感染
    eventHistory: [], // 事件历史
    lastEventTime: 0 // 上次事件时间
  };
}

/**
 * 初始化所有国家数据
 * @returns {Object} { countries: Map, totalPopulation: number }
 */
export function initializeCountries() {
  const countries = new Map();
  let totalPopulation = 0;
  
  initialCountryData.forEach(([id, populationMillion, wealthLevel, neighbors]) => {
    const actualPopulation = populationMillion * 1000000;
    totalPopulation += actualPopulation;
    
    const country = createCountry(id, actualPopulation, wealthLevel, neighbors || []);
    countries.set(id, country);
  });
  
  return { countries, totalPopulation };
}

/**
 * 判断国家是否为富裕国家
 * @param {Object} country - 国家对象
 * @returns {boolean}
 */
export function isWealthyCountry(country) {
  return country.wealthLevel >= 7;
}

/**
 * 判断国家是否为贫穷国家
 * @param {Object} country - 国家对象
 * @returns {boolean}
 */
export function isPoorCountry(country) {
  return country.wealthLevel <= 3;
}

/**
 * 获取国家的信徒占比
 * @param {Object} country - 国家对象
 * @returns {number} 0-1之间的比例
 */
export function getBelieverRatio(country) {
  return country.believers / country.population;
}

/**
 * 获取国家的非信徒数量
 * @param {Object} country - 国家对象
 * @returns {number}
 */
export function getNonBelievers(country) {
  return country.population - country.believers;
}

/**
 * 获取国家的邻国列表
 * @param {Object} country - 国家对象
 * @returns {Array<string>} 邻国ID列表
 */
export function getNeighbors(country) {
  return country.neighbors || [];
}

/**
 * 获取国家已感染的邻国数量
 * @param {Object} country - 国家对象
 * @param {Map} countries - 所有国家的Map
 * @returns {number}
 */
export function getInfectedNeighborsCount(country, countries) {
  if (!country.neighbors) return 0;
  return country.neighbors.filter(neighborId => {
    const neighbor = countries.get(neighborId);
    return neighbor && neighbor.infected;
  }).length;
}
