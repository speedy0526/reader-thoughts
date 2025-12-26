# 思考的延伸 - 智能阅读与思考记录系统需求文档

## 1. 项目概述

### 1.1 项目名称
思考的延伸 - 智能阅读与思考记录系统

### 1.2 核心价值
为用户提供沉浸式阅读体验，同时支持在阅读过程中记录、关联和回顾个人思考，形成知识网络。\n
### 1.3 核心功能
- 文章阅读与文本选择
- 思考记录与编辑
- 思考网络可视化
- 文章管理与组织
- 跨设备适配（桌面端+移动端）\n- 文章导入功能（支持静态和动态页面）\n- 最近阅读分类管理

## 2. 页面结构与布局

### 2.1 整体结构
```text
├── 主容器 (Container)\n│   ├── 文章头部 (Article Header)\n│   ├── 文章内容区 (Article Content)\n│   │   ├── 思考预览层 (Thought Preview)\n│   │   └── 段落系统 (Paragraphs with data-id)\n│   └── 悬浮操作区
│       ├── 思维网络入口 (Network Entry)\n│       └── 触发提示 (Trigger Hint)\n├── 全局覆盖层
│   ├── 思考输入便签 (Thought Sticky)\n│   ├── 思维网络视图 (Thought Network)\n│   └── 移动端点击防护层 (Mobile Tap Guard)\n└── 文章管理页面 (Article Manager)\n    ├── 左侧导航栏 (Sidebar Navigation)\n    └── 右侧内容区 (Main Content Area)\n        ├── 顶部操作栏 (Top Toolbar)\n        │   ├── 导入按钮 (Import Button)\n        │   ├── 列表/卡片切换按钮 (View Mode Toggle)\n        │   └── 搜索框 (Search Input)\n        └── 内容显示区 (Content Display)\n            ├── 最近阅读区域 (Recent Reads)\n            │   └── 分类管理功能 (Category Management)\n            ├── 列表视图 (List View)\n            └── 卡片视图 (Card View)\n``` \n
### 2.2 各组件详细规格

#### 2.2.1 文章管理页面

##### 2.2.1.1 左侧导航栏 (Sidebar Navigation)\n- 宽度: 280px
- 位置: 左侧固定
- 背景: #fafafa
- 内容: 分类导航、标签云、搜索功能
- 响应式: 小屏幕时可折叠

##### 2.2.1.2 顶部操作栏 (Top Toolbar)\n- 高度: 56px
- 背景: #ffffff
- 边框: 底部细线分割
- 元素间距: 16px

###### 2.2.1.2.1 导入按钮 (Import Button)\n- 尺寸: 40×40px
- 图标: 导入图标
- 悬浮效果: 阴影增强
- 功能: 弹出链接输入框，支持文章导入

###### 2.2.1.2.2 列表/卡片切换按钮 (View Mode Toggle)\n- 尺寸: 40×40px
- 图标: 列表和卡片切换图标
- 状态指示: 当前视图模式高亮显示

###### 2.2.1.2.3 搜索框 (Search Input)\n- 宽度: 240px
- 圆角: 8px
- 占位符: 搜索文章
- 图标: 放大镜

##### 2.2.1.3 内容显示区 (Content Display)\n
###### 2.2.1.3.1 最近阅读区域 (Recent Reads)\n- 区域标题: 最近阅读
- 显示方式: 时间倒序排列
- 内容展示: 文章标题、阅读时间
- 分类管理功能: 支持为最近阅读文章添加、编辑和删除分类标签

###### 2.2.1.3.2 列表视图 (List View)\n- 项目间距: 8px
- 项目高度: 56px
- 显示内容: 文章标题、作者、时间

###### 2.2.1.3.3 卡片视图 (Card View)\n- 卡片间距: 16px
- 卡片尺寸: 280×200px
- 显示内容: 文章封面、标题、摘要

#### 2.2.2 主容器 (Container)\n- 文章头部 (Article Header): 显示文章标题、来源等信息
- 文章内容区 (Article Content): 支持文本选择和思考记录
- 悬浮操作区: 提供快速操作入口

## 3. 交互设计与行为

### 3.1 核心交互流程

#### 3.1.1 文章管理页面交互
- 导航切换: 点击左侧导航栏切换分类
- 视图切换: 点击列表/卡片按钮切换显示模式
- 搜索功能: 输入关键词过滤文章列表
- 文章操作: 点击文章项进入阅读模式
- 文章导入: 点击导入按钮弹出链接输入框
- 最近阅读分类: 点击分类标签进行添加、编辑、删除操作

#### 3.1.2 文章导入流程
1. 点击导入按钮弹出链接输入框
2. 用户输入文章链接
3. 检测页面类型（静态或动态）\n4. 静态页面: 使用Fetch API获取内容
5. 动态页面: 使用Puppeteer抓取完整渲染内容
6. 使用TruNDowN清洗HTML格式
7. 转换为文章预览格式
8. 获取链接元数据信息
9. 保存为本地文章

#### 3.1.3 记录思考
- 文本选择: 长按或拖拽选择文章内容
- 思考记录: 弹出输入框记录个人想法
- 关联建立: 自动关联选中文本和思考内容

#### 3.1.4 查看与编辑思考
- 思考列表: 展示所有记录的思考
- 思考编辑: 支持修改和删除思考内容
- 文本跳转: 点击思考直接定位到原文位置

#### 3.1.5 全局视图
- 思考网络: 可视化展示思考之间的关联关系
- 网络导航: 支持在网络中浏览和跳转

## 4. 视觉设计与颜色系统

### 4.1 设计风格
- 苹果设计语言 (Apple Design Language)\n- 极简主义
- 毛玻璃效果
- 微妙的动画和过渡
- 高对比度
- 系统字体优先

### 4.2 颜色方案
- 主色调: #2C3E50（深蓝灰）\n- 辅助色: #E67E22（橙色）\n- 背景色: #F8F9FA（浅灰白）\n- 文字色: #333333（深灰色）\n
### 4.3 字体系统
- 主字体: System UI Font, fallback to -apple-system, BlinkMacSystemFont
- 字号等级: 14px（正文）、16px（标题）、12px（辅助文字）\n- 行高: 1.5倍字号

### 4.4 动画与过渡
- 基础时长: 0.3s
- 缓动函数: ease-out
- 层级动画: 按视觉层次依次出现
- 状态切换: 平滑过渡效果

## 5. 响应式设计

### 5.1 断点设置
- 移动端: ≤768px
- 平板: 769-1024px
- 桌面端: ≥1025px

### 5.2 移动端适配

#### 5.2.1 文章管理页面适配
- 导航栏: 折叠为汉堡菜单
- 视图模式: 默认列表视图
- 搜索框: 简化为图标触发
- 导入按钮: 顶部固定显示
- 分类管理: 点击分类标签弹出操作菜单

#### 5.2.2 阅读页面适配
- 文章内容: 适配屏幕宽度
- 操作区域: 底部固定工具栏
- 触控优化: 增大点击区域

## 6. 技术实现要求

### 6.1 前端技术要求
- HTML5: 语义化标签
- CSS3: Flexbox, Grid, 动画, 毛玻璃效果
- JavaScript: ES6+, DOM操作, 事件处理
- 响应式: 移动优先设计
- Router: 页面路由管理
- TruNDowN: HTML清洗和格式转换
- Puppeteer: 动态页面内容抓取

### 6.2 文章导入技术
- 链接抓取: Fetch API获取远程内容
- 动态页面处理: Puppeteer抓取完整渲染内容
- HTML解析: TruNDowN库清洗和转换
- 元数据提取: 标题、作者、发布时间等
- 数据存储: 本地持久化保存

### 6.3 浏览器兼容性
- 支持现代浏览器: Chrome, Firefox, Safari, Edge
- 移动端支持: iOS Safari, Android Chrome

### 6.4 性能要求
- 首屏加载时间: ≤2秒
- 页面渲染性能: 60fps流畅体验
- 图片优化: 压缩和懒加载

### 6.5 无障碍访问
- ARIA属性: 支持屏幕阅读器
- 键盘导航: 支持Tab键操作
- 对比度: 符合WCAG标准

## 6.6 Puppeteer配置
- 安装命令: npm install puppeteer
- 使用方法: \n```javascript
import puppeteer from 'puppeteer';\n
const fetchDynamicContent = async (url) => {\n const browser = await puppeteer.launch({ headless: true });\n const page = await browser.newPage();\n await page.goto(url);\n await page.waitForSelector('body'); // 等待页面内容加载完成
 const content = await page.content();\n await browser.close();\n return content;\n};\n```\n- 适用场景: 处理带有JavaScript动态加载内容的页面

## 7. 数据管理与状态

### 7.1 应用状态结构
```javascript
{\n  nightMode: boolean,           // 夜间模式
  thoughts: array,              // 思考列表
  articles: array,              // 文章列表
  currentSelection: object,     // 当前选中的文本
  currentArticle: object,       // 当前查看的文章
  isNetworkOpen: boolean,       // 网络视图状态
  isStickyOpen: boolean,        // 输入框状态
  isMobile: boolean,            // 设备类型
  currentThoughtId: number,     // 思考ID计数器
  importLink: string,           // 当前导入链接
  recentReadCategories: array,  // 最近阅读分类列表
  isPuppeteerActive: boolean    // 是否启用Puppeteer状态
}\n``` \n
### 7.2 文章数据结构
```javascript
{\n  id: number,                   // 唯一标识
  title: string,                // 文章标题
  content: string,              // 文章内容
  author: string,               // 作者
  createdAt: Date,              // 创建时间
  sourceUrl: string,            // 原始链接
  metadata: object,             // 文章元数据
  thoughts: array,              // 关联的思考列表
  categories: array,            // 文章分类标签
  isDynamic: boolean           // 是否为动态页面导入
}\n``` \n
## 8. 扩展性与维护

### 8.1 扩展功能预留
- 数据持久化: localStorage或IndexedDB
- 云端同步: 用户账户和云端备份
- 多语言支持: i18n框架预留
- 主题系统: 多主题切换
- 导出功能: 思考导出为PDF/Markdown
- 批量导入: 支持多个链接批量导入

### 8.2 维护要求
- 代码注释: 重要模块添加注释
- 版本控制: Git版本管理
- 文档更新: 定期更新需求文档
- 错误监控: 异常上报机制

## 9. 测试要求

### 9.1 功能测试
- 文本选择与高亮
- 思考记录与编辑
- 思考网络导航
- 文章管理操作
- 键盘快捷键
- 移动端触摸交互
- 文章导入流程
- HTML清洗转换
- 元数据提取
- 最近阅读分类管理
- Puppeteer抓取动态页面功能
- 静态与动态页面导入兼容性

### 9.2 兼容性测试
- 不同浏览器测试
- 移动端设备测试
- 响应式布局验证
- 无障碍功能测试

### 9.3 性能测试
- 加载速度测试
- 渲染性能监控
- 内存使用优化
- 网络请求优化

## 10. 部署与交付

### 10.1 交付物
- 前端源代码
- 需求文档
- 测试报告
- 部署说明
- 变更日志

### 10.2 部署要求
- 服务器配置: Node.js环境
- 静态资源托管: CDN加速
- 备份策略: 定时自动备份
- 更新机制: 版本化部署

## 11. 设计原则总结

### A. 用户体验原则
- 以用户为中心的设计理念
- 简单直观的操作流程
- 瞬间反馈的交互体验
- 个性化的工作空间

### B. 视觉设计原则
- 极简而不失精致的界面
- 一致性的视觉语言
- 优雅的过渡动画
- 舒适的阅读体验

### C. 技术实现原则
- 现代前端技术栈
- 可维护的代码结构
- 高性能的实现方案
- 良好的扩展性

## 10. 文章导入技术方案

### 10.1 架构设计

系统采用 **本地 Puppeteer 服务器** 的方案，完全避免跨域问题和浏览器限制：

```
前端 (React)
    ↓ HTTP 请求 (localhost:3001)
Puppeteer 服务器 (Node.js + Express)
    ↓ Puppeteer 无头浏览器
目标网站 (任意网站，无跨域限制)
```

#### 10.1.1 为什么使用本地服务器？

1. **技术限制**：Puppeteer 只能在 Node.js 环境运行，无法在浏览器前端使用
2. **避免 CORS**：服务端请求不受浏览器同源策略限制
3. **完整渲染**：Puppeteer 启动真实的 Chrome 浏览器，完整执行 JavaScript
4. **统一处理**：所有网站（静态、动态、SPA）使用同一套方案

#### 10.1.2 Puppeteer 服务器实现

**服务器端 (server/puppeteer-server.js)：**
- 使用 Express 创建 HTTP 服务器
- 监听 `POST /api/fetch-article` 接口
- 启动无头 Chrome 浏览器
- 等待网络空闲确保动态内容加载完成
- 返回完整的 HTML 内容

**前端调用 (src/services/articleImporter.ts)：**
- 调用本地 Puppeteer 服务器 API
- 传递目标 URL
- 接收 HTML 内容
- 进行后续处理（清洗、转换、提取）

### 10.2 使用方式

#### 10.2.1 启动服务

1. **启动 Puppeteer 服务器**：
   ```bash
   npm run puppeteer-server
   ```
   服务器将在 `http://localhost:3001` 启动

2. **启动前端应用**：
   按照正常流程启动前端应用

#### 10.2.2 环境变量配置

在 `.env` 文件中配置：
```env
VITE_PUPPETEER_SERVER_URL=http://localhost:3001
```

### 10.3 工作流程

1. **用户输入链接**：在前端输入文章 URL
2. **前端发起请求**：调用本地 Puppeteer 服务器 API
3. **Puppeteer 处理**：
   - 启动无头 Chrome 浏览器
   - 访问目标网站
   - 等待网络空闲（`networkidle2`）
   - 额外等待 2 秒确保 JavaScript 执行完成
   - 获取完整的 HTML 内容
4. **返回结果**：服务器返回 HTML 给前端
5. **内容处理**：前端进行 HTML 清洗、Markdown 转换、段落提取等

### 10.4 智能内容提取

#### 10.4.1 文本密度算法
- 计算每个 DOM 节点的文本密度
- 综合考虑：文本长度、标签数量、链接密度、段落数量
- 自动识别主要内容区域

#### 10.4.2 三层内容清洗
1. **HTML 清洗**：移除 script、style、nav、footer 等噪音元素
2. **Markdown 清洗**：移除导航链接、社交分享、广告标记等
3. **段落过滤**：移除头尾的噪音段落（登录提示、版权声明等）

#### 10.4.3 正则表达式安全处理
- 在 Markdown 渲染前清理可能导致正则表达式错误的字符
- 转义特殊字符组合（`${}`、`%{}`、命名捕获组等）
- 确保 GFM 自动链接处理的稳定性

### 10.5 性能优化

- **超时控制**：Puppeteer 设置 30 秒超时，避免长时间等待
- **资源限制**：无头浏览器使用最小化参数（`--no-sandbox`、`--disable-gpu` 等）
- **自动清理**：每次请求后自动关闭浏览器实例
- **日志记录**：详细记录每次抓取的过程和结果

### 10.6 错误处理

- **内容验证**：检查提取的内容长度，少于 500 字符时报错
- **连接检查**：检测 Puppeteer 服务器是否运行
- **友好提示**：提供详细的错误信息和解决建议
- **异常捕获**：捕获并记录所有错误，避免应用崩溃

### 10.7 安全注意事项

1. **仅限本地使用**：默认配置仅监听 localhost
2. **输入验证**：服务器验证 URL 格式
3. **资源限制**：设置超时和资源限制，防止滥用
4. **错误隔离**：每个请求独立处理，互不影响

