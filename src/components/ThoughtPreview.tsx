import { useEffect, useRef, useState } from 'react';
import type { Thought } from '@/types/types';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ThoughtPreviewProps {
  thought: Thought;
  position: { x: number; y: number };
  onClose: () => void;
}

export function ThoughtPreview({ thought, position, onClose }: ThoughtPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 延迟显示，避免闪烁
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // 智能定位
  const getAdjustedPosition = () => {
    const isMobile = window.innerWidth < 768;
    const previewWidth = isMobile ? window.innerWidth - 32 : 320;
    const previewHeight = 200;
    const padding = isMobile ? 16 : 20;

    let x = position.x;
    let y = position.y + 30; // 在光标下方显示

    // 移动端居中显示
    if (isMobile) {
      x = 16;
    } else {
      if (x + previewWidth > window.innerWidth - padding) {
        x = window.innerWidth - previewWidth - padding;
      }

      if (x < padding) {
        x = padding;
      }
    }

    if (y + previewHeight > window.innerHeight - padding) {
      y = position.y - previewHeight - 10; // 在光标上方显示
    }

    if (y < padding) {
      y = padding;
    }

    return { x, y, width: previewWidth };
  };

  const adjustedPosition = getAdjustedPosition();

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed z-40 glass-effect rounded-xl border border-border shadow-xl animate-fade-in-scale"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
        width: `${adjustedPosition.width}px`,
      }}
    >
      <div className="p-4">
        {/* 思考内容 */}
        <div className="text-sm text-foreground leading-relaxed mb-3">
          {thought.content}
        </div>

        {/* 来源信息 */}
        <div className="pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground mb-1">
            原文：{thought.source_text.length > 50 
              ? `${thought.source_text.slice(0, 50)}...` 
              : thought.source_text}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(thought.created_at), {
              addSuffix: true,
              locale: zhCN,
            })}
          </div>
        </div>
      </div>

      {/* 操作提示 */}
      <div className="px-4 py-2 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          点击波浪线编辑思考
        </p>
      </div>
    </div>
  );
}
