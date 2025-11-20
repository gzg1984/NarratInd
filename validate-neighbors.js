// 验证邻国数据的一致性
import { initialCountryData } from './src/data/countryData.js';

console.log('开始验证邻国数据...\n');

const countries = new Map();
initialCountryData.forEach(([id, pop, wealth, neighbors]) => {
  countries.set(id, { id, neighbors: neighbors || [] });
});

let errors = 0;
let warnings = 0;

// 检查每个国家的邻国是否存在
for (const [id, country] of countries) {
  for (const neighborId of country.neighbors) {
    if (!countries.has(neighborId)) {
      console.error(`❌ 错误: ${id} 的邻国 ${neighborId} 不存在`);
      errors++;
    }
  }
}

// 检查邻国关系是否对称（可选警告）
for (const [id, country] of countries) {
  for (const neighborId of country.neighbors) {
    const neighbor = countries.get(neighborId);
    if (neighbor && !neighbor.neighbors.includes(id)) {
      console.warn(`⚠️  警告: ${id} 列出 ${neighborId} 为邻国，但 ${neighborId} 没有列出 ${id}`);
      warnings++;
    }
  }
}

console.log('\n验证完成！');
console.log(`总国家数: ${countries.size}`);
console.log(`错误: ${errors}`);
console.log(`警告: ${warnings}`);

if (errors === 0) {
  console.log('\n✅ 所有邻国数据有效！');
} else {
  console.log('\n❌ 发现数据错误，请检查！');
}

// 统计邻国数量
const neighborCounts = Array.from(countries.values())
  .map(c => c.neighbors.length)
  .sort((a, b) => b - a);

console.log('\n邻国数量统计:');
console.log(`最多邻国: ${neighborCounts[0]}`);
console.log(`最少邻国: ${neighborCounts[neighborCounts.length - 1]}`);
console.log(`平均邻国: ${(neighborCounts.reduce((a, b) => a + b, 0) / neighborCounts.length).toFixed(2)}`);

// 找出邻国最多的国家
const maxNeighbors = neighborCounts[0];
const mostConnected = Array.from(countries.values())
  .filter(c => c.neighbors.length === maxNeighbors)
  .map(c => c.id);
console.log(`邻国最多的国家 (${maxNeighbors}个): ${mostConnected.join(', ')}`);

// 找出孤立的国家（无邻国）
const isolated = Array.from(countries.values())
  .filter(c => c.neighbors.length === 0)
  .map(c => c.id);
console.log(`\n孤立国家/地区 (${isolated.length}个): ${isolated.slice(0, 20).join(', ')}${isolated.length > 20 ? '...' : ''}`);
