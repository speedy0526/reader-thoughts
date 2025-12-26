import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ImportArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (url: string) => Promise<void>;
}

export function ImportArticleDialog({
  open,
  onOpenChange,
  onImport,
}: ImportArticleDialogProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImport = async () => {
    if (!url.trim()) {
      setError('请输入文章链接');
      return;
    }

    // 验证 URL 格式
    try {
      new URL(url);
    } catch {
      setError('请输入有效的链接地址');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await onImport(url);
      setUrl('');
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleImport();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>导入文章</DialogTitle>
          <DialogDescription>
            输入文章链接，系统将自动获取内容并保存
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="h-11"
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              onClick={handleImport}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  导入中...
                </>
              ) : (
                '导入'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
