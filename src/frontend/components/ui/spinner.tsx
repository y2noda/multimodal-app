interface SpinnerProps {
    message?: string;
}

export const Spinner = ({ message = "応答を生成中..." }: SpinnerProps) => {
    return (
        <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
            <span className="ml-2 text-gray-600">{message}</span>
        </div>
    );
};
