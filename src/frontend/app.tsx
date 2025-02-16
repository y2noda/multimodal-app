import { Button } from "@/frontend/components/ui/button";
import { apiClient } from "@/frontend/utils/api-client";
import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./styles/app.css";
import viteLogo from "/vite.svg";

function App() {
    const [count, setCount] = useState(0);
    const [response, setResponse] = useState<string>("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // 画像ファイルをbase64に変換する関数
    const convertImageToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // 画像ファイルが選択されたときの処理
    const handleImageSelect = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            const base64Image = await convertImageToBase64(file);
            setSelectedImage(base64Image);
        }
    };

    // チャットAPIをテストする関数
    const testChatApi = async () => {
        try {
            console.log("APIリクエスト送信:", {
                message: "この画像について説明してください",
                hasImage: !!selectedImage,
            });

            const data = await apiClient.chat.send(
                "この画像について説明してください",
                selectedImage ? [selectedImage] : undefined
            );
            console.log("APIレスポンス受信:", data);
            setResponse(JSON.stringify(data, null, 2));
        } catch (error) {
            console.error("APIエラー:", error);
            setResponse(`エラー: ${error}`);
        }
    };

    return (
        <>
            <div>
                <a href="https://vite.dev" target="_blank" rel="noreferrer">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank" rel="noreferrer">
                    <img
                        src={reactLogo}
                        className="logo react"
                        alt="React logo"
                    />
                </a>
            </div>
            <h1>マルチモーダルAPI テスト</h1>
            <div className="card">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                />
                {selectedImage && (
                    <img
                        src={selectedImage}
                        alt="Selected"
                        style={{ maxWidth: "300px", marginTop: "10px" }}
                    />
                )}
                <button
                    type="button"
                    onClick={() => setCount((count) => count + 1)}
                >
                    count is {count}
                </button>
                <Button onClick={testChatApi}>APIをテスト</Button>
                <pre>{response}</pre>
            </div>
        </>
    );
}

export default App;
