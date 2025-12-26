import { supabase } from "./supabase";
import type { Article, Thought } from "@/types/types";

// 文章相关 API
export const articlesApi = {
  // 获取文章列表
  async getArticles(): Promise<Article[]> {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  // 获取单篇文章
  async getArticle(id: number): Promise<Article | null> {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // 创建文章
  async createArticle(
    article: Omit<Article, "id" | "created_at">
  ): Promise<Article | null> {
    const { data, error } = await supabase
      .from("articles")
      .insert(article)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // 删除文章
  async deleteArticle(id: number): Promise<void> {
    const { error } = await supabase.from("articles").delete().eq("id", id);

    if (error) throw error;
  },

  // 批量删除文章
  async deleteArticles(ids: number[]): Promise<void> {
    const { error } = await supabase.from("articles").delete().in("id", ids);

    if (error) throw error;
  },
};

// 思考相关 API
export const thoughtsApi = {
  // 创建思考
  async createThought(
    thought: Omit<Thought, "id" | "created_at">
  ): Promise<Thought | null> {
    const { data, error } = await supabase
      .from("thoughts")
      .insert(thought)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // 更新思考
  async updateThought(id: number, content: string): Promise<Thought | null> {
    const { data, error } = await supabase
      .from("thoughts")
      .update({ content })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // 删除思考
  async deleteThought(id: number): Promise<void> {
    const { error } = await supabase.from("thoughts").delete().eq("id", id);

    if (error) throw error;
  },

  // 获取文章的所有思考
  async getThoughtsByArticle(articleId: number): Promise<Thought[]> {
    const { data, error } = await supabase
      .from("thoughts")
      .select("*")
      .eq("article_id", articleId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  // 获取段落的思考
  async getThoughtsByParagraph(paragraphId: string): Promise<Thought[]> {
    const { data, error } = await supabase
      .from("thoughts")
      .select("*")
      .eq("paragraph_id", paragraphId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },
};
