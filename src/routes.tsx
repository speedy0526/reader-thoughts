import ReadingPage from './pages/ReadingPage';
import ArticlesPage from './pages/ArticlesPage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: '文章管理',
    path: '/',
    element: <ArticlesPage />
  },
  {
    name: '阅读',
    path: '/read/:id',
    element: <ReadingPage />
  }
];

export default routes;
