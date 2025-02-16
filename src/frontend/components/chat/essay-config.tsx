import type { EssayConfig, EssayStyle } from "@/shared/types";
import { useState } from "react";

interface EssayConfigProps {
    onConfigChange: (config: EssayConfig | undefined) => void;
    disabled?: boolean;
}

export function EssayConfigForm({
    onConfigChange,
    disabled,
}: EssayConfigProps) {
    const [isEnabled, setIsEnabled] = useState(false);
    const [style, setStyle] = useState<EssayStyle>("casual");
    const [structure, setStructure] = useState({
        introduction: true,
        body: true,
        conclusion: true,
    });

    const handleToggle = () => {
        const newIsEnabled = !isEnabled;
        setIsEnabled(newIsEnabled);
        onConfigChange(newIsEnabled ? { style, structure } : undefined);
    };

    const handleStyleChange = (newStyle: EssayStyle) => {
        setStyle(newStyle);
        if (isEnabled) {
            onConfigChange({ style: newStyle, structure });
        }
    };

    const handleStructureChange = (key: keyof typeof structure) => {
        const newStructure = {
            ...structure,
            [key]: !structure[key],
        };
        setStructure(newStructure);
        if (isEnabled) {
            onConfigChange({ style, structure: newStructure });
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-2 mb-4">
                <input
                    type="checkbox"
                    id="essay-mode"
                    checked={isEnabled}
                    onChange={handleToggle}
                    className="w-4 h-4"
                    disabled={disabled}
                />
                <label htmlFor="essay-mode" className="text-sm font-medium">
                    エッセイ形式で出力
                </label>
            </div>

            {isEnabled && (
                <>
                    <div className="mb-4">
                        <p className="text-sm font-medium mb-2">文体スタイル</p>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="style"
                                    checked={style === "formal"}
                                    onChange={() => handleStyleChange("formal")}
                                />
                                <span className="text-sm">フォーマル</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="style"
                                    checked={style === "casual"}
                                    onChange={() => handleStyleChange("casual")}
                                />
                                <span className="text-sm">カジュアル</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-medium mb-2">構成要素</p>
                        <div className="flex flex-col gap-2">
                            {Object.entries(structure).map(([key, value]) => (
                                <label
                                    key={key}
                                    className="flex items-center gap-2"
                                >
                                    <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={() =>
                                            handleStructureChange(
                                                key as keyof typeof structure
                                            )
                                        }
                                    />
                                    <span className="text-sm">
                                        {key === "introduction"
                                            ? "導入"
                                            : key === "body"
                                            ? "本論"
                                            : "結論"}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
