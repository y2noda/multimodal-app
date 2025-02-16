import type { ChatResponse, EssayConfig } from "@/shared/types";
import { useState } from "react";
import { ChatInput } from "./components/chat/chat-input";
import "./styles/app.css";

function App() {
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<ChatResponse[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (
        message: string,
        images?: string[],
        essayConfig?: EssayConfig
    ) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message,
                    images,
                    essayConfig,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "チャットの送信に失敗しました"
                );
            }

            const data = await response.json();
            setMessages((prev) => [...prev, data]);
        } catch (error) {
            console.error("Error:", error);
            setError(
                error instanceof Error ? error.message : "エラーが発生しました"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-2xl font-bold mb-6">AI チャット</h1>

                {/* エラーメッセージ */}
                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {/* メッセージ履歴 */}
                <div className="space-y-4 mb-6">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className="p-4 bg-white rounded-lg shadow"
                        >
                            <p className="whitespace-pre-wrap">{msg.message}</p>
                            <p className="text-xs text-gray-500 mt-2">
                                {new Date(msg.timestamp).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>

                {/* チャット入力 */}
                <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
        </div>
    );
}

export default App;
