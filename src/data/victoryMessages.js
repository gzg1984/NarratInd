// 胜利提示语
export const victoryMessages = [
  "{starName}已经席卷全球，所有人都认为如果没有{starName}，人类文明将不算是文明。",
  "全世界都沉浸在{starName}的光辉之下，再无人能够想象没有{starName}的世界。",
  "{starName}成为了人类唯一的信仰，历史将被改写，{starName}即是真理。",
  "地球上的每一个角落都回荡着{starName}的名字，这是新纪元的开始。",
  "{starName}征服了所有人的心智，人类从此进入了{starName}时代。"
];

// 获取随机胜利消息
export function getRandomVictoryMessage(starName) {
  const randomIndex = Math.floor(Math.random() * victoryMessages.length);
  const message = victoryMessages[randomIndex];
  return message.replace(/{starName}/g, starName);
}
