import { useEffect, useState } from "react";
import { WebSocketRPCClient } from "../api/websocket-client";


export interface UseWebSocketRPCResult {
    isConnected: boolean;
    call: <T>(method: string, params: unknown) => Promise<T>;
    error: Error | null;
}

export function useWebSocketRPC(url: string): UseWebSocketRPCResult {
    const [client, setClient] = useState<WebSocketRPCClient | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const wsClient = new WebSocketRPCClient(url);

        wsClient.on("connected", () => {
            setIsConnected(true);
            setError(null);
        });

        wsClient.on("disconnected", () => {
            setIsConnected(false);
        });

        wsClient.on("error", (err) => {
            setError(err instanceof Error ? err : new Error("WebSocket接続エラー"));
        });

        setClient(wsClient);

        return () => {
            wsClient.close();
        };
    }, [url]);

    const call = async <T>(method: string, params: unknown): Promise<T> => {
        if (!client) {
            throw new Error("WebSocketクライアントが初期化されていません");
        }
        return client.call<T>(method, params);
    };

    return {
        isConnected,
        call,
        error,
    };
}
