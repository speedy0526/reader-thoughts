import { Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NetworkEntryButtonProps {
  thoughtCount: number;
  onClick: () => void;
}

export function NetworkEntryButton({ thoughtCount, onClick }: NetworkEntryButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-30">
      <Button
        onClick={onClick}
        className="h-14 w-14 xl:h-16 xl:w-16 rounded-full glass-effect shadow-2xl border border-border hover:scale-110 hover:rotate-12 hover:shadow-[0_20px_60px_rgba(0,122,255,0.3)] transition-all duration-300"
        size="icon"
      >
        <Brain className="h-6 w-6 xl:h-7 xl:w-7 text-primary" />
        
        {/* 徽章 */}
        {thoughtCount > 0 && (
          <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold flex items-center justify-center shadow-lg">
            {thoughtCount > 99 ? '99+' : thoughtCount}
          </span>
        )}
      </Button>
    </div>
  );
}
