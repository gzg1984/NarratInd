# Plague Inc Web Clone

## 项目简介
这是一个基于瘟疫公司（Plague Inc）游戏概念的网页克隆项目。该项目旨在提供一个简易的网页游戏体验，玩家可以通过控制病毒传播来感染世界各地的人口。

## 项目结构
- `src/app.js`：应用程序的入口文件，负责初始化和管理组件之间的交互。
- `src/style.css`：包含所有样式规则，用于美化网页外观。
- `src/index.html`：主HTML文件，定义网页结构。
- `src/components/MapArea.js`：地图区域组件，渲染世界地图并处理交互。
- `src/components/InfoBar.js`：信息栏组件，显示游戏数据。
- `src/components/EventBar.js`：事件栏组件，包含控制按钮和事件逻辑。
- `src/components/SkillTree.js`：技能树组件，允许玩家选择和升级技能。
- `src/assets/world.svg`：SVG格式的世界地图。
- `package.json`：npm配置文件，列出项目依赖项和脚本。

## 使用说明
1. 克隆项目到本地：
   ```
   git clone <repository-url>
   ```
2. 进入项目目录：
   ```
   cd plague-inc-web
   ```
3. 安装依赖：
   ```
   npm install
   ```
4. 启动项目：
   ```
   npm start
   ```
5. 在浏览器中访问 `http://localhost:3000` 查看项目。

## 开发步骤
1. **设计界面**：使用 `style.css` 设计网页外观，确保符合瘟疫公司的风格。
2. **实现组件逻辑**：逐步实现 `src/components` 目录下的每个组件逻辑。
3. **整合组件**：在 `app.js` 中整合所有组件，确保它们能够协同工作。
4. **测试功能**：在浏览器中测试网页，确保所有功能正常运行。
5. **优化和扩展**：根据用户反馈和测试结果，优化代码和界面，添加更多功能。

## 贡献
欢迎任何形式的贡献！请提交问题或拉取请求。

## 许可证
本项目采用 MIT 许可证。