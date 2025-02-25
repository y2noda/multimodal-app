// チャットメッセージの型
export type ChatMessage = {
  message: string;
}

// マルチモーダルメッセージの型
export type MultiModalMessage = ChatMessage & {
  images?: string[]; // base64エンコードされた画像データの配列
}

// APIのエラーレスポンスの型
export type ApiErrorResponse = {
  error: string;
}

// スクリーンシェアのレスポンス型
export type ScreenShareResponse = {
  sessionId: string;
} | {
  success: boolean;
}

// APIエンドポイントの型定義
export interface ApiEndpoints {
  '/api/chat': {
    post: {
      input: ChatRequest | ScreenAnalysisRequest;
      output: ChatResponse | ApiErrorResponse;
    }
    get: {
      output: ChatResponse[];
    }
  }
  '/api/screen/start': {
    post: {
      output: { sessionId: string }
    }
  }
  '/api/screen/stop': {
    post: {
      output: { success: boolean }
    }
  }
}

// エッセイ関連の型定義
export type EssayStyle = 'formal' | 'casual';

export interface EssayStructure {
  introduction: boolean;
  body: boolean;
  conclusion: boolean;
}

export interface EssayConfig {
  style: EssayStyle;
  structure: EssayStructure;
}

// チャットリクエストの型定義
export interface ChatRequest {
  message: string;
  images?: string[];
  essayConfig?: EssayConfig;
}

// チャットレスポンスの型定義
export interface ChatResponse {
  id: string;
  message: string;
  timestamp: string;
  type?: 'user' | 'assistant';
  hasScreenShare?: boolean;
  isScreenAnalysis?: boolean;
}

export interface MultimodalRequest {
    message: string;
    images?: string[];  // base64エンコードされた画像データ
    contextHistory?: ChatMessage[];
}

export type ScreenAnalysisMetadata = {
    shareType: "window" | "tab" | "desktop";
    timestamp: string;
};

export interface ScreenAnalysisRequest {
    type: "screen_analysis";
    message: string;
    images: string[];
    metadata: ScreenAnalysisMetadata;
}
