import { Hono } from 'hono';
import { convertBase64ToFileData, textOnlyModel, visionModel } from '../lib/gemini';
import logger from '../lib/logger';
import { formatEssayPrompt } from '../prompts/essay';
import type { AppType } from './types';

const chat = new Hono<AppType>();

chat.post('/chat', async (c) => {
  try {
    const { message, images, essayConfig } = await c.req.json();
    logger.info('受信したリクエスト', { message, hasImages: !!images?.length, essayConfig });

    let response: string;
    let processedMessage = message;

    // エッセイ形式が要求された場合、プロンプトを整形
    if (essayConfig) {
      logger.info('エッセイ形式での出力を準備中...');
      processedMessage = formatEssayPrompt(message, essayConfig);
    }

    if (images && images.length > 0) {
      // マルチモーダルの場合
      logger.info('マルチモーダルモードで処理中...');
      const model = visionModel;
      try {
        const imageContents = await Promise.all(
          images.map(async (base64Image: string) => {
            const { data, mimeType } = await convertBase64ToFileData(base64Image);
            return {
              inlineData: {
                data: data.toString('base64'),
                mimeType
              }
            };
          })
        );
        logger.info('画像の変換が完了しました');

        const result = await model.generateContent([processedMessage, ...imageContents]);
        if (!result.response) {
          throw new Error('Geminiからのレスポンスが空です');
        }
        response = await result.response.text();
        logger.info('Geminiからのレスポンス受信', { response });
      } catch (error) {
        logger.error('マルチモーダル処理エラー', { error });
        throw error;
      }
    } else {
      // テキストのみの場合
      logger.info('テキストのみモードで処理中...');
      const model = textOnlyModel;
      try {
        const result = await model.generateContent(processedMessage);
        if (!result.response) {
          throw new Error('Geminiからのレスポンスが空です');
        }
        response = await result.response.text();
        logger.info('Geminiからのレスポンス受信', { response });
      } catch (error) {
        logger.error('テキスト処理エラー', { error });
        throw error;
      }
    }

    const responseData = {
      id: crypto.randomUUID(),
      message: response,
      timestamp: new Date().toISOString()
    };
    logger.info('送信するレスポンス', { responseData });

    c.header('Content-Type', 'application/json');
    return c.json(responseData);
  } catch (error) {
    logger.error('Chat API error:', { error });
    const errorMessage = error instanceof Error ? error.message : 'チャットの処理中にエラーが発生しました';

    c.header('Content-Type', 'application/json');
    return c.json({ error: errorMessage }, 500);
  }
});

export default chat;
