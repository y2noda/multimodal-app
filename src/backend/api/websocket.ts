import { createNodeWebSocket } from '@hono/node-ws';
import { Hono } from 'hono';
import { convertBase64ToFileData, textOnlyModel, visionModel } from '../lib/gemini';
import logger from '../lib/logger';
import type { AppType } from './types';

// RPCリクエストの型定義
interface RPCRequest<T = unknown> {
  id: string;
  method: 'chat' | 'screenAnalysis';
  params: T;
}

// メソッド固有のパラメータ型
interface ChatParams {
  message: string;
  images?: string[];
  essayConfig?: {
    type: string;
    length: number;
  };
}

interface ScreenAnalysisParams {
  message: string;
  image: string;
  metadata?: Record<string, unknown>;
}

// レスポンス型
interface ChatResponse {
  message: string;
  timestamp: string;
}

const websocket = new Hono<AppType>();
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app: websocket });

websocket.get('/api/ws', upgradeWebSocket(() => ({
  onOpen: () => {
    logger.info('WebSocket: クライアント接続確立', {
      timestamp: new Date().toISOString()
    });
  },
  onMessage: async (evt, ws) => {
    try {
      const message = evt.data.toString();
      logger.info('WebSocket: メッセージを受信', {
        message,
        timestamp: new Date().toISOString()
      });

      const request: RPCRequest = JSON.parse(message);
      logger.info('WebSocket: パース済みリクエスト', {
        method: request.method,
        id: request.id,
        params: request.params
      });

      let result: ChatResponse;

      switch (request.method) {
        case 'chat':
          logger.info('WebSocket: チャットリクエストを処理中');
          result = await handleChatRequest(request.params as ChatParams);
          break;
        case 'screenAnalysis':
          logger.info('WebSocket: 画面分析リクエストを処理中');
          result = await handleScreenAnalysis(request.params as ScreenAnalysisParams);
          break;
        default:
          throw new Error(`未対応のメソッド: ${request.method}`);
      }

      const response = JSON.stringify({
        id: request.id,
        result
      });

      logger.info('WebSocket: レスポンス送信', { response });
      ws.send(response);

    } catch (error) {
      logger.error('WebSocket処理エラー:', error);
      ws.send(JSON.stringify({
        error: {
          code: -32000,
          message: error instanceof Error ? error.message : 'WebSocket処理中にエラーが発生しました'
        }
      }));
    }
  },
  onError: (evt) => {
    logger.error('WebSocket: エラー発生', {
      error: evt,
      timestamp: new Date().toISOString()
    });
  }
})));

// ハンドラー関数を外部に移動
async function handleChatRequest(params: ChatParams): Promise<ChatResponse> {
  logger.info('チャットリクエストの処理を開始', params);

  try {
    if (params.images && params.images.length > 0) {
      logger.info('画像付きメッセージを処理中');
      const imageContents = await Promise.all(
        params.images.map(async (base64Image: string) => {
          const { data, mimeType } = await convertBase64ToFileData(base64Image);
          return {
            inlineData: {
              data: data.toString('base64'),
              mimeType
            }
          };
        })
      );

      const result = await visionModel.generateContent([params.message, ...imageContents]);
      const response = {
        message: await result.response?.text() || '',
        timestamp: new Date().toISOString()
      };

      logger.info('チャットレスポンスを生成', response);
      return response;
    }

    logger.info('テキストメッセージを処理中');
    const result = await textOnlyModel.generateContent(params.message);
    const response = {
      message: await result.response?.text() || '',
      timestamp: new Date().toISOString()
    };

    logger.info('チャットレスポンスを生成', response);
    return response;

  } catch (error) {
    logger.error('チャットリクエストの処理に失敗', error);
    throw error;
  }
}

async function handleScreenAnalysis(params: ScreenAnalysisParams): Promise<ChatResponse> {
  const { data, mimeType } = await convertBase64ToFileData(params.image);
  const imageContent = {
    inlineData: {
      data: data.toString('base64'),
      mimeType
    }
  };

  const result = await textOnlyModel.generateContent([params.message, imageContent]);
  return {
    message: await result.response?.text() || '',
    timestamp: new Date().toISOString()
  };
}

export { injectWebSocket };
export default websocket;
