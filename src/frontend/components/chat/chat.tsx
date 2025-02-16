import { ChatInput } from "@/frontend/components/chat/chat-input";
import { ChatMessages } from "@/frontend/components/chat/chat-messages";
import { EssayConfigForm } from "@/frontend/components/chat/essay-config";
import { useChat } from "@/frontend/hooks/use-chat";
import type { EssayConfig } from "@/shared/types";
import { useState } from "react";

export function Chat() {
    const { messages, isLoading, error, sendMessage, isConnected } = useChat();
    const [essayConfig, setEssayConfig] = useState<EssayConfig | undefined>();

    const handleEssayConfigChange = (config: EssayConfig | undefined) => {
        setEssayConfig(config);
    };

    const handleSubmit = async (message: string) => {
        return sendMessage(message, { essayConfig });
    };

    return (
        <div className="flex flex-col h-full relative">
            <div className="sticky top-[3.5rem] bg-white border-b z-10">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <div className="mb-4">
                        <EssayConfigForm
                            onConfigChange={handleEssayConfigChange}
                            disabled={isLoading}
                        />
                    </div>
                    <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {!isConnected && (
                    <div className="text-yellow-600 bg-yellow-50 p-2 rounded mb-4">
                        サーバーに接続中...
                    </div>
                )}

                <ChatMessages messages={messages} error={error} />
            </div>
        </div>
    );
}
