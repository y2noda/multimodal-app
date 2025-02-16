import type { ApiEndpoints } from '@/shared/types';

// Honoの環境型を定義
export type Env = {
  Bindings: Record<string, never>;
  Variables: Record<string, never>;
};

// Honoのアプリケーション型
export type AppType = Env & ApiEndpoints;
