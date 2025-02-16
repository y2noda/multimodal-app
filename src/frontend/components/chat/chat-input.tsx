import { useState } from "react";

interface ChatInputProps {
    onSubmit: (message: string, images?: string[]) => Promise<unknown>;
    isLoading: boolean;
}

interface ImageWithId {
    id: string;
    data: string;
}

export function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
    const [message, setMessage] = useState("");
    const [images, setImages] = useState<ImageWithId[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && !isLoading) {
            onSubmit(
                message,
                images.map((img) => img.data)
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
            <form onSubmit={handleSubmit} className="mt-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="メッセージを入力..."
                        className="flex-1 p-2 border rounded"
                        disabled={isLoading}
                    />
                    <label className="p-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
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
            </form>
        </div>
    );
}
