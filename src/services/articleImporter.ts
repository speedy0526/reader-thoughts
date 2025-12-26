import TurndownService from "turndown";
import type { Paragraph } from "@/types/types";

// 初始化 Turndown 服务
const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  emDelimiter: "*",
});

// 自定义规则：移除脚本和样式标签
turndownService.remove(["script", "style", "iframe", "noscript"]);

// Puppeteer 服务器地址
const READER_SERVER_URL = import.meta.env.VITE_READER_SERVER_URL;
const READER_API_KEY = import.meta.env.VITE_READER_API_KEY;

interface ArticleMetadata {
  title: string;
  author?: string;
  description?: string;
  source?: string;
  publishedTime?: string;
}

interface ImportedArticle {
  title: string;
  author?: string | null;
  source?: string | null;
  content: Paragraph[];
  word_count?: number | null;
  reading_time?: number | null;
}

/**
 * 使用 Puppeteer 服务器获取文章内容
 */
async function fetchArticleContent(url: string): Promise<string | undefined> {
  console.log("正在通过 READER 服务器获取文章内容:", url);

  try {
    const response = await fetch(`${READER_SERVER_URL}${url}`, {
      method: "GET",
      headers: {
        "X-API-KEY": READER_API_KEY,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const { raw_html } = await response.json();
    return raw_html;
  } catch (error) {
    console.error("Reader 服务器获取失败:", error);
  }
}

/**
 * 从 HTML 中提取元数据
 */
function extractMetadata(html: string, url: string): ArticleMetadata {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // 提取标题
  let title =
    doc.querySelector('meta[property="og:title"]')?.getAttribute("content") ||
    doc.querySelector('meta[name="twitter:title"]')?.getAttribute("content") ||
    doc.querySelector("title")?.textContent ||
    "未命名文章";

  // 提取作者
  const author =
    doc.querySelector('meta[name="author"]')?.getAttribute("content") ||
    doc
      .querySelector('meta[property="article:author"]')
      ?.getAttribute("content") ||
    doc.querySelector('[rel="author"]')?.textContent ||
    undefined;

  // 提取描述
  const description =
    doc
      .querySelector('meta[property="og:description"]')
      ?.getAttribute("content") ||
    doc.querySelector('meta[name="description"]')?.getAttribute("content") ||
    undefined;

  // 提取来源
  const source =
    doc
      .querySelector('meta[property="og:site_name"]')
      ?.getAttribute("content") ||
    new URL(url).hostname ||
    undefined;

  // 提取发布时间
  const publishedTime =
    doc
      .querySelector('meta[property="article:published_time"]')
      ?.getAttribute("content") ||
    doc.querySelector('meta[name="publish_date"]')?.getAttribute("content") ||
    undefined;

  return {
    title: title.trim(),
    author: author?.trim(),
    description: description?.trim(),
    source: source?.trim(),
    publishedTime: publishedTime?.trim(),
  };
}

/**
 * 计算节点的文本密度分数
 */
function calculateTextDensity(element: Element): number {
  // 获取文本内容
  const text = element.textContent || "";
  const textLength = text.trim().length;

  // 如果文本太短，直接返回 0
  if (textLength < 100) return 0;

  // 计算标签数量
  const tagCount = element.getElementsByTagName("*").length;

  // 计算链接密度（链接文本占总文本的比例）
  const links = element.getElementsByTagName("a");
  let linkTextLength = 0;
  for (let i = 0; i < links.length; i++) {
    linkTextLength += (links[i].textContent || "").length;
  }
  const linkDensity = textLength > 0 ? linkTextLength / textLength : 0;

  // 计算段落数量
  const paragraphs = element.querySelectorAll("p, div");
  const paragraphCount = paragraphs.length;

  // 文本密度 = 文本长度 / (标签数量 + 1)
  const density = textLength / (tagCount + 1);

  // 综合评分：文本密度 * 段落权重 * (1 - 链接密度)
  // 链接密度高的区域（如导航）会被降权
  const paragraphWeight = Math.min(paragraphCount / 10, 1); // 段落数量权重，最高为 1
  const linkPenalty = 1 - Math.min(linkDensity * 2, 0.8); // 链接密度惩罚，最多降权 80%

  return density * (1 + paragraphWeight) * linkPenalty;
}

/**
 * 使用文本密度算法提取核心内容区
 */
function extractMainContent(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // 首先尝试使用语义化标签
  const semanticSelectors = [
    "article",
    '[role="main"]',
    "main",
    ".article-content",
    ".post-content",
    ".entry-content",
    "#content",
  ];

  for (const selector of semanticSelectors) {
    const element = doc.querySelector(selector);
    if (element && element.textContent && element.textContent.length > 200) {
      // 找到语义化标签后，仍然使用文本密度算法在其内部找最佳区域
      const bestChild = findBestContentNode(element);
      if (bestChild) {
        return bestChild.innerHTML;
      }
      return element.innerHTML;
    }
  }

  // 如果没有找到语义化标签，使用文本密度算法在整个 body 中查找
  const bestNode = findBestContentNode(doc.body);
  if (bestNode) {
    return bestNode.innerHTML;
  }

  // 最后的备选方案
  return doc.body.innerHTML;
}

/**
 * 在给定节点内查找文本密度最高的子节点
 */
function findBestContentNode(root: Element): Element | null {
  let bestNode: Element | null = null;
  let bestScore = 0;

  // 候选节点：div, section, article
  const candidates = root.querySelectorAll("div, section, article");

  // 遍历所有候选节点
  candidates.forEach((element) => {
    // 跳过明显的非内容区域
    const className = element.className.toLowerCase();
    const id = element.id.toLowerCase();

    const excludePatterns = [
      "nav",
      "menu",
      "sidebar",
      "footer",
      "header",
      "comment",
      "ad",
      "advertisement",
      "social",
      "share",
      "related",
      "recommend",
      "popup",
      "modal",
      "dialog",
      "banner",
      "widget",
    ];

    const shouldExclude = excludePatterns.some(
      (pattern) => className.includes(pattern) || id.includes(pattern)
    );

    if (shouldExclude) return;

    // 计算文本密度分数
    const score = calculateTextDensity(element);

    // 更新最佳节点
    if (score > bestScore) {
      bestScore = score;
      bestNode = element;
    }
  });

  // 如果找到的最佳节点分数太低，返回根节点
  if (bestScore < 10) {
    return root;
  }

  return bestNode;
}

/**
 * 清洗 HTML 内容
 */
function cleanHtml(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // 移除不需要的元素
  const unwantedSelectors = [
    "script",
    "style",
    "iframe",
    "noscript",
    "nav",
    "header",
    "footer",
    "aside",
    ".advertisement",
    ".ads",
    ".social-share",
    ".comments",
    ".related-posts",
  ];

  unwantedSelectors.forEach((selector) => {
    doc.querySelectorAll(selector).forEach((el) => el.remove());
  });

  return doc.body.innerHTML;
}

/**
 * 清理 Markdown 内容中的噪音
 */
function cleanMarkdown(markdown: string): string {
  // 首先转义可能导致正则表达式错误的特殊字符序列
  // 这些字符在 GFM 自动链接处理中可能引发问题
  let cleaned = markdown
    // 转义反斜杠后跟特殊字符的组合
    .replace(/\\(?=[<>{}[\]()$^*+?.|])/g, "\\\\")
    // 移除可能导致正则表达式错误的 URL 片段
    .replace(/https?:\/\/[^\s]*?(?:\$\{[^}]*\}|%\{[^}]*\})/g, "[链接已移除]");

  // 移除常见的噪音模式
  const noisePatterns = [
    // 导航链接
    /\[.*?\]\(#.*?\)/g,
    // 跳转到内容链接
    /\[跳转到.*?\]\(.*?\)/gi,
    /\[Skip to.*?\]\(.*?\)/gi,
    // 社交分享按钮
    /\[分享\]\(.*?\)/gi,
    /\[Share\]\(.*?\)/gi,
    /\[Tweet\]\(.*?\)/gi,
    /\[Facebook\]\(.*?\)/gi,
    // 订阅提示
    /订阅.*?newsletter/gi,
    /Subscribe.*?newsletter/gi,
    // 版权声明（过短的）
    /^©.*?$/gm,
    /^Copyright.*?$/gm,
    // 广告标记
    /\[广告\]/gi,
    /\[Advertisement\]/gi,
    // 相关文章链接（单独成行的）
    /^相关.*?[:：].*$/gm,
    /^Related.*?:.*$/gm,
    // Cookie 提示
    /.*?cookies?.*?policy.*?/gi,
    // 登录/注册提示
    /^登录.*?$/gm,
    /^Sign in.*?$/gm,
    /^注册.*?$/gm,
    /^Sign up.*?$/gm,
  ];

  // 应用所有噪音模式
  noisePatterns.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, "");
  });

  // 移除多余的空行（3个以上连续换行符）
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  // 移除头部和尾部的空行
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * 智能清理段落数组的头尾噪音
 */
function cleanParagraphsNoise(paragraphs: Paragraph[]): Paragraph[] {
  if (paragraphs.length === 0) return paragraphs;

  // 定义噪音关键词
  const noiseKeywords = [
    // 导航相关
    "菜单",
    "menu",
    "导航",
    "navigation",
    "跳转",
    "skip",
    // 社交相关
    "分享",
    "share",
    "关注",
    "follow",
    "订阅",
    "subscribe",
    // 版权相关
    "版权",
    "copyright",
    "©",
    "保留所有权利",
    "all rights reserved",
    // 广告相关
    "广告",
    "advertisement",
    "sponsored",
    // 登录相关
    "登录",
    "sign in",
    "login",
    "注册",
    "sign up",
    "register",
    // Cookie 相关
    "cookie",
    "privacy policy",
    "隐私政策",
    // 页脚相关
    "footer",
    "页脚",
    "联系我们",
    "contact us",
  ];

  // 检查段落是否包含噪音
  const isNoiseParagraph = (para: Paragraph): boolean => {
    let text = "";

    if ("text" in para && para.text) {
      text = para.text.toLowerCase();
    } else if ("items" in para && para.items) {
      text = para.items.join(" ").toLowerCase();
    }

    // 如果段落太短（少于10个字符），可能是噪音
    if (text.length < 10) return true;

    // 检查是否包含噪音关键词
    return noiseKeywords.some((keyword) =>
      text.includes(keyword.toLowerCase())
    );
  };

  // 从头部移除噪音段落（最多移除前5个）
  let startIndex = 0;
  for (let i = 0; i < Math.min(5, paragraphs.length); i++) {
    if (isNoiseParagraph(paragraphs[i])) {
      startIndex = i + 1;
    } else {
      break;
    }
  }

  // 从尾部移除噪音段落（最多移除后5个）
  let endIndex = paragraphs.length;
  for (
    let i = paragraphs.length - 1;
    i >= Math.max(0, paragraphs.length - 5);
    i--
  ) {
    if (isNoiseParagraph(paragraphs[i])) {
      endIndex = i;
    } else {
      break;
    }
  }

  // 返回清理后的段落数组
  const cleaned = paragraphs.slice(startIndex, endIndex);

  // 重新分配 ID
  return cleaned.map((para, index) => ({
    ...para,
    id: `p${index + 1}`,
  }));
}

/**
 * 将 Markdown 转换为段落数组
 */
function markdownToParagraphs(markdown: string): Paragraph[] {
  // 先清理 Markdown 内容
  const cleanedMarkdown = cleanMarkdown(markdown);

  // 按双换行符分割段落
  const lines = cleanedMarkdown.split("\n\n").filter((line) => line.trim());

  const paragraphs: Paragraph[] = [];
  let paragraphId = 1;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // 检测段落类型
    if (trimmed.startsWith("#")) {
      // 标题
      const level = trimmed.match(/^#+/)?.[0].length || 1;
      const text = trimmed.replace(/^#+\s*/, "");
      paragraphs.push({
        id: `p${paragraphId++}`,
        type: "heading",
        level: Math.min(level, 3) as 1 | 2 | 3,
        text,
      });
    } else if (
      trimmed.startsWith("- ") ||
      trimmed.startsWith("* ") ||
      /^\d+\.\s/.test(trimmed)
    ) {
      // 列表项
      const items = trimmed
        .split("\n")
        .map((item) =>
          item
            .replace(/^[-*]\s*/, "")
            .replace(/^\d+\.\s*/, "")
            .trim()
        )
        .filter(Boolean);

      paragraphs.push({
        id: `p${paragraphId++}`,
        type: "list",
        items,
      });
    } else if (trimmed.startsWith("> ")) {
      // 引用
      const text = trimmed.replace(/^>\s*/gm, "");
      paragraphs.push({
        id: `p${paragraphId++}`,
        type: "quote",
        text,
      });
    } else {
      // 普通段落
      paragraphs.push({
        id: `p${paragraphId++}`,
        type: "paragraph",
        text: trimmed,
      });
    }
  }

  // 清理头尾噪音段落
  return cleanParagraphsNoise(paragraphs);
}

/**
 * 计算字数
 */
function countWords(paragraphs: Paragraph[]): number {
  let count = 0;

  for (const para of paragraphs) {
    if ("text" in para && para.text) {
      // 中文字符 + 英文单词
      const chineseChars = para.text.match(/[\u4e00-\u9fa5]/g)?.length || 0;
      const englishWords = para.text.match(/[a-zA-Z]+/g)?.length || 0;
      count += chineseChars + englishWords;
    } else if ("items" in para && para.items) {
      for (const item of para.items) {
        const chineseChars = item.match(/[\u4e00-\u9fa5]/g)?.length || 0;
        const englishWords = item.match(/[a-zA-Z]+/g)?.length || 0;
        count += chineseChars + englishWords;
      }
    }
  }

  return count;
}

/**
 * 计算阅读时间（分钟）
 */
function calculateReadingTime(wordCount: number): number {
  // 假设中文阅读速度：400字/分钟
  // 英文阅读速度：200词/分钟
  // 这里简化处理，统一按 350 字/分钟计算
  return Math.max(1, Math.ceil(wordCount / 350));
}

/**
 * 导入文章
 */
export async function importArticle(url: string): Promise<ImportedArticle> {
  try {
    // 使用 Puppeteer 服务器获取内容
    const html = await fetchArticleContent(url);

    console.log(`文章获取成功，内容长度: ${html.length}`);

    // 提取元数据
    const metadata = extractMetadata(html, url);

    // 提取主要内容
    const mainContent = extractMainContent(html);

    // 清洗 HTML
    const cleanedHtml = cleanHtml(mainContent);

    // 转换为 Markdown
    const markdown = turndownService.turndown(cleanedHtml);

    // 转换为段落数组
    const paragraphs = markdownToParagraphs(markdown);

    // 如果段落太少，提示内容可能不完整
    if (paragraphs.length < 3) {
      console.warn("提取的内容较少，可能不完整");
      throw new Error("提取的内容过少，请检查网址是否正确或尝试手动复制内容");
    }

    // 计算字数和阅读时间
    const wordCount = countWords(paragraphs);
    const readingTime = calculateReadingTime(wordCount);

    // 如果字数太少，也提示
    if (wordCount < 100) {
      console.warn("提取的字数较少");
      throw new Error("提取的内容过少，请检查网址是否正确或尝试手动复制内容");
    }

    return {
      title: metadata.title,
      author: metadata.author,
      source: metadata.source,
      content: paragraphs,
      word_count: wordCount,
      reading_time: readingTime,
    };
  } catch (error) {
    console.error("导入文章失败:", error);
    throw error instanceof Error
      ? error
      : new Error("导入文章失败，请检查链接是否正确");
  }
}
