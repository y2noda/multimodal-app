import type { ChatResponse, EssayConfig } from "@/shared/types";
import { useState } from "react";
import { useWebSocketRPC } from "./use-websocket-rpc";

const WEBSOCKET_URL = import.meta.env.PROD
    ? `wss://${window.location.host}/api/ws`
    : "ws://localhost:8080/api/ws";

interface SendMessageOptions {
    essayConfig?: EssayConfig;
}

export function useChat() {
    const [messages, setMessages] = useState<ChatResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const ws = useWebSocketRPC(WEBSOCKET_URL);

    const sendMessage = async (message: string, options?: SendMessageOptions) => {
        setIsLoading(true);
        setError(null);
        try {
            // ユーザーメッセージを追加
            const userMessage = {
                id: crypto.randomUUID(),
                message,
                timestamp: new Date().toISOString(),
                type: "user" as const,
            };
            setMessages((prev) => [...prev, userMessage]);

            // WebSocketでメッセージを送信
            const response = await ws.call<ChatResponse>("chat", {
                message,
                essayConfig: options?.essayConfig
            });
            setMessages((prev) => [
                ...prev,
                { ...response, type: "assistant" as const },
            ]);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "エラーが発生しました";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        isConnected: ws.isConnected,
    };
}
