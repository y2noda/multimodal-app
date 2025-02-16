type EssayStyle = 'formal' | 'casual';
type EssayStructure = {
  introduction: boolean;
  body: boolean;
  conclusion: boolean;
};

export interface EssayConfig {
  style: EssayStyle;
  structure: EssayStructure;
}

const STYLE_PROMPTS: Record<EssayStyle, string> = {
  formal: '以下の内容を学術的で形式的な文体で記述してください：',
  casual: '以下の内容を親しみやすい口調で記述してください：'
};

export function formatEssayPrompt(content: string, config: EssayConfig): string {
  const structureParts = [];
  if (config.structure.introduction) structureParts.push('導入部分');
  if (config.structure.body) structureParts.push('本論');
  if (config.structure.conclusion) structureParts.push('結論');

  const stylePrompt = STYLE_PROMPTS[config.style];
  const structurePrompt = `以下の構成で記述してください：${structureParts.join('、')}`;

  return `${stylePrompt}\n${structurePrompt}\n\n${content}`;
}
