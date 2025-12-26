# 欢迎使用你的秒哒应用代码包
秒哒应用链接
    URL:https://www.miaoda.cn/projects/app-8h3ts0wmky69

## 介绍

**思考的延伸** - 智能阅读与思考记录系统

这是一个为深度阅读和思考而设计的应用，让您在阅读文章时随时记录想法，并通过可视化的思维网络将零散的思考串联起来，形成完整的知识体系。

### 核心特性

- 📖 **沉浸式阅读体验** - 采用 Apple Design Language，提供优雅的阅读界面
- 💭 **即时思考记录** - 选择文本即可记录想法，无缝融入阅读流程
- 🕸️ **思维网络可视化** - 将所有思考以网络形式呈现，发现思想之间的联系
- 🌓 **日间/夜间模式** - 适应不同阅读场景
- 📱 **跨设备适配** - 完美支持桌面端和移动端
- ⌨️ **键盘快捷键** - 提高操作效率

### 使用指南

#### 基本操作

1. **记录思考**
   - 选择文章中的任意文本（至少3个字符）
   - 在弹出的便签中输入你的思考
   - 按 ESC 或 Ctrl+Enter 保存

2. **查看思考**
   - 鼠标悬停在蓝色波浪线上可预览思考
   - 点击波浪线可编辑思考

3. **思维网络**
   - 点击右下角的脑图标按钮打开思维网络
   - 查看所有思考记录
   - 点击卡片可定位到原文位置

#### 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| ESC | 关闭当前弹窗/清除选择 |
| Ctrl+Shift+N | 打开/关闭思维网络 |
| Ctrl+D | 切换日间/夜间模式 |
| Ctrl+Enter | 保存思考 |

### 技术特点

- **Apple Design Language** - 毛玻璃效果、精致动画、优雅交互
- **智能定位** - 便签和预览框自动调整位置，始终在视口内
- **移动端优化** - 触摸交互优化、防误触机制
- **数据持久化** - 使用 Supabase 存储，思考永不丢失

## 目录结构

```
├── README.md # 说明文档
├── components.json # 组件库配置
├── index.html # 入口文件
├── package.json # 包管理
├── postcss.config.js # postcss 配置
├── public # 静态资源目录
│   ├── favicon.png # 图标
│   └── images # 图片资源
├── src # 源码目录
│   ├── App.tsx # 入口文件
│   ├── components # 组件目录
│   ├── contexts # 上下文目录
│   ├── db # 数据库配置目录
│   ├── hooks # 通用钩子函数目录
│   ├── index.css # 全局样式
│   ├── layout # 布局目录
│   ├── lib # 工具库目录
│   ├── main.tsx # 入口文件
│   ├── routes.tsx # 路由配置
│   ├── pages # 页面目录
│   ├── services  # 数据库交互目录
│   ├── types   # 类型定义目录
├── tsconfig.app.json  # ts 前端配置文件
├── tsconfig.json # ts 配置文件
├── tsconfig.node.json # ts node端配置文件
└── vite.config.ts # vite 配置文件
```

## 技术栈

Vite、TypeScript、React、Supabase

## 本地开发

### 如何在本地编辑代码？

您可以选择 [VSCode](https://code.visualstudio.com/Download) 或者您常用的任何 IDE 编辑器，唯一的要求是安装 Node.js 和 npm.

### 环境要求

```
# Node.js ≥ 20
# npm ≥ 10
例如：
# node -v   # v20.18.3
# npm -v    # 10.8.2
```

具体安装步骤如下：

### 在 Windows 上安装 Node.js

```
# Step 1: 访问Node.js官网：https://nodejs.org/，点击下载后，会根据你的系统自动选择合适的版本（32位或64位）。
# Step 2: 运行安装程序：下载完成后，双击运行安装程序。
# Step 3: 完成安装：按照安装向导完成安装过程。
# Step 4: 验证安装：在命令提示符（cmd）或IDE终端（terminal）中输入 node -v 和 npm -v 来检查 Node.js 和 npm 是否正确安装。
```

### 在 macOS 上安装 Node.js

```
# Step 1: 使用Homebrew安装（推荐方法）：打开终端。输入命令brew install node并回车。如果尚未安装Homebrew，需要先安装Homebrew，
可以通过在终端中运行如下命令来安装：
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
或者使用官网安装程序：访问Node.js官网。下载macOS的.pkg安装包。打开下载的.pkg文件，按照提示完成安装。
# Step 2: 验证安装：在命令提示符（cmd）或IDE终端（terminal）中输入 node -v 和 npm -v 来检查 Node.js 和 npm 是否正确安装。
```

### 安装完后按照如下步骤操作：

```
# Step 1: 下载代码包
# Step 2: 解压代码包
# Step 3: 用IDE打开代码包，进入代码目录
# Step 4: IDE终端输入命令行，安装依赖：npm i
# Step 5: IDE终端输入命令行，启动开发服务器：npm run dev -- --host 127.0.0.1
```

### 如何开发后端服务？

配置环境变量，安装相关依赖
如需使用数据库，请使用 supabase 官方版本或自行部署开源版本的 Supabase

### 如何配置应用中的三方 API？

具体三方 API 调用方法，请参考帮助文档：[源码导出](https://cloud.baidu.com/doc/MIAODA/s/Xmewgmsq7)，了解更多详细内容。

## 了解更多

您也可以查看帮助文档：[源码导出](https://cloud.baidu.com/doc/MIAODA/s/Xmewgmsq7)，了解更多详细内容。
