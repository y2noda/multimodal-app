import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import * as dotenv from 'dotenv';

// 環境変数を読み込む
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEYが設定されていません');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// 安全性の設定
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// テキストのみのモデル
export const textOnlyModel = genAI.getGenerativeModel({
  model: "gemini-pro",
  safetySettings,
});

// マルチモーダルモデル
export const visionModel = genAI.getGenerativeModel({
  model: "models/gemini-2.0-flash-exp",
  safetySettings,
});

// 画像をFileData形式に変換する関数
export const convertBase64ToFileData = async (base64String: string) => {
  const mimeType = base64String.split(';')[0].split(':')[1];
  const base64Data = base64String.split(',')[1];

  return {
    data: Buffer.from(base64Data, 'base64'),
    mimeType
  };
};
