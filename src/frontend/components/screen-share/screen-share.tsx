import { useWebSocketRPC } from "@/frontend/hooks/use-websocket-rpc";
import type { ChatResponse } from "@/shared/types";
import { useCallback, useEffect, useState } from "react";

const WEBSOCKET_URL = import.meta.env.PROD
    ? `wss://${window.location.host}/api/ws`
    : "ws://localhost:8080/api/ws";

interface ScreenShareProps {
    onScreenCapture: (imageData: string) => Promise<void>;
    onScreenShare?: (sharing: boolean) => void;
    onCaptureError?: (error: string) => void;
    onStopStart?: () => void;
    disabled?: boolean;
}

// ImageCaptureインターフェースの定義
interface ImageCapture {
    grabFrame(): Promise<ImageBitmap>;
}

declare global {
    var ImageCapture: {
        prototype: ImageCapture;
        new (track: MediaStreamTrack): ImageCapture;
    };
}

export function ScreenShare({
    onScreenCapture,
    onScreenShare,
    onCaptureError,
    onStopStart,
    disabled,
}: ScreenShareProps) {
    const [isSharing, setIsSharing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [lastCapture, setLastCapture] = useState<string | null>(null);

    const ws = useWebSocketRPC(WEBSOCKET_URL);

    // ブラウザ互換性チェック
    const checkBrowserCompatibility = () => {
        if (!navigator.mediaDevices?.getDisplayMedia) {
            throw new Error("お使いのブラウザは画面共有に対応していません。");
        }
    };

    const processScreenCapture = useCallback(
        async (base64Image: string) => {
            try {
                const response = await ws.call<ChatResponse>("screenAnalysis", {
                    message: "画面の内容を分析してください",
                    images: [base64Image],
                });
                onScreenCapture(response.message);
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "エラーが発生しました";
                onCaptureError?.(errorMessage);
                console.error("画面共有分析エラー:", error);
            }
        },
        [ws, onScreenCapture, onCaptureError]
    );

    const startScreenShare = async () => {
        try {
            setError(null);
            checkBrowserCompatibility();

            const mediaStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false,
            });

            setStream(mediaStream);
            setIsSharing(true);
            onScreenShare?.(true);

            const videoTrack = mediaStream.getVideoTracks()[0];
            const imageCapture = new ImageCapture(videoTrack);

            // 最後のフレームを保存
            const bitmap = await imageCapture.grabFrame();
            const canvas = document.createElement("canvas");
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;

            const context = canvas.getContext("2d");
            if (context) {
                context.drawImage(bitmap, 0, 0);
                const base64Image = canvas.toDataURL("image/png");
                setLastCapture(base64Image);
            }

            videoTrack.onended = () => {
                console.log("画面共有が終了しました");
                stopSharing();
            };
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "画面共有の開始に失敗しました";
            setError(errorMessage);
            console.error("画面共有エラー:", error);
        }
    };

    const stopSharing = useCallback(async () => {
        try {
            onStopStart?.();
            if (lastCapture) await processScreenCapture(lastCapture);

            if (stream) {
                const tracks = stream.getTracks();
                for (const track of tracks) {
                    track.stop();
                }
                setStream(null);
            }
            setIsSharing(false);
            onScreenShare?.(false);
            setError(null);
            setLastCapture(null);
        } catch (error) {
            console.error("画面共有の停止に失敗:", error);
            setError("画面共有の停止に失敗しました");
        }
    }, [lastCapture, stream, processScreenCapture, onScreenShare, onStopStart]);

    useEffect(() => {
        if (stream) {
            const tracks = stream.getTracks();
            for (const track of tracks) {
                track.onended = () => {
                    console.log("画面共有が終了しました");
                    stopSharing();
                };
            }
        }
    }, [stream, stopSharing]);

    useEffect(() => {
        onScreenShare?.(isSharing);
    }, [isSharing, onScreenShare]);

    return (
        <>
            {error && (
                <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                    {error}
                </div>
            )}
            <button
                type="button"
                onClick={isSharing ? stopSharing : startScreenShare}
                disabled={disabled}
                className={`p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isSharing ? "text-red-500" : "text-gray-700"
                }`}
                title={isSharing ? "画面共有を停止" : "画面共有を開始"}
            >
                <span className="text-xl">{isSharing ? "🔴" : "🖥️"}</span>
            </button>
            {isSharing && (
                <span className="text-xs text-green-600 ml-2">共有中...</span>
            )}
        </>
    );
}
