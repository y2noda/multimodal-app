import type { ChatResponse as SharedChatResponse } from "@/shared/types";
import { EventEmitter } from "eventemitter3";

interface RPCResponse<T = unknown> {
    id: string;
    result?: T;
    error?: {
        code: number;
        message: string;
    };
}

interface WebSocketClientEvents {
    connected: () => void;
    disconnected: () => void;
    error: (error: Error) => void;
    message: (response: RPCResponse<unknown>) => void;
}

export type ChatResponse = SharedChatResponse;

export class WebSocketRPCClient extends EventEmitter<WebSocketClientEvents> {
    private ws: WebSocket | null = null;
    private pendingRequests = new Map<string, (response: RPCResponse<unknown>) => void>();
    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts = 5;
    private isClosing = false;
    private cleanupFunctions: (() => void)[] = [];
    private connectionTimeout = 10000;
    private reconnectDelay = 1000;

    constructor(private readonly url: string) {
        super();
        this.connect().catch(console.error);
    }

    private cleanup(): void {
        for (const cleanup of this.cleanupFunctions) {
            cleanup();
        }
        this.cleanupFunctions = [];
    }

    private getWebSocketState(state: number): string {
        switch (state) {
            case WebSocket.CONNECTING:
                return "CONNECTING";
            case WebSocket.OPEN:
                return "OPEN";
            case WebSocket.CLOSING:
                return "CLOSING";
            case WebSocket.CLOSED:
                return "CLOSED";
            default:
                return "UNKNOWN";
        }
    }

    private async connect(): Promise<void> {
        if (this.isClosing || !this.url) return;

        try {
            console.log("WebSocket: 接続開始", {
                url: this.url,
                timeout: this.connectionTimeout,
                attempts: this.reconnectAttempts,
                timestamp: new Date().toISOString(),
                environment: import.meta.env.MODE
            });

            await new Promise<void>((resolve, reject) => {
                const ws = new WebSocket(this.url);
                console.log("WebSocket: インスタンス作成", {
                    readyState: this.getWebSocketState(ws.readyState),
                    timestamp: new Date().toISOString()
                });

                const timeoutId = setTimeout(() => {
                    if (ws.readyState !== WebSocket.OPEN) {
                        console.log("WebSocket: 接続タイムアウト", {
                            readyState: this.getWebSocketState(ws.readyState),
                            timestamp: new Date().toISOString()
                        });
                        ws.close();
                        reject(new Error('接続タイムアウト'));
                    }
                }, this.connectionTimeout);

                ws.addEventListener("open", () => {
                    clearTimeout(timeoutId);
                    this.ws = ws;
                    this.reconnectAttempts = 0;
                    console.log("WebSocket: 接続成功", {
                        readyState: this.getWebSocketState(ws.readyState),
                        timestamp: new Date().toISOString()
                    });
                    this.emit("connected");
                    resolve();
                }, { once: true });

                ws.addEventListener("error", (error) => {
                    clearTimeout(timeoutId);
                    console.error("WebSocket: 接続エラー", {
                        error,
                        readyState: this.getWebSocketState(ws.readyState),
                        timestamp: new Date().toISOString()
                    });
                    reject(error);
                }, { once: true });
            });

            if (this.ws) {
                this.setupWebSocketListeners();
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '接続エラー';
            console.error("WebSocket: 接続失敗", {
                error: errorMessage,
                url: this.url,
                attempts: this.reconnectAttempts,
                environment: import.meta.env.MODE
            });
            this.emit("error", new Error(errorMessage));

            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                await this.tryReconnect();
            }
        }
    }

    private setupWebSocketListeners(): void {
        if (!this.ws) return;

        this.ws.addEventListener("message", this.handleMessage.bind(this));
        this.ws.addEventListener("close", this.handleClose.bind(this));
        this.ws.addEventListener("error", this.handleError.bind(this));
    }

    private async tryReconnect(): Promise<void> {
        this.reconnectAttempts++;
        const delay = Math.min(
            this.reconnectDelay * (2 ** (this.reconnectAttempts - 1)),
            10000
        );

        console.log(`WebSocket: 再接続を試みています (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        await new Promise(resolve => setTimeout(resolve, delay));

        if (!this.isClosing) {
            await this.connect();
        }
    }

    private handleMessage(event: MessageEvent): void {
        try {
            const data = JSON.parse(event.data);
            const callback = this.pendingRequests.get(data.id);
            if (callback) {
                callback(data);
                this.pendingRequests.delete(data.id);
            }
            this.emit("message", data);
        } catch (err) {
            console.error("WebSocket: メッセージパースエラー", {
                error: err,
                rawData: event.data
            });
            this.emit("error", new Error("メッセージのパースに失敗しました"));
        }
    }

    private handleClose(event: CloseEvent): void {
        console.log("WebSocket: 接続切断", {
            code: event.code,
            reason: event.reason || "理由なし",
            wasClean: event.wasClean,
            state: this.getWebSocketState(this.ws?.readyState || WebSocket.CLOSED)
        });
        this.emit("disconnected");
        if (!this.isClosing) {
            this.tryReconnect();
        }
    }

    private handleError(event: Event): void {
        console.error("WebSocket: エラー発生", {
            error: event,
            state: this.getWebSocketState(this.ws?.readyState || WebSocket.CLOSED),
            wsInstance: !!this.ws
        });
        this.emit("error", event instanceof Error ? event : new Error("WebSocket接続エラー"));
    }

    public async call<T>(method: string, params: unknown): Promise<T> {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.error("WebSocket: 呼び出しエラー", {
                hasWs: !!this.ws,
                state: this.ws ? this.getWebSocketState(this.ws.readyState) : "NO_CONNECTION"
            });
            throw new Error("WebSocket接続が確立されていません");
        }

        const request = {
            id: crypto.randomUUID(),
            method,
            params
        };

        console.log("WebSocket: リクエスト送信", {
            request,
            state: this.getWebSocketState(this.ws.readyState)
        });

        return new Promise<T>((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                console.error("WebSocket: リクエストがタイムアウト");
                reject(new Error("リクエストがタイムアウトしました"));
            }, 30000);

            this.once<'message'>('message', (response) => {
                console.log("WebSocket: レスポンスを受信", response);
                clearTimeout(timeoutId);
                if (response.error) {
                    reject(new Error(response.error.message));
                } else {
                    resolve(response.result as T);
                }
            });

            this.ws?.send(JSON.stringify(request));
        });
    }

    public close(): void {
        this.isClosing = true;
        this.cleanup();
        if (this.ws) {
            this.ws.close(1000, "正常終了");
            this.ws = null;
            this.removeAllListeners();
        }
        this.isClosing = false;
    }
}
