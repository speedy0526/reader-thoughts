-- 创建文章表
CREATE TABLE articles (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  source TEXT,
  word_count INTEGER,
  reading_time INTEGER,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建思考记录表
CREATE TABLE thoughts (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT REFERENCES articles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  source_text TEXT NOT NULL,
  paragraph_id TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_thoughts_article_id ON thoughts(article_id);
CREATE INDEX idx_thoughts_paragraph_id ON thoughts(paragraph_id);
CREATE INDEX idx_thoughts_created_at ON thoughts(created_at DESC);

-- 插入示例文章
INSERT INTO articles (title, author, source, word_count, reading_time, content) VALUES (
  '深度思考的力量',
  '认知科学研究院',
  '思维研究期刊',
  2800,
  12,
  '[
    {"id": "p1", "text": "在这个信息爆炸的时代，我们每天都会接触到海量的信息。社交媒体、新闻推送、即时通讯，各种信息源源不断地涌入我们的视野。然而，真正能够转化为知识和智慧的信息却少之又少。问题的关键在于，我们缺少了一个重要的环节——深度思考。"},
    {"id": "p2", "text": "深度思考不仅仅是简单地阅读和记忆信息，而是要在信息与信息之间建立联系，形成自己的知识网络。就像神经元之间的突触连接一样，每一个新的思考都可能与已有的知识产生化学反应，创造出新的见解。"},
    {"id": "p3", "text": "研究表明，人类大脑具有惊人的可塑性。当我们主动思考和记录自己的想法时，大脑会形成新的神经通路，强化相关的记忆连接。这个过程不是被动的信息接收，而是主动的知识建构。"},
    {"id": "p4", "text": "许多伟大的思想家都有记录思考的习惯。达芬奇的笔记本记录了他对艺术、科学、工程的思考；爱因斯坦的手稿展示了他思维的轨迹；费曼的笔记揭示了他如何将复杂的物理概念简化。这些记录不仅帮助他们整理思路，更成为了人类智慧的宝贵财富。"},
    {"id": "p5", "text": "在数字时代，我们有了更好的工具来记录和组织思考。我们可以在阅读的同时标注想法，可以将不同时间、不同来源的思考串联起来，形成一个动态的知识网络。这种方式让思考变得可视化、可追溯，也更容易产生新的洞察。"},
    {"id": "p6", "text": "思考的延伸不是终点，而是起点。每一次记录都是一颗种子，可能在未来的某个时刻生根发芽。当我们回顾过去的思考时，常常会惊讶地发现，那些看似零散的想法，竟然在不知不觉中形成了一个完整的思想体系。"},
    {"id": "p7", "text": "培养深度思考的习惯需要时间和练习。开始时可能会觉得困难，不知道该记录什么。但随着实践的增加，你会发现自己越来越善于捕捉思维的火花，越来越能够在信息之间建立有意义的联系。这个过程本身就是一种成长。"},
    {"id": "p8", "text": "最后，记住：思考的价值不在于数量，而在于质量。一个深刻的洞察胜过一百个肤浅的想法。给自己足够的时间去思考，去沉淀，去让想法在脑海中发酵。真正的智慧，往往诞生于这样的深度思考之中。"}
  ]'
);

-- 设置 RLS（行级安全）为关闭，因为是单用户应用
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE thoughts DISABLE ROW LEVEL SECURITY;