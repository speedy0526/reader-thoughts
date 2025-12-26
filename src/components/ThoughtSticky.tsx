import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ThoughtStickyProps {
  position: { x: number; y: number };
  initialContent?: string;
  sourceText: string;
  onSave: (content: string) => void;
  onClose: () => void;
  isEditing?: boolean;
}

export function ThoughtSticky({
  position,
  initialContent = '',
  sourceText,
  onSave,
  onClose,
  isEditing = false,
}: ThoughtStickyProps) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 自动聚焦
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC 关闭
      if (e.key === 'Escape') {
        handleSave();
      }
      // Ctrl+Enter 或 Ctrl+S 保存
      if ((e.ctrlKey || e.metaKey) && (e.key === 'Enter' || e.key === 's')) {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleSave();
      }
    };

    // 延迟添加监听器，避免立即触发
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [content]);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    
    // 只有内容不为空时才保存
    if (content.trim()) {
      await onSave(content.trim());
    }
    
    onClose();
  };

  // 智能定位：确保便签在视口内
  const getAdjustedPosition = () => {
    const isMobile = window.innerWidth < 768;
    const stickyWidth = isMobile ? window.innerWidth - 32 : 340; // 移动端留 16px 边距
    const stickyHeight = isMobile ? 280 : 300;
    const padding = isMobile ? 16 : 20;

    let x = position.x;
    let y = position.y;

    // 移动端居中显示
    if (isMobile) {
      x = 16;
      y = Math.max(padding, Math.min(y, window.innerHeight - stickyHeight - padding));
    } else {
      // 桌面端智能定位
      // 右边界检查
      if (x + stickyWidth > window.innerWidth - padding) {
        x = window.innerWidth - stickyWidth - padding;
      }

      // 左边界检查
      if (x < padding) {
        x = padding;
      }

      // 下边界检查
      if (y + stickyHeight > window.innerHeight - padding) {
        y = window.innerHeight - stickyHeight - padding;
      }

      // 上边界检查
      if (y < padding) {
        y = padding;
      }
    }

    return { x, y, width: stickyWidth };
  };

  const adjustedPosition = getAdjustedPosition();

  return (
    <div
      ref={containerRef}
      className="fixed z-50 glass-effect rounded-xl border border-border shadow-2xl animate-fade-in-scale"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
        width: `${adjustedPosition.width}px`,
      }}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground">
            {isEditing ? '编辑思考' : '记录思考'}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {sourceText.length > 30 ? `${sourceText.slice(0, 30)}...` : sourceText}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* 内容区 */}
      <div className="p-4">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="写下你的思考..."
          className="min-h-[160px] resize-none border-0 bg-transparent focus-visible:ring-0 text-sm"
        />
      </div>

      {/* 底部提示 */}
      <div className="px-4 py-3 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>自动保存</span>
          <span>ESC 或 ⌘+Enter 保存</span>
        </div>
      </div>
    </div>
  );
}
