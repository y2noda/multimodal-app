// チャットメッセージの型
export type ChatMessage = {
  message: string;
}

// マルチモーダルメッセージの型
export type MultiModalMessage = ChatMessage & {
  images?: string[]; // base64エンコードされた画像データの配列
}

// チャットレスポンスの型
export type ChatResponse = {
  id: string;
  message: string;
  timestamp: string;
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

// APIエンドポイントの定義
export type ApiEndpoints = {
  '/api/chat': {
    post: {
      input: ChatMessage | MultiModalMessage;
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
