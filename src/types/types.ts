// 数据库类型定义

export interface Article {
  id: number;
  title: string;
  author?: string | null;
  source?: string | null;
  word_count?: number | null;
  reading_time?: number | null;
  content: Paragraph[];
  created_at: string;
}

export type Paragraph = 
  | { id: string; type: 'paragraph'; text: string }
  | { id: string; type: 'heading'; level: 1 | 2 | 3; text: string }
  | { id: string; type: 'list'; items: string[] }
  | { id: string; type: 'quote'; text: string }
  | { id: string; text: string }; // 兼容旧格式

export interface Thought {
  id: number;
  article_id: number | null;
  content: string;
  source_text: string;
  paragraph_id: string;
  tags: string[];
  created_at: string;
}

// 前端状态类型
export interface TextSelection {
  text: string;
  paragraphId: string;
  range: Range | null;
}

export interface ThoughtWithPosition extends Thought {
  position?: { x: number; y: number };
}

// Profile 类型（用于 AuthContext）
export interface Profile {
  id: string;
  username?: string;
  email?: string;
  avatar_url?: string;
  created_at?: string;
}
