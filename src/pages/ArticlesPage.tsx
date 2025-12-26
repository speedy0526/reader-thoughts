import { useState, useEffect } from "react";
import {
  Plus,
  List,
  Grid3x3,
  Search,
  Trash2,
  Eye,
  Download,
  Menu,
  BookOpen,
  FileText,
  Clock,
  Edit3,
  Check,
  Folder,
  X,
} from "lucide-react";
import { articlesApi } from "@/db/api";
import type { Article } from "@/types/types";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { ImportArticleDialog } from "@/components/ImportArticleDialog";
import { importArticle } from "@/services/articleImporter";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

type ViewMode = "list" | "grid";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState<Set<number>>(
    new Set()
  );
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [categories, setCategories] = useState<string[]>([
    "工作",
    "学习",
    "生活",
  ]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  // 加载文章列表
  useEffect(() => {
    loadArticles();
  }, []);

  // 搜索过滤
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.author?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredArticles(filtered);
    } else {
      setFilteredArticles(articles);
    }
  }, [searchQuery, articles]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await articlesApi.getArticles();
      setArticles(data);
      setFilteredArticles(data);
    } catch (error) {
      console.error("加载文章失败:", error);
      toast({
        title: "加载失败",
        description: "无法加载文章列表",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedArticles.size === 0) return;

    try {
      await articlesApi.deleteArticles(Array.from(selectedArticles));
      toast({
        title: "删除成功",
        description: `已删除 ${selectedArticles.size} 篇文章`,
      });
      setSelectedArticles(new Set());
      setIsEditMode(false);
      loadArticles();
    } catch (error) {
      console.error("删除失败:", error);
      toast({
        title: "删除失败",
        description: "无法删除文章",
        variant: "destructive",
      });
    }
  };

  const handleImportArticle = async (url: string) => {
    try {
      // 导入文章
      const importedArticle = await importArticle(url);

      // 保存到数据库
      const savedArticle = await articlesApi.createArticle(importedArticle);

      if (savedArticle) {
        toast({
          title: "导入成功",
          description: `已成功导入文章《${savedArticle.title}》`,
        });
        loadArticles();
      }
    } catch (error) {
      console.error("导入失败:", error);
      throw error; // 重新抛出错误，让对话框显示
    }
  };

  // 添加分类
  const handleAddCategory = () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      toast({
        title: "请输入分类名称",
        variant: "destructive",
      });
      return;
    }

    if (categories.includes(trimmedName)) {
      toast({
        title: "分类已存在",
        variant: "destructive",
      });
      return;
    }

    setCategories([...categories, trimmedName]);
    setNewCategoryName("");
    setIsAddingCategory(false);
    toast({
      title: "添加成功",
      description: `已添加分类"${trimmedName}"`,
    });
  };

  // 删除分类
  const handleDeleteCategory = (category: string) => {
    setCategories(categories.filter((c) => c !== category));
    if (selectedCategory === category) {
      setSelectedCategory(null);
    }
    toast({
      title: "删除成功",
      description: `已删除分类"${category}"`,
    });
  };

  // 侧边栏内容组件
  const SidebarContent = () => (
    <div className="p-4 xl:p-6">
      {/* 导入按钮 */}
      <button
        onClick={() => setShowImportDialog(true)}
        className="w-full h-10 rounded-lg bg-foreground text-background flex items-center justify-center gap-2 text-sm font-medium hover:opacity-90 transition-opacity mb-6 xl:mb-8"
      >
        <Download className="h-4 w-4" />
        导入文章
      </button>

      {/* 导航列表 */}
      <nav className="space-y-1 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors ${
            selectedCategory === null
              ? "bg-muted text-foreground"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          所有文章
        </button>
        <button className="w-full px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground text-sm font-medium text-left transition-colors">
          最近阅读
        </button>
      </nav>

      {/* 分类管理 - Apple Freeform 风格 */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            文件夹
          </h3>
          <button
            onClick={() => setIsAddingCategory(true)}
            className="h-5 w-5 rounded-md hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
            title="新建文件夹"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 添加分类输入框 */}
        {isAddingCategory && (
          <div className="mb-1.5 px-1">
            <div className="flex items-center gap-1.5 bg-muted/30 rounded-lg px-2.5 py-1.5 border border-border/50">
              <Folder className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddCategory();
                  } else if (e.key === "Escape") {
                    setIsAddingCategory(false);
                    setNewCategoryName("");
                  }
                }}
                placeholder="新建文件夹"
                className="flex-1 text-sm bg-transparent border-none focus:outline-none placeholder:text-muted-foreground/50"
                autoFocus
              />
              <button
                onClick={handleAddCategory}
                className="h-5 w-5 rounded flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategoryName("");
                }}
                className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 分类列表 */}
        <nav className="space-y-0.5">
          {categories.map((category) => (
            <div key={category} className="group relative">
              <button
                onClick={() => setSelectedCategory(category)}
                className={`w-full px-2.5 py-1.5 rounded-lg text-sm font-medium text-left transition-all flex items-center gap-2 ${
                  selectedCategory === category
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted/50 text-foreground/80 hover:text-foreground"
                }`}
              >
                <Folder
                  className={`h-3.5 w-3.5 flex-shrink-0 ${
                    selectedCategory === category
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                />
                <span className="truncate">{category}</span>
              </button>
              <button
                onClick={() => handleDeleteCategory(category)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                title="删除文件夹"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );

  const toggleArticleSelection = (id: number) => {
    const newSelected = new Set(selectedArticles);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedArticles(newSelected);
  };

  const handleReadArticle = (id: number) => {
    navigate(`/read/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-foreground border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex overflow-x-hidden">
      {/* 桌面端左侧导航栏 */}
      <aside className="hidden xl:block w-56 border-r border-border flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* 右侧主内容区 */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* 顶部工具栏 */}
        <div className="h-14 xl:h-16 border-b border-border flex items-center justify-between px-4 xl:px-6 flex-shrink-0 gap-2">
          <div className="flex items-center gap-2 xl:gap-3 min-w-0">
            {/* 移动端菜单按钮 */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="xl:hidden h-9 w-9 flex-shrink-0"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            {/* 编辑按钮 */}
            <button
              onClick={() => {
                setIsEditMode(!isEditMode);
                setSelectedArticles(new Set());
              }}
              className={`h-8 xl:h-9 w-8 xl:w-9 hidden rounded-lg text-xs xl:text-sm font-medium transition-colors flex-shrink-0 flex items-center justify-center ${
                isEditMode
                  ? "bg-foreground text-background"
                  : "hover:bg-muted text-foreground"
              }`}
              title={isEditMode ? "完成" : "编辑"}
            >
              {isEditMode ? (
                <Check className="h-4 w-4" />
              ) : (
                <Edit3 className="h-4 w-4" />
              )}
            </button>

            {/* 删除按钮（编辑模式下显示） */}
            {isEditMode && selectedArticles.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="h-8 xl:h-9 px-3 xl:px-4 rounded-lg hover:bg-destructive/10 text-destructive text-xs xl:text-sm font-medium transition-colors flex items-center gap-1.5 xl:gap-2 flex-shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5 xl:h-4 xl:w-4" />
                <span className="hidden sm:inline">删除</span> (
                {selectedArticles.size})
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 xl:gap-3 min-w-0 flex-shrink">
            {/* 视图切换 */}
            <div className="hidden sm:flex items-center gap-1 bg-muted rounded-lg p-1 flex-shrink-0">
              <button
                onClick={() => setViewMode("list")}
                className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${
                  viewMode === "list"
                    ? "bg-background shadow-sm"
                    : "hover:bg-background/50"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${
                  viewMode === "grid"
                    ? "bg-background shadow-sm"
                    : "hover:bg-background/50"
                }`}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
            </div>

            {/* 搜索框 */}
            <div className="relative flex-shrink min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="搜索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full min-w-[120px] sm:w-48 xl:w-64 pl-9 pr-3 rounded-lg bg-muted border-0 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-foreground/20"
              />
            </div>
          </div>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-auto p-4 xl:p-6">
          {filteredArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-muted-foreground text-base mb-2">
                {searchQuery ? "未找到匹配的文章" : "还没有文章"}
              </p>
              <p className="text-muted-foreground/60 text-sm">
                {searchQuery ? "尝试其他搜索词" : '点击"新建文章"开始创作'}
              </p>
            </div>
          ) : viewMode === "list" ? (
            // 列表视图
            <div className="space-y-2">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className={`group relative flex items-center bg-white gap-3 xl:gap-4 p-3 xl:p-4 rounded-xl border border-border/50 hover:border-foreground/20 transition-all cursor-pointer ${
                    selectedArticles.has(article.id)
                      ? "bg-muted/50"
                      : "hover:bg-muted/30"
                  }`}
                  onClick={() => {
                    if (isEditMode) {
                      toggleArticleSelection(article.id);
                    } else {
                      handleReadArticle(article.id);
                    }
                  }}
                >
                  {/* 选择框（编辑模式） */}
                  {isEditMode && (
                    <div
                      className={`h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        selectedArticles.has(article.id)
                          ? "bg-foreground border-foreground"
                          : "border-border"
                      }`}
                    >
                      {selectedArticles.has(article.id) && (
                        <div className="h-2 w-2 bg-background rounded-sm" />
                      )}
                    </div>
                  )}

                  {/* 文章信息 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm xl:text-base font-medium truncate mb-1">
                      {article.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 xl:gap-3 text-xs text-muted-foreground/60">
                      {article.source && (
                        <span className="flex items-center gap-1 truncate max-w-[120px]">
                          <BookOpen className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{article.source}</span>
                        </span>
                      )}
                      {article.word_count && (
                        <>
                          {article.source && (
                            <span className="hidden sm:inline">·</span>
                          )}
                          <span className="flex items-center gap-1 hidden sm:flex">
                            <FileText className="h-3 w-3 flex-shrink-0" />
                            <span>{article.word_count} 字</span>
                          </span>
                        </>
                      )}
                      <span className="hidden sm:inline">·</span>
                      <span className="flex items-center gap-1 truncate">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {formatDistanceToNow(new Date(article.created_at), {
                            addSuffix: true,
                            locale: zhCN,
                          })}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* 操作按钮（非编辑模式） */}
                  {!isEditMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReadArticle(article.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center flex-shrink-0 transition-all"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // 卡片视图
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 xl:gap-4">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className={`group relative p-4 xl:p-6 bg-white rounded-2xl border border-border/50 hover:border-foreground/20 transition-all cursor-pointer ${
                    selectedArticles.has(article.id)
                      ? "bg-muted/50"
                      : "hover:bg-muted/30"
                  }`}
                  onClick={() => {
                    if (isEditMode) {
                      toggleArticleSelection(article.id);
                    } else {
                      handleReadArticle(article.id);
                    }
                  }}
                >
                  {/* 选择框（编辑模式） */}
                  {isEditMode && (
                    <div
                      className={`absolute top-3 right-3 xl:top-4 xl:right-4 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedArticles.has(article.id)
                          ? "bg-foreground border-foreground"
                          : "border-border"
                      }`}
                    >
                      {selectedArticles.has(article.id) && (
                        <div className="h-2 w-2 bg-background rounded-sm" />
                      )}
                    </div>
                  )}

                  {/* 文章信息 */}
                  <h3 className="text-base xl:text-lg font-medium mb-2 xl:mb-3 line-clamp-2 pr-8">
                    {article.title}
                  </h3>
                  <div className="space-y-1.5 xl:space-y-2 text-xs text-muted-foreground/60">
                    {article.source && (
                      <p className="flex items-center gap-1.5 truncate">
                        <BookOpen className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{article.source}</span>
                      </p>
                    )}
                    {article.word_count && (
                      <p className="flex items-center gap-1.5">
                        <FileText className="h-3 w-3 flex-shrink-0" />
                        <span>{article.word_count} 字</span>
                      </p>
                    )}
                    <p className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span>
                        {formatDistanceToNow(new Date(article.created_at), {
                          addSuffix: true,
                          locale: zhCN,
                        })}
                      </span>
                    </p>
                  </div>

                  {/* 操作按钮（非编辑模式） */}
                  {!isEditMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReadArticle(article.id);
                      }}
                      className="absolute bottom-3 right-3 xl:bottom-4 xl:right-4 opacity-0 group-hover:opacity-100 h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-all"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 导入文章对话框 */}
      <ImportArticleDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={handleImportArticle}
      />
    </div>
  );
}
