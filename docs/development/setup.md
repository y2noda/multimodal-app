# 開発環境構築手順

## 1. 必要なツール

*   **Node.js:** 18.x 以降
*   **pnpm:** 8.x 以降 (インストール手順: [https://pnpm.io/installation](https://pnpm.io/installation))

## 2. プロジェクトの初期化

1.  **プロジェクトディレクトリの作成:**
    ```bash
    mkdir multimodal-live-app
    cd multimodal-live-app
    ```

2.  **Vite プロジェクトの作成 (React + TypeScript):**
    ```bash
    pnpm create vite@latest . --template react-ts
    ```

3.  **shadcn/ui のインストールと設定:**

    https://ui.shadcn.com/docs/installation/vite に従ってインストール
    
    tailwindcssのバージョンは3.4.17に固定することに注意
    ```bash
    pnpm add -D tailwindcss@3.4.17 postcss autoprefixer
    pnpm dlx tailwindcss@3.4.17 init -p
    ```

    各種設定を行ってからshadcn/uiの初期化を行う

    ```bash
    pnpm dlx shadcn@latest init
    ```
    
    コンポーネントを追加するときは、
    ```bash
    pnpm dlx shadcn@latest add button
    ```
    
    とする
    
    

## 3. 依存関係のインストール

```bash
pnpm install
pnpm add @google/generative-ai hono 
```

## 4. Biomeの設定

1. **Biomeのインストール:**
```bash
pnpm add --save-dev --save-exact @biomejs/biome
```

2. **設定ファイルの作成:**
`biome.json`を作成:
```bash
pnpm biome init
```

以下の内容で`biome.json`を更新:
```json
{
  ...
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noCommentText": "off"
      },
      "style": {
        "useBlockStatements": "off"
      }
    }
  },
  "json": {
    "parser": {
      "allowComments": true
    }
  }
  ...
}
```

3. **package.jsonにスクリプトを追加:**
```json
{
  "scripts": {
    "format": "pnpm biome format --write .",
    "lint": "pnpm biome lint .",
    "check": "pnpm biome check --apply ."
  }
}
```

## 5. 環境変数の設定

`.env` ファイルを作成し、Gemini API キーを設定:

```
GEMINI_API_KEY=YOUR_API_KEY
```

## 6. 開発サーバーの起動

```bash
pnpm run dev
```

ブラウザで `http://localhost:5173` (または表示された URL) を開き、動作確認。

## 7. (オプション) `tsconfig.json` の設定

`tsconfig.json` に以下の設定を追加すると、`@/` から始まる絶対パスで `src/` ディレクトリ以下のファイルをインポートできるようになります。

```json
{
  "compilerOptions": {
    // ...
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  // ...
}
``` 
