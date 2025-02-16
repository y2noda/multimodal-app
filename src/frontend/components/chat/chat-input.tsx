import type { EssayConfig } from "@/shared/types";
import { useState } from "react";
import { EssayConfigForm } from "./essay-config";

interface ChatInputProps {
    onSubmit: (
        message: string,
        images?: string[],
        essayConfig?: EssayConfig
    ) => void;
    isLoading?: boolean;
}

interface ImageWithId {
    id: string;
    data: string;
}

export function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
    const [message, setMessage] = useState("");
    const [essayConfig, setEssayConfig] = useState<EssayConfig>();
    const [images, setImages] = useState<ImageWithId[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && !isLoading) {
            onSubmit(
                message,
                images.map((img) => img.data),
                essayConfig
            );
            setMessage("");
            setImages([]);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        for (const file of files) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setImages((prev) => [
                    ...prev,
                    { id: crypto.randomUUID(), data: base64 },
                ]);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            <EssayConfigForm onConfigChange={setEssayConfig} />
            <form onSubmit={handleSubmit} className="mt-4">
                <div className="space-y-4">
                    {/* 画像プレビュー */}
                    {images.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto p-2">
                            {images.map((image) => (
                                <div key={image.id} className="relative">
                                    <img
                                        src={image.data}
                                        alt="Preview"
                                        className="h-20 w-20 object-cover rounded"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImages((prev) =>
                                                prev.filter(
                                                    (img) => img.id !== image.id
                                                )
                                            );
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="メッセージを入力..."
                            className="flex-1 p-2 border rounded"
                            disabled={isLoading}
                        />
                        <label className="p-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="hidden"
                                disabled={isLoading}
                            />
                            📷
                        </label>
                        <button
                            type="submit"
                            disabled={!message.trim() || isLoading}
                            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                        >
                            送信
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
