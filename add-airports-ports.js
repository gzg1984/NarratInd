// 为国家数据添加机场和港口标记的脚本
import fs from 'fs';

// 读取当前的 countryData.js
const filePath = './src/data/countryData.js';
let content = fs.readFileSync(filePath, 'utf-8');

// 内陆国家列表（没有海岸线）
const landlockedCountries = [
  'AT', 'BY', 'CH', 'CZ', 'HU', 'LI', 'LU', 'MD', 'MK', 'RS', 'SK', 'VA', 'XK', 'SM', 'AD',
  'AF', 'AM', 'AZ', 'BT', 'KG', 'KZ', 'LA', 'MN', 'NP', 'TJ', 'TM', 'UZ',
  'BO', 'PY',
  'BF', 'BI', 'BW', 'CF', 'TD', 'ET', 'LS', 'MW', 'ML', 'NE', 'RW', 'SS', 'SZ', 'UG', 'ZM', 'ZW'
];

// 规则：
// 1. 机场：财富>=7 或 人口>=20M 或 是交通枢纽
// 2. 港口：非内陆国 且 (财富>=6 或 人口>=15M 或 是重要港口)
// 3. 贫穷内陆小国：都不实现

const lines = content.split('\n');
const newLines = [];
let inDataArray = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // 检测是否在数据数组中
  if (line.includes('export const initialCountryData = [')) {
    inDataArray = true;
    newLines.push(line);
    continue;
  }
  
  if (inDataArray && line.includes('];')) {
    inDataArray = false;
    newLines.push(line);
    continue;
  }
  
  // 处理国家数据行
  if (inDataArray && line.trim().startsWith('[')) {
    // 提取国家数据
    const match = line.match(/\['([A-Z]{2})',\s*([0-9.]+),\s*(\d+),\s*(\[.*?\])\]/);
    if (match) {
      const [, countryId, population, wealth, neighbors] = match;
      const pop = parseFloat(population);
      const wealthLevel = parseInt(wealth);
      const isLandlocked = landlockedCountries.includes(countryId);
      
      // 决定是否有机场
      let hasAirport = false;
      if (wealthLevel >= 7) hasAirport = true;  // 富裕国家
      else if (pop >= 20) hasAirport = true;     // 人口大国
      else if (wealthLevel >= 5 && pop >= 5) hasAirport = true; // 中等规模
      else if (!isLandlocked && wealthLevel >= 4 && pop >= 3) hasAirport = true; // 沿海中等国家
      
      // 决定是否有港口
      let hasPort = false;
      if (!isLandlocked) {
        if (wealthLevel >= 6) hasPort = true;   // 富裕沿海国
        else if (pop >= 15) hasPort = true;      // 人口大国
        else if (wealthLevel >= 4 && pop >= 5) hasPort = true; // 中等规模沿海国
        else if (pop >= 1) hasPort = true;       // 至少100万人口的沿海国
      }
      
      // 特殊处理：岛国至少要有一个
      const isIsland = neighbors === '[]';
      if (isIsland && !hasAirport && !hasPort) {
        if (wealthLevel >= 4 || pop >= 1) {
          hasAirport = true; // 优先给机场
        }
      }
      
      // 重构行
      const comment = line.includes('//') ? line.substring(line.indexOf('//')) : '';
      const newLine = `  ['${countryId}', ${population}, ${wealthLevel}, ${neighbors}, ${hasAirport}, ${hasPort}],${comment}`;
      newLines.push(newLine);
    } else {
      newLines.push(line);
    }
  } else {
    newLines.push(line);
  }
}

// 写回文件
const newContent = newLines.join('\n');
fs.writeFileSync(filePath, newContent, 'utf-8');

console.log('✅ 机场和港口数据已添加完成！');

// 统计
const airports = newContent.match(/true, false\]/g)?.length || 0;
const ports = newContent.match(/false, true\]/g)?.length || 0;
const both = newContent.match(/true, true\]/g)?.length || 0;
const neither = newContent.match(/false, false\]/g)?.length || 0;

console.log('\n统计：');
console.log(`只有机场: ${airports}`);
console.log(`只有港口: ${ports}`);
console.log(`机场+港口: ${both}`);
console.log(`都没有: ${neither}`);
console.log(`总计: ${airports + ports + both + neither}`);
