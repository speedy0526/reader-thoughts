import { useEffect, useRef } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Thought } from '@/types/types';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ThoughtNetworkProps {
  thoughts: Thought[];
  onClose: () => void;
  onThoughtClick: (thought: Thought) => void;
  onDeleteThought: (id: number) => void;
}

export function ThoughtNetwork({
  thoughts,
  onClose,
  onThoughtClick,
  onDeleteThought,
}: ThoughtNetworkProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // ESC 关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 点击背景关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 glass-effect flex items-center justify-center p-4 xl:p-6 animate-fade-in-scale"
      onClick={handleBackdropClick}
    >
      <div
        ref={containerRef}
        className="w-full max-w-4xl max-h-[90vh] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden"
      >
        {/* 头部 */}
        <div className="px-4 xl:px-6 py-4 xl:py-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl xl:text-2xl font-bold gradient-text">
                思考的脉络
              </h2>
              <p className="text-xs xl:text-sm text-muted-foreground mt-1">
                共 {thoughts.length} 条思考记录
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 xl:h-10 xl:w-10"
            >
              <X className="h-4 w-4 xl:h-5 xl:w-5" />
            </Button>
          </div>
        </div>

        {/* 思考列表 */}
        <ScrollArea className="h-[calc(90vh-100px)] xl:h-[calc(90vh-120px)]">
          <div className="p-4 xl:p-6">
            {thoughts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">
                  还没有思考记录
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  选择文本开始记录你的思考
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {thoughts.map((thought) => (
                  <div
                    key={thought.id}
                    className="group relative bg-muted/30 rounded-xl p-4 border border-border hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    onClick={() => onThoughtClick(thought)}
                  >
                    {/* 删除按钮 */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteThought(thought.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>

                    {/* 思考内容 */}
                    <div className="text-sm text-foreground leading-relaxed mb-3 pr-8">
                      {thought.content}
                    </div>

                    {/* 原文引用 */}
                    <div className="text-xs text-muted-foreground mb-2 italic border-l-2 border-primary pl-2">
                      {thought.source_text.length > 80
                        ? `${thought.source_text.slice(0, 80)}...`
                        : thought.source_text}
                    </div>

                    {/* 时间 */}
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(thought.created_at), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* 底部提示 */}
        <div className="px-4 xl:px-6 py-3 xl:py-4 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            点击卡片可定位到原文 · 按 ESC 或点击空白处关闭
          </p>
        </div>
      </div>
    </div>
  );
}
