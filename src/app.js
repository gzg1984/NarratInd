// src/app.js
import { MapArea } from './components/MapArea.js';
import { InfoBar } from './components/InfoBar.js';

// 全局组件实例
let mapArea;
let infoBar;

document.addEventListener('DOMContentLoaded', () => {
    // 初始化应用程序
    initApp();
});

function initApp() {
    // 渲染组件
    renderComponents();
    
    // 设置事件监听器
    setupEventListeners();
}

function setupEventListeners() {
    // 示例：设置按钮点击事件
    const eventButton = document.getElementById('event-button');
    if (eventButton) {
        eventButton.addEventListener('click', handleEventButtonClick);
    }
}

function handleEventButtonClick() {
    // 处理事件按钮点击逻辑
    console.log('Event button clicked!');
    
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
    // 渲染地图区域
    mapArea = new MapArea('map-area');
    
    // 渲染信息栏（悬浮在地图上）
    infoBar = new InfoBar('info-bar-container');

    // 渲染事件栏
    const eventBar = document.getElementById('event-bar');
    if (eventBar) {
        // 这里可以调用事件栏组件的渲染函数
        eventBar.innerHTML = '<h3>事件栏</h3><button id="event-button">触发事件</button>';
    }

    // 渲染技能树
    const skillTree = document.getElementById('skill-tree');
    if (skillTree) {
        // 这里可以调用技能树组件的渲染函数
        skillTree.innerHTML = '<h3>技能树</h3><p>技能树加载中...</p>';
    }
}