import * as dotenv from 'dotenv'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createServer } from 'node:http'
import chat from './api/chat'
import type { Env } from './api/types'
import { injectWebSocket } from './api/websocket'

// 環境変数を読み込む
dotenv.config()

// 型パラメータを正しく設定
const app = new Hono<Env>()

// CORSを有効化
app.use('/*', cors())

// チャットエンドポイントを追加
app.route('/api', chat)

// サーバーを起動
const port = 8080
console.log(`Server is running on port ${port}`)
console.log('環境変数:', {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '設定済み' : '未設定',
  BASE_URL: process.env.VITE_API_BASE_URL
})
const server = createServer()
injectWebSocket(server)
server.on('request', app.fetch)
server.listen(port)
