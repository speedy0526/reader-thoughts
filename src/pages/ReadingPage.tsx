import { useEffect, useState, useRef } from 'react';
import { Moon, Sun, BookOpen, Clock, FileText } from 'lucide-react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ThoughtSticky } from '@/components/ThoughtSticky';
import { ThoughtPreview } from '@/components/ThoughtPreview';
import { ThoughtNetwork } from '@/components/ThoughtNetwork';
import { NetworkEntryButton } from '@/components/NetworkEntryButton';
import { articlesApi, thoughtsApi } from '@/db/api';
import type { Article, Thought, TextSelection, Paragraph } from '@/types/types';
import { useToast } from '@/hooks/use-toast';

/**
 * 安全清理 Markdown 文本，防止 GFM 自动链接处理时的正则表达式错误
 */
function sanitizeMarkdownForGfm(text: string): string {
  if (!text) return '';
  
  return text
    // 移除或转义可能导致正则表达式错误的 URL 模式
    .replace(/https?:\/\/[^\s]*?(?:\$\{[^}]*\}|%\{[^}]*\}|<[^>]*>)/g, '[链接]')
    // 转义可能导致问题的特殊字符组合
    .replace(/\\\$/g, '\\\\$')
    .replace(/\\%/g, '\\\\%')
    // 移除可能导致问题的命名捕获组模式
    .replace(/\(\?<[^>]*>/g, '(')
    // 移除其他可能导致正则表达式错误的模式
    .replace(/\(\?[!=]/g, '(');
}

export default function ReadingPage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // 交互状态
  const [currentSelection, setCurrentSelection] = useState<TextSelection | null>(null);
  const [showSticky, setShowSticky] = useState(false);
  const [stickyPosition, setStickyPosition] = useState({ x: 0, y: 0 });
  const [editingThought, setEditingThought] = useState<Thought | null>(null);
  
  // 预览状态
  const [previewThought, setPreviewThought] = useState<Thought | null>(null);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  
  // 网络视图状态
  const [showNetwork, setShowNetwork] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // 加载文章和思考
  useEffect(() => {
    loadArticleAndThoughts();
  }, [id]);

  const loadArticleAndThoughts = async () => {
    try {
      setLoading(true);
      
      if (id) {
        // 加载指定文章
        const articleData = await articlesApi.getArticle(Number(id));
        if (articleData) {
          setArticle(articleData);
          const articleThoughts = await thoughtsApi.getThoughtsByArticle(articleData.id);
          setThoughts(articleThoughts);
        }
      } else {
        // 加载第一篇文章（默认行为）
        const articles = await articlesApi.getArticles();
        if (articles.length > 0) {
          const firstArticle = articles[0];
          setArticle(firstArticle);
          const articleThoughts = await thoughtsApi.getThoughtsByArticle(firstArticle.id);
          setThoughts(articleThoughts);
        }
      }
    } catch (error) {
      console.error('加载失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载文章内容',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 文本选择处理
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      const selectedText = selection.toString().trim();
      if (selectedText.length < 3) return;

      // 检查选择是否在文章内容区域
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const paragraph = (container.nodeType === Node.TEXT_NODE 
        ? container.parentElement 
        : container) as HTMLElement;
      
      const paragraphElement = paragraph.closest('[data-paragraph-id]') as HTMLElement;
      if (!paragraphElement) return;

      const paragraphId = paragraphElement.getAttribute('data-paragraph-id');
      if (!paragraphId) return;

      // 检查是否已有思考
      const existingThought = thoughts.find(
        t => t.paragraph_id === paragraphId && t.source_text === selectedText
      );
      
      if (existingThought) {
        // 显示编辑界面
        setEditingThought(existingThought);
        setCurrentSelection({ text: selectedText, paragraphId, range });
      } else {
        // 显示新建界面
        setCurrentSelection({ text: selectedText, paragraphId, range });
      }

      // 获取选择位置
      const rect = range.getBoundingClientRect();
      setStickyPosition({
        x: rect.left + rect.width / 2 - 170, // 居中显示
        y: rect.bottom + 10,
      });

      // 移动端延迟显示，避免与系统选择菜单冲突
      const isMobile = window.innerWidth < 768;
      setTimeout(() => {
        setShowSticky(true);
      }, isMobile ? 300 : 0);
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('touchend', handleSelection);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('touchend', handleSelection);
    };
  }, [thoughts]);

  // 保存思考
  const handleSaveThought = async (content: string) => {
    if (!currentSelection || !article) return;

    try {
      if (editingThought) {
        // 更新现有思考
        await thoughtsApi.updateThought(editingThought.id, content);
        setThoughts(prev =>
          prev.map(t => (t.id === editingThought.id ? { ...t, content } : t))
        );
        toast({
          title: '更新成功',
          description: '思考已更新',
        });
      } else {
        // 创建新思考
        const newThought = await thoughtsApi.createThought({
          article_id: article.id,
          content,
          source_text: currentSelection.text,
          paragraph_id: currentSelection.paragraphId,
          tags: [],
        });
        
        if (newThought) {
          setThoughts(prev => [newThought, ...prev]);
          toast({
            title: '保存成功',
            description: '思考已记录',
          });
        }
      }

      // 清除选择
      window.getSelection()?.removeAllRanges();
    } catch (error) {
      console.error('保存失败:', error);
      toast({
        title: '保存失败',
        description: '无法保存思考',
        variant: 'destructive',
      });
    }
  };

  // 关闭便签
  const handleCloseSticky = () => {
    setShowSticky(false);
    setCurrentSelection(null);
    setEditingThought(null);
    window.getSelection()?.removeAllRanges();
  };

  // 删除思考
  const handleDeleteThought = async (id: number) => {
    try {
      await thoughtsApi.deleteThought(id);
      setThoughts(prev => prev.filter(t => t.id !== id));
      toast({
        title: '删除成功',
        description: '思考已删除',
      });
    } catch (error) {
      console.error('删除失败:', error);
      toast({
        title: '删除失败',
        description: '无法删除思考',
        variant: 'destructive',
      });
    }
  };

  // 定位到思考位置
  const handleThoughtClick = (thought: Thought) => {
    setShowNetwork(false);
    
    // 滚动到对应段落
    const paragraph = document.querySelector(`[data-paragraph-id="${thought.paragraph_id}"]`);
    if (paragraph) {
      paragraph.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // 高亮显示
      paragraph.classList.add('text-highlight');
      setTimeout(() => {
        paragraph.classList.remove('text-highlight');
      }, 2000);
    }
  };

  // 渲染段落（带思考标记）
  const renderParagraph = (paragraph: Paragraph) => {
    // 获取段落文本（兼容不同类型）
    const getText = (): string => {
      if ('text' in paragraph) return paragraph.text;
      if ('items' in paragraph) return paragraph.items.join('\n');
      return '';
    };

    const paragraphText = getText();
    const paragraphThoughts = thoughts.filter(t => t.paragraph_id === paragraph.id);
    
    // 渲染 Markdown 内容（带思考标记）
    const renderMarkdownWithThoughts = (text: string) => {
      if (paragraphThoughts.length === 0) {
        // 没有思考标记，直接渲染 Markdown
        return (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // 自定义渲染组件
              p: ({ children }) => <span>{children}</span>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              a: ({ href, children }) => (
                <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
              img: ({ src, alt }) => (
                <img src={src} alt={alt} className="max-w-full h-auto rounded-lg my-4" loading="lazy" />
              ),
            }}
          >
            {sanitizeMarkdownForGfm(text)}
          </ReactMarkdown>
        );
      }

      // 有思考标记，需要分割文本
      let remainingText = text;
      const parts: React.ReactNode[] = [];
      let partIndex = 0;

      paragraphThoughts.forEach(thought => {
        const index = remainingText.indexOf(thought.source_text);
        if (index !== -1) {
          // 添加前面的普通文本（Markdown 渲染）
          if (index > 0) {
            const beforeText = remainingText.slice(0, index);
            parts.push(
              <ReactMarkdown
                key={`text-${partIndex++}`}
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <span>{children}</span>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  a: ({ href, children }) => (
                    <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {sanitizeMarkdownForGfm(beforeText)}
              </ReactMarkdown>
            );
          }

          // 添加带思考标记的文本
          parts.push(
            <span
              key={`thought-${thought.id}`}
              className="thought-underline"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setPreviewPosition({ x: rect.left, y: rect.bottom });
                setPreviewThought(thought);
              }}
              onMouseLeave={() => {
                setPreviewThought(null);
              }}
              onClick={(e) => {
                e.stopPropagation();
                setEditingThought(thought);
                setCurrentSelection({
                  text: thought.source_text,
                  paragraphId: thought.paragraph_id,
                  range: null,
                });
                const rect = e.currentTarget.getBoundingClientRect();
                setStickyPosition({ x: rect.left, y: rect.bottom + 10 });
                setShowSticky(true);
              }}
            >
              {thought.source_text}
            </span>
          );

          remainingText = remainingText.slice(index + thought.source_text.length);
        }
      });

      // 添加剩余文本（Markdown 渲染）
      if (remainingText) {
        parts.push(
          <ReactMarkdown
            key={`text-${partIndex++}`}
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <span>{children}</span>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              a: ({ href, children }) => (
                <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {sanitizeMarkdownForGfm(remainingText)}
          </ReactMarkdown>
        );
      }

      return parts.length > 0 ? parts : text;
    };

    // 根据段落类型渲染
    if ('type' in paragraph) {
      switch (paragraph.type) {
        case 'heading':
          const HeadingTag = `h${paragraph.level}` as 'h1' | 'h2' | 'h3';
          return (
            <HeadingTag 
              key={paragraph.id} 
              data-paragraph-id={paragraph.id}
              className="font-semibold mt-8 mb-4"
            >
              {renderMarkdownWithThoughts(paragraph.text)}
            </HeadingTag>
          );
        
        case 'list':
          return (
            <ul key={paragraph.id} data-paragraph-id={paragraph.id} className="list-disc pl-6 space-y-2">
              {paragraph.items.map((item, index) => (
                <li key={`${paragraph.id}-${index}`}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <span>{children}</span>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                    }}
                  >
                    {sanitizeMarkdownForGfm(item)}
                  </ReactMarkdown>
                </li>
              ))}
            </ul>
          );
        
        case 'quote':
          return (
            <blockquote 
              key={paragraph.id} 
              data-paragraph-id={paragraph.id}
              className="border-l-4 border-muted pl-4 italic text-muted-foreground"
            >
              {renderMarkdownWithThoughts(paragraph.text)}
            </blockquote>
          );
        
        case 'paragraph':
        default:
          return (
            <p key={paragraph.id} data-paragraph-id={paragraph.id}>
              {renderMarkdownWithThoughts(paragraph.text)}
            </p>
          );
      }
    }

    // 兼容旧格式（只有 id 和 text）
    return (
      <p key={paragraph.id} data-paragraph-id={paragraph.id}>
        {renderMarkdownWithThoughts(paragraphText)}
      </p>
    );
  };

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+N 切换网络视图
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        setShowNetwork(prev => !prev);
      }
      
      // Ctrl+D 切换夜间模式
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        setIsDarkMode(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 应用夜间模式
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">未找到文章</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 xl:pb-32 overflow-x-hidden">
      {/* 主容器 - 居中显示，桌面端最大宽度70%，移动端92% */}
      <div className="max-w-[92vw] xl:max-w-[70vw] mx-auto px-4 xl:px-8 pt-8 xl:pt-24">
        {/* 头部工具栏 - 极简 */}
        <div className="flex justify-end mb-8 xl:mb-16">

        </div>

        {/* 文章头部 - 响应式 */}
        <header className="mb-12 xl:mb-16">
          <h1 className="text-3xl xl:text-5xl font-semibold leading-[1.15] xl:leading-[1.1] tracking-tight mb-6 xl:mb-8">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-3 xl:gap-4 text-xs text-muted-foreground/60 tracking-wide uppercase">
            {article.source && (
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                {article.source}
              </span>
            )}
            {article.word_count && <span>·</span>}
            {article.word_count && (
              <span className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                {article.word_count} 字
              </span>
            )}
            {article.reading_time && <span>·</span>}
            {article.reading_time && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {article.reading_time} 分钟
              </span>
            )}
          </div>
        </header>

        {/* 文章内容 - 响应式排版 */}
        <article
          ref={contentRef}
          className="space-y-5 xl:space-y-6 text-base xl:text-lg leading-[1.75] xl:leading-[1.8] tracking-[-0.01em]"
        >
          {article.content.map(paragraph => renderParagraph(paragraph))}
        </article>
      </div>
      {/* 思考输入便签 */}
      {showSticky && currentSelection && (
        <ThoughtSticky
          position={stickyPosition}
          initialContent={editingThought?.content}
          sourceText={currentSelection.text}
          onSave={handleSaveThought}
          onClose={handleCloseSticky}
          isEditing={!!editingThought}
        />
      )}
      {/* 思考预览 */}
      {previewThought && !showSticky && (
        <ThoughtPreview
          thought={previewThought}
          position={previewPosition}
          onClose={() => setPreviewThought(null)}
        />
      )}
      {/* 思维网络视图 */}
      {showNetwork && (
        <ThoughtNetwork
          thoughts={thoughts}
          onClose={() => setShowNetwork(false)}
          onThoughtClick={handleThoughtClick}
          onDeleteThought={handleDeleteThought}
        />
      )}
      {/* 网络入口按钮 */}
      <NetworkEntryButton
        thoughtCount={thoughts.length}
        onClick={() => setShowNetwork(true)}
      />
      {/* 移动端触摸防护层 */}
      {showSticky && (
        <div className="fixed inset-0 z-40 xl:hidden" />
      )}
    </div>
  );
}
