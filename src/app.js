// src/app.js
import { MapArea } from './components/MapArea.js';
import { InfoBar } from './components/InfoBar.js';
import { NewsBar } from './components/NewsBar.js';
import { SkillTree } from './components/SkillTree.js';
import { SpecialEventManager } from './components/SpecialEvents.js';
import { StorageManager } from './utils/storage.js';
import { GameState } from './utils/gameState.js';
import { setLanguage, getCurrentLanguage } from './data/localization.js';

// 全局组件实例
let mapArea;
let infoBar;
let newsBar;
let skillTree;
let specialEventManager;
let storage;
let gameState;
let gameLoopTimer = null; // 游戏循环定时器

document.addEventListener('DOMContentLoaded', () => {
    // 初始化应用程序
    initApp();
});

function initApp() {
    // 初始化存储管理器
    storage = new StorageManager();
    
    // 检查是否需要输入明星名字（必须在渲染组件前完成）
    checkAndRequestStarName();
    
    // 初始化游戏状态（传入getStarName函数供新闻系统使用）
    gameState = new GameState(() => storage.getStarName());
    
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
export function getNewsBar() {
    return newsBar;
}

// 获取技能树实例（供其他组件访问）
export function getSkillTree() {
    return skillTree;
}

// 切换语言（供 footer 或其他组件调用）
export function switchLanguage(lang) {
    setLanguage(lang);
    // 未来可以在这里添加重新渲染逻辑
    console.log('语言已切换为:', lang);
    alert(`语言已切换为: ${lang}\n重新加载页面以应用更改`);
    location.reload(); // 简单实现：重新加载页面
}

// 获取当前语言（供其他组件查询）
export function getLanguage() {
    return getCurrentLanguage();
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

    // 渲染新闻栏（悬浮在地图上方）
    newsBar = new NewsBar('event-bar-container', gameState);

    // 渲染技能树
    skillTree = new SkillTree('skill-tree', gameState);
    
    // 将 skillTree 引用传给 gameState（用于事件系统）
    gameState.setSkillTree(skillTree);
    
    // 初始化特殊事件管理器
    specialEventManager = new SpecialEventManager(mapArea, gameState);
    
    // 设置地图点击开始游戏的回调
    mapArea.setGameStartCallback((countryId) => {
        // 立即显示游戏开始新闻（重要事件，不等待轮询）
        newsBar.displayNewsImmediately('game_start', { countryId });
        
        // 游戏开始后启动新闻播报
        newsBar.startBroadcast();
        // 启动特殊事件系统
        specialEventManager.start();
        // 启动游戏循环
        startGameLoop();
    });
    
    // 设置胜利回调
    gameState.setVictoryCallback(() => {
        // 显示胜利新闻
        newsBar.showGameEndNews(true);
        // 游戏结束时停止特殊事件
        specialEventManager.stop();
        // 停止游戏循环
        stopGameLoop();
        // 延迟3秒后开始回放历史新闻
        setTimeout(() => {
            newsBar.playbackHistory();
        }, 3000);
    });
    
    // 设置失败回调
    gameState.setDefeatCallback(() => {
        // 显示失败新闻
        newsBar.showGameEndNews(false);
        // 游戏结束时停止特殊事件
        specialEventManager.stop();
        // 停止游戏循环
        stopGameLoop();
        // 延迟3秒后开始回放历史新闻
        setTimeout(() => {
            newsBar.playbackHistory();
        }, 3000);
    });
    
    // 将组件暴露给全局，方便其他组件访问和调试
    window.gameState = gameState;
    window.skillTree = skillTree;
    window.specialEventManager = specialEventManager; // 调试用
    window.newsBar = newsBar; // 调试用
    window.mapArea = mapArea; // 调试用
    window.infoBar = infoBar; // 调试用
    
    // 暴露语言切换函数（供 footer 或控制台调用）
    window.switchLanguage = switchLanguage;
    window.getLanguage = getLanguage;
}

// 启动游戏循环
function startGameLoop() {
    // 如果已经有循环在运行，先停止
    if (gameLoopTimer) {
        clearInterval(gameLoopTimer);
    }
    
    // 动态导入游戏配置获取回合间隔
    import('./data/gameConfig.js').then(module => {
        const interval = module.getTurnInterval();
        
        // 启动游戏循环定时器
        gameLoopTimer = setInterval(() => {
            if (gameState.isStarted()) {
                processGameTurn();
            }
        }, interval);
        
        console.log('🎮 游戏循环已启动，回合间隔:', interval, 'ms');
    });
}

// 停止游戏循环
function stopGameLoop() {
    if (gameLoopTimer) {
        clearInterval(gameLoopTimer);
        gameLoopTimer = null;
        console.log('🛑 游戏循环已停止');
    }
}

// 处理一个游戏回合
function processGameTurn() {
    // 处理一个回合的所有事件
    const allEvents = gameState.processTurn();
    
    // 更新所有已感染国家的视觉效果
    if (mapArea) {
        mapArea.updateAllInfectedCountries();
    }
    
    // 更新总信徒数显示（右上角）
    updateTotalBelievers();
    
    // 更新信息栏信徒数显示（左下角）
    updateInfoBar();
    
    // 更新技能树财富显示
    if (window.skillTree) {
        window.skillTree.updateWealthDisplay();
    }
}

// 更新总信徒数显示
function updateTotalBelievers() {
    const totalBelievers = gameState.getTotalBelievers();
    const totalPopulation = gameState.getTotalPopulation();
    const percentage = totalPopulation > 0 
        ? ((totalBelievers / totalPopulation) * 100).toFixed(2) 
        : 0;
    
    const believersElement = document.getElementById('total-believers');
    if (believersElement) {
        believersElement.textContent = `${totalBelievers.toLocaleString()} (${percentage}%)`;
    }
}

// 更新信息栏显示
function updateInfoBar() {
    if (!infoBar) return;
    
    const totalBelievers = gameState.getTotalBelievers();
    const totalPopulation = gameState.getTotalPopulation();
    const totalApostates = gameState.getTotalApostates();
    
    // 更新信息栏的信徒数、叛教者数等
    infoBar.updateStats(
        totalBelievers,
        totalApostates,
        0, // cured参数（未使用）
        totalPopulation
    );
}