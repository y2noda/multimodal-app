import { Chat } from "@/frontend/components/chat/chat";
import "./styles/app.css";

function App() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* ヘッダー部分 */}
            <header className="bg-white shadow-sm py-3 px-6 fixed w-full top-0 z-10">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-xl font-bold text-gray-800">
                        AI チャット
                    </h1>
                </div>
            </header>

            {/* メインコンテンツ */}
            <div className="flex-1 flex flex-col h-screen pt-[3.5rem]">
                <Chat />
            </div>
        </div>
    );
}

export default App;
