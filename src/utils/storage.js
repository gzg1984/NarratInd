// storage.js - 本地存储管理工具
export class StorageManager {
  constructor() {
    this.STAR_NAME_KEY = 'narratind_star_name';
  }

  // 保存明星名字
  setStarName(name) {
    try {
      localStorage.setItem(this.STAR_NAME_KEY, name);
      return true;
    } catch (e) {
      console.error('保存失败:', e);
      return false;
    }
  }

  // 获取明星名字
  getStarName() {
    try {
      return localStorage.getItem(this.STAR_NAME_KEY);
    } catch (e) {
      console.error('读取失败:', e);
      return null;
    }
  }

  // 清除所有缓存
  clearAll() {
    try {
      localStorage.removeItem(this.STAR_NAME_KEY);
      // 可以在这里添加其他需要清除的缓存
      return true;
    } catch (e) {
      console.error('清除失败:', e);
      return false;
    }
  }

  // 检查是否有缓存
  hasCache() {
    return this.getStarName() !== null;
  }
}
