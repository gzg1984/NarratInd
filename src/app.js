// src/app.js
import { MapArea } from './components/MapArea.js';
import { InfoBar } from './components/InfoBar.js';
import { EventBar } from './components/EventBar.js';
import { SkillTree } from './components/SkillTree.js';
import { SpecialEventManager } from './components/SpecialEvents.js';
import { StorageManager } from './utils/storage.js';
import { GameState } from './utils/gameState.js';

// 全局组件实例
let mapArea;
let infoBar;
let eventBar;
let skillTree;
let specialEventManager;
let storage;
let gameState;

document.addEventListener('DOMContentLoaded', () => {
    // 初始化应用程序
    initApp();
});

function initApp() {
    // 初始化存储管理器
    storage = new StorageManager();
    
    // 初始化游戏状态
    gameState = new GameState();
    
    // 检查是否需要输入明星名字（必须在渲染组件前完成）
    checkAndRequestStarName();
    
    // 渲染组件
    renderComponents();
    
    // 设置事件监听器
    setupEventListeners();
}

// 检查并请求明星名字
function checkAndRequestStarName() {
    if (!storage.hasCache()) {
        const starName = prompt('欢迎来到叙事工业！\n请输入你的明星的名字：');
        
        if (starName && starName.trim()) {
            storage.setStarName(starName.trim());
            console.log('明星名字已保存:', starName.trim());
        } else {
            // 如果用户取消或输入为空，使用默认名字
            storage.setStarName('无名明星');
        }
    } else {
        console.log('欢迎回来！明星名字:', storage.getStarName());
    }
}

// 获取明星名字（供其他模块使用）
export function getStarName() {
    return storage ? storage.getStarName() : '无名明星';
}

// 获取事件栏实例（供其他组件修改事件列表）
export function getEventBar() {
    return eventBar;
}

// 获取技能树实例（供其他组件访问）
export function getSkillTree() {
    return skillTree;
}

function setupEventListeners() {
    // 示例：设置按钮点击事件（已注释掉，使用自动触发）
    // const eventButton = document.getElementById('event-button');
    // if (eventButton) {
    //     eventButton.addEventListener('click', handleEventButtonClick);
    // }
    
    // 设置清除缓存按钮
    const clearCacheBtn = document.getElementById('clear-cache-btn');
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', handleClearCache);
    }
}

// 处理清除缓存
function handleClearCache() {
    const confirmed = confirm('是否清除所有缓存？\n（包括明星名字等所有游戏数据）');
    
    if (confirmed) {
        storage.clearAll();
        alert('缓存已清除！页面将重新加载。');
        location.reload();
    }
}

function handleEventButtonClick() {
    // 处理事件按钮点击逻辑
    const starName = storage.getStarName();
    console.log('Event button clicked!');
    
    // 示例：显示包含明星名字的事件
    alert(`突发新闻！${starName}发布了新专辑，引发粉丝狂潮！`);
    
    // 示例：更新统计信息
    if (infoBar) {
        const currentStats = infoBar.getStats();
        infoBar.updateStats(
            currentStats.infected + 100,
            currentStats.deaths + 10,
            currentStats.cured + 5
        );
    }
}

function renderComponents() {
    // 渲染地图区域（传入游戏状态）
    mapArea = new MapArea('map-area', gameState);
    
    // 渲染信息栏（悬浮在地图左下角）
    infoBar = new InfoBar('info-bar-container');

    // 渲染事件栏（悬浮在地图上方，传入游戏状态）
    eventBar = new EventBar('event-bar-container', infoBar, getStarName, mapArea, gameState);

    // 渲染技能树
    skillTree = new SkillTree('skill-tree', gameState);
    
    // 将 skillTree 引用传给 gameState（用于事件系统）
    gameState.setSkillTree(skillTree);
    
    // 初始化特殊事件管理器
    specialEventManager = new SpecialEventManager(mapArea, gameState);
    
    // 设置地图点击开始游戏的回调
    mapArea.setGameStartCallback((countryId) => {
        eventBar.showGameStartEvent(countryId);
        // 游戏开始后启动特殊事件系统
        specialEventManager.start();
    });
    
    // 设置胜利回调
    gameState.setVictoryCallback(() => {
        eventBar.showVictoryEvent();
        // 游戏结束时停止特殊事件
        specialEventManager.stop();
    });
    
    // 将 skillTree 暴露给全局，方便其他组件访问
    window.skillTree = skillTree;
    window.specialEventManager = specialEventManager; // 调试用
}