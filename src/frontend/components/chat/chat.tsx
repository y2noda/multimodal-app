import { ChatInput } from "@/frontend/components/chat/chat-input";
import { ChatMessages } from "@/frontend/components/chat/chat-messages";
import { useChat } from "@/frontend/hooks/use-chat";

export function Chat() {
    const { messages, isLoading, error, sendMessage, isConnected } = useChat();

    return (
        <div className="chat-container">
            {!isConnected && (
                <div className="text-yellow-600 bg-yellow-50 p-2 rounded mb-4">
                    サーバーに接続中...
                </div>
            )}

            <ChatMessages messages={messages} error={error} />

            <ChatInput onSubmit={sendMessage} isLoading={isLoading} />
        </div>
    );
}
