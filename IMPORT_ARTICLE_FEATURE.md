# 文章导入功能 - 实现说明

## 功能概述

将"新建文章"改为"导入文章"，支持通过链接导入外部文章内容，自动清洗 HTML 并转换为系统所需格式。

## 核心功能

### 1. 导入流程

```
用户点击"导入文章" 
  ↓
弹出链接输入对话框
  ↓
输入文章 URL
  ↓
Edge Function 获取网页内容（避免 CORS）
  ↓
提取元数据（标题、作者、来源等）
  ↓
清洗 HTML（移除广告、脚本等）
  ↓
转换为 Markdown（使用 Turndown）
  ↓
转换为段落数组格式
  ↓
计算字数和阅读时间
  ↓
保存到 Supabase
  ↓
刷新文章列表
```

### 2. HTML 清洗

**移除的元素：**
- 脚本标签（script）
- 样式标签（style）
- iframe、noscript
- 导航栏（nav）
- 页眉页脚（header、footer）
- 侧边栏（aside）
- 广告（.advertisement、.ads）
- 社交分享（.social-share）
- 评论区（.comments）
- 相关文章（.related-posts）

**内容提取策略：**
1. 优先查找 `<article>` 标签
2. 查找 `[role="main"]` 或 `<main>` 标签
3. 查找常见内容类名（.article-content、.post-content 等）
4. 如果都找不到，使用 `<body>` 内容

### 3. 元数据提取

**提取的信息：**
- **标题**：
  - Open Graph: `og:title`
  - Twitter: `twitter:title`
  - HTML: `<title>` 标签
  - 默认：未命名文章

- **作者**：
  - Meta: `name="author"`
  - Open Graph: `article:author`
  - HTML: `[rel="author"]`

- **描述**：
  - Open Graph: `og:description`
  - Meta: `name="description"`

- **来源**：
  - Open Graph: `og:site_name`
  - URL: hostname

- **发布时间**：
  - Open Graph: `article:published_time`
  - Meta: `name="publish_date"`

### 4. Markdown 转换

使用 **Turndown** 库将 HTML 转换为 Markdown：

**配置：**
```javascript
{
  headingStyle: 'atx',        // 使用 # 风格的标题
  codeBlockStyle: 'fenced',   // 使用 ``` 风格的代码块
  emDelimiter: '*',           // 使用 * 表示斜体
}
```

### 5. 段落类型识别

系统支持多种段落类型：

#### 5.1 标题（Heading）
```markdown
# 一级标题
## 二级标题
### 三级标题
```
转换为：
```typescript
{
  id: 'p1',
  type: 'heading',
  level: 1 | 2 | 3,
  text: '标题文本'
}
```

#### 5.2 列表（List）
```markdown
- 列表项 1
- 列表项 2
- 列表项 3
```
转换为：
```typescript
{
  id: 'p2',
  type: 'list',
  items: ['列表项 1', '列表项 2', '列表项 3']
}
```

#### 5.3 引用（Quote）
```markdown
> 这是一段引用文本
```
转换为：
```typescript
{
  id: 'p3',
  type: 'quote',
  text: '这是一段引用文本'
}
```

#### 5.4 普通段落（Paragraph）
```markdown
这是一段普通文本。
```
转换为：
```typescript
{
  id: 'p4',
  type: 'paragraph',
  text: '这是一段普通文本。'
}
```

### 6. 字数和阅读时间计算

**字数统计：**
- 中文字符：使用正则 `/[\u4e00-\u9fa5]/g` 匹配
- 英文单词：使用正则 `/[a-zA-Z]+/g` 匹配
- 总字数 = 中文字符数 + 英文单词数

**阅读时间：**
- 阅读速度：350 字/分钟（中英文混合）
- 阅读时间 = Math.ceil(字数 / 350)
- 最少 1 分钟

## 技术实现

### 1. 核心文件

#### ImportArticleDialog.tsx
- 导入对话框组件
- URL 输入和验证
- 加载状态显示
- 错误处理

#### articleImporter.ts
- HTML 获取和清洗
- 元数据提取
- Markdown 转换
- 段落格式化
- 字数统计

#### fetch-article (Edge Function)
- 代理请求，避免 CORS
- 设置合适的 User-Agent
- 返回 HTML 内容

### 2. 数据流

```
前端 (ArticlesPage)
  ↓ 调用 importArticle(url)
articleImporter.ts
  ↓ 调用 Edge Function
Supabase Edge Function (fetch-article)
  ↓ 获取网页
外部网站
  ↓ 返回 HTML
articleImporter.ts
  ↓ 清洗 + 转换
前端 (ArticlesPage)
  ↓ 调用 articlesApi.createArticle()
Supabase Database
```

### 3. API 更新

**新增方法：**
```typescript
// 创建文章
articlesApi.createArticle(article: Omit<Article, 'id' | 'created_at'>)

// 删除文章
articlesApi.deleteArticle(id: number)

// 批量删除文章
articlesApi.deleteArticles(ids: number[])
```

### 4. 类型定义更新

**Article 类型：**
```typescript
interface Article {
  id: number;
  title: string;
  author?: string | null;      // 改为可选
  source?: string | null;       // 改为可选
  word_count?: number | null;   // 改为可选
  reading_time?: number | null; // 改为可选
  content: Paragraph[];
  created_at: string;
}
```

**Paragraph 类型：**
```typescript
type Paragraph = 
  | { id: string; type: 'paragraph'; text: string }
  | { id: string; type: 'heading'; level: 1 | 2 | 3; text: string }
  | { id: string; type: 'list'; items: string[] }
  | { id: string; type: 'quote'; text: string }
  | { id: string; text: string }; // 兼容旧格式
```

## 使用方法

### 1. 导入文章

1. 打开文章管理页面
2. 点击左侧"导入文章"按钮
3. 在弹出的对话框中输入文章 URL
4. 点击"导入"按钮
5. 等待导入完成
6. 文章自动添加到列表中

### 2. 支持的网站

理论上支持所有标准的 HTML 网页，包括：
- 博客文章
- 新闻网站
- 技术文档
- Medium 文章
- 知乎文章
- 简书文章
- 等等...

### 3. 注意事项

- 需要网站允许抓取（不受反爬虫限制）
- 需要网站有合理的 HTML 结构
- 动态加载的内容可能无法获取
- 某些网站可能需要登录才能访问

## 错误处理

### 1. URL 验证
- 空链接：提示"请输入文章链接"
- 无效格式：提示"请输入有效的链接地址"

### 2. 网络错误
- 无法访问：提示"无法获取文章内容"
- 超时：提示"请求超时，请重试"

### 3. 内容解析错误
- 无法提取内容：使用默认值
- 标题为空：使用"未命名文章"

## 性能优化

1. **Edge Function 缓存**：可以添加缓存机制，避免重复请求
2. **并发限制**：限制同时导入的文章数量
3. **进度显示**：显示导入进度（获取中、解析中、保存中）
4. **错误重试**：网络错误时自动重试

## 扩展功能（待实现）

### 1. 批量导入
- 支持一次导入多个链接
- 显示导入进度列表
- 失败的链接可以重试

### 2. 导入历史
- 记录导入过的链接
- 避免重复导入
- 显示导入时间和状态

### 3. 自定义规则
- 用户可以自定义清洗规则
- 支持正则表达式匹配
- 保存常用网站的规则

### 4. 内容预览
- 导入前预览提取的内容
- 允许用户编辑标题、作者等
- 选择性导入段落

### 5. 图片处理
- 下载文章中的图片
- 上传到 Supabase Storage
- 替换图片链接

## 安全考虑

1. **URL 验证**：防止恶意链接
2. **内容过滤**：移除危险的 HTML 标签
3. **大小限制**：限制文章大小，防止内存溢出
4. **速率限制**：限制导入频率，防止滥用

## 依赖库

- **turndown**: HTML 转 Markdown
- **@types/turndown**: TypeScript 类型定义

## 部署要求

- Supabase Edge Function 已部署（fetch-article）
- 环境变量配置正确：
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
