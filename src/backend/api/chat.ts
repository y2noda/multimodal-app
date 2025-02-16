import { Hono } from 'hono';
import { convertBase64ToFileData, textOnlyModel, visionModel } from '../lib/gemini';
import type { AppType } from './types';

const chat = new Hono<AppType>();

chat.post('/chat', async (c) => {
  try {
    const { message, images } = await c.req.json();
    console.log('受信したリクエスト:', { message, hasImages: !!images?.length });

    let response: string;

    if (images && images.length > 0) {
      // マルチモーダルの場合
      console.log('マルチモーダルモードで処理中...');
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
        console.log('画像の変換が完了しました');

        const result = await model.generateContent([message, ...imageContents]);
        if (!result.response) {
          throw new Error('Geminiからのレスポンスが空です');
        }
        response = await result.response.text();
        console.log('Geminiからのレスポンス:', response);
      } catch (error) {
        console.error('マルチモーダル処理エラー:', error);
        throw error;
      }
    } else {
      // テキストのみの場合
      console.log('テキストのみモードで処理中...');
      const model = textOnlyModel;
      try {
        const result = await model.generateContent(message);
        if (!result.response) {
          throw new Error('Geminiからのレスポンスが空です');
        }
        response = await result.response.text();
        console.log('Geminiからのレスポンス:', response);
      } catch (error) {
        console.error('テキスト処理エラー:', error);
        throw error;
      }
    }

    const responseData = {
      id: crypto.randomUUID(),
      message: response,
      timestamp: new Date().toISOString()
    };
    console.log('送信するレスポンス:', responseData);

    // Content-Typeヘッダーを明示的に設定
    c.header('Content-Type', 'application/json');
    return c.json(responseData);
  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'チャットの処理中にエラーが発生しました';

    // エラーレスポンスでもContent-Typeを設定
    c.header('Content-Type', 'application/json');
    return c.json({ error: errorMessage }, 500);
  }
});

export default chat;
