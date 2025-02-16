import type { ChatResponse } from "@/shared/types";

interface ChatMessagesProps {
    messages: ChatResponse[];
    error: string | null | Error;
}

export function ChatMessages({ messages, error }: ChatMessagesProps) {
    return (
        <div className="messages-area">
            {error && (
                <div className="error-message">
                    <p>{error instanceof Error ? error.message : error}</p>
                </div>
            )}

            <div className="messages-container">
                {messages.map((msg) => (
                    <div
                        key={`${msg.id}-${msg.timestamp}`}
                        className={`group flex ${
                            msg.type === "user"
                                ? "justify-end"
                                : "justify-start"
                        }`}
                    >
                        <div
                            className={`p-4 rounded-lg shadow-sm max-w-[85%] transition-shadow hover:shadow-md
                                ${
                                    msg.type === "user"
                                        ? "bg-blue-50 rounded-tr-none"
                                        : "bg-white rounded-tl-none"
                                }`}
                        >
                            {(msg.hasScreenShare || msg.isScreenAnalysis) && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                                    {msg.hasScreenShare && (
                                        <span className="flex items-center gap-1">
                                            🖥️ 画面共有
                                        </span>
                                    )}
                                    {msg.isScreenAnalysis && (
                                        <span className="flex items-center gap-1">
                                            {msg.hasScreenShare && "•"}
                                            🔍 画面分析
                                        </span>
                                    )}
                                </div>
                            )}
                            <p className="whitespace-pre-wrap text-gray-800">
                                {msg.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {new Date(msg.timestamp).toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
