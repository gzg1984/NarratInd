/**
 * 初始特性配置
 * 玩家在游戏开始前可以选择的初始特性
 */

export const TRAITS = {
  WEALTHY_START: {
    id: 'wealthy_start',
    name: '富裕起点',
    description: '你从一个富裕的家族继承了一笔财富',
    icon: '💰',
    effects: {
      initialWealth: 6  // 初始财富+6
    }
  }
  
  // 未来可以添加更多特性，例如：
  // CHARISMATIC: {
  //   id: 'charismatic',
  //   name: '魅力非凡',
  //   description: '你天生具有吸引力',
  //   icon: '✨',
  //   effects: {
  //     spreadProbability: 1.2  // 传播概率+20%
  //   }
  // }
};

/**
 * 获取所有可用特性列表
 */
export function getAvailableTraits() {
  return Object.values(TRAITS);
}

/**
 * 根据ID获取特性
 */
export function getTraitById(id) {
  return Object.values(TRAITS).find(trait => trait.id === id);
}
