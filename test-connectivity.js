// 验证机场和港口连通性
import { initialCountryData } from './src/data/countryData.js';

console.log('开始验证机场和港口连通性...\n');

const countries = new Map();
initialCountryData.forEach(([id, pop, wealth, neighbors, hasAirport, hasPort]) => {
  countries.set(id, { 
    id, 
    population: pop,
    wealth,
    neighbors: neighbors || [], 
    hasAirport: hasAirport || false,
    hasPort: hasPort || false
  });
});

// 统计
const withAirport = Array.from(countries.values()).filter(c => c.hasAirport);
const withPort = Array.from(countries.values()).filter(c => c.hasPort);
const withBoth = Array.from(countries.values()).filter(c => c.hasAirport && c.hasPort);
const withEither = Array.from(countries.values()).filter(c => c.hasAirport || c.hasPort);
const isolated = Array.from(countries.values()).filter(c => 
  !c.hasAirport && !c.hasPort && (!c.neighbors || c.neighbors.length === 0)
);

console.log('=== 连通性统计 ===');
console.log(`总国家数: ${countries.size}`);
console.log(`有机场: ${withAirport.length} (${(withAirport.length/countries.size*100).toFixed(1)}%)`);
console.log(`有港口: ${withPort.length} (${(withPort.length/countries.size*100).toFixed(1)}%)`);
console.log(`机场+港口: ${withBoth.length}`);
console.log(`有连接方式: ${withEither.length} (${(withEither.length/countries.size*100).toFixed(1)}%)`);
console.log(`完全孤立: ${isolated.length} (无邻国、无机场、无港口)`);

if (isolated.length > 0) {
  console.log(`\n⚠️ 完全孤立的国家: ${isolated.map(c => c.id).join(', ')}`);
}

// 测试连通性：从一个大国开始，看能传播到多少国家
function testConnectivity(startId) {
  const visited = new Set();
  const queue = [startId];
  visited.add(startId);
  
  while (queue.length > 0) {
    const currentId = queue.shift();
    const current = countries.get(currentId);
    if (!current) continue;
    
    // 邻国
    for (const neighborId of current.neighbors) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push(neighborId);
      }
    }
    
    // 机场连接
    if (current.hasAirport) {
      for (const [id, country] of countries) {
        if (country.hasAirport && !visited.has(id)) {
          visited.add(id);
          queue.push(id);
        }
      }
    }
    
    // 港口连接
    if (current.hasPort) {
      for (const [id, country] of countries) {
        if (country.hasPort && !visited.has(id)) {
          visited.add(id);
          queue.push(id);
        }
      }
    }
  }
  
  return visited;
}

// 测试从几个主要国家开始的连通性
const testCountries = ['US', 'CN', 'BR', 'RU', 'GB'];
console.log('\n=== 连通性测试 ===');
for (const countryId of testCountries) {
  const country = countries.get(countryId);
  if (!country) continue;
  
  const reachable = testConnectivity(countryId);
  const coverage = (reachable.size / countries.size * 100).toFixed(1);
  const unreachable = Array.from(countries.keys()).filter(id => !reachable.has(id));
  
  console.log(`\n从 ${countryId} 开始:`);
  console.log(`  可达: ${reachable.size}/${countries.size} (${coverage}%)`);
  if (unreachable.length > 0 && unreachable.length <= 20) {
    console.log(`  不可达: ${unreachable.join(', ')}`);
  }
}

// 找出最难到达的国家
console.log('\n=== 最难到达的国家 ===');
const difficultCountries = Array.from(countries.values())
  .filter(c => {
    const hasConnection = c.hasAirport || c.hasPort || (c.neighbors && c.neighbors.length > 0);
    const hasLimitedConnection = !c.hasAirport && !c.hasPort && c.neighbors.length <= 1;
    return hasLimitedConnection;
  })
  .sort((a, b) => {
    const aScore = (a.hasAirport ? 10 : 0) + (a.hasPort ? 5 : 0) + (a.neighbors?.length || 0);
    const bScore = (b.hasAirport ? 10 : 0) + (b.hasPort ? 5 : 0) + (b.neighbors?.length || 0);
    return aScore - bScore;
  })
  .slice(0, 20);

difficultCountries.forEach(c => {
  const connections = [];
  if (c.neighbors?.length > 0) connections.push(`邻国${c.neighbors.length}`);
  if (c.hasAirport) connections.push('机场');
  if (c.hasPort) connections.push('港口');
  console.log(`  ${c.id}: ${connections.join(', ') || '无连接'}`);
});

console.log('\n✅ 验证完成！');
