import { createServer } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { WebSocket, WebSocketServer } from 'ws';
import { WebSocketRPCClient } from '../../frontend/api/websocket-client';

// Node.jsのWSをブラウザのWebSocketとして使用
(global as unknown as { WebSocket: typeof WebSocket }).WebSocket = WebSocket;

describe('WebSocketRPCClient', () => {
  const port = 8080;  // テスト用に別のポートを使用
  const wsUrl = `ws://localhost:${port}/api/ws`;
  let wss: WebSocketServer;
  let server: ReturnType<typeof createServer>;

  beforeAll(async () => {
    server = createServer();
    wss = new WebSocketServer({
      server,
      path: '/api/ws'
    });
    await new Promise<void>((resolve, reject) => {
      server.listen(port)  // ポート8080で起動
        .once('listening', () => resolve())
        .once('error', reject);
    });
  }, 15000);  // タイムアウトを延長

  afterAll(() => {
    wss.close();
    server.close();
  });

  it('接続が確立できること', async () => {
    const client = new WebSocketRPCClient(wsUrl);
    await new Promise<void>((resolve) => {
      client.on('connected', () => {
        client.close();
        resolve();
      });
    });
  }, 10000);

  it('メッセージを送受信できること', async () => {
    const testMessage = { message: 'テストメッセージ' };

    wss.on('connection', (ws) => {
      ws.on('message', (data) => {
        const request = JSON.parse(data.toString());
        ws.send(JSON.stringify({
          id: request.id,
          result: testMessage
        }));
      });
    });

    const client = new WebSocketRPCClient(wsUrl);
    await new Promise<void>((resolve, reject) => {
      client.on('connected', async () => {
        try {
          const response = await client.call('chat', testMessage);
          expect(response).toEqual(testMessage);
          client.close();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }, 10000);
});
