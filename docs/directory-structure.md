# ディレクトリ構成

このドキュメントでは、プロジェクトのディレクトリ構成とその役割について説明します。

## 基本構成

```
.
├── docs/                         # プロジェクトドキュメント
├── src/                         # ソースコード
│   ├── frontend/               # フロントエンド関連
│   ├── backend/                # バックエンド関連
│   └── shared/                 # 共有コード
└── public/                     # 静的ファイル
```

## 詳細構成

### `docs/` - プロジェクトドキュメント
```
docs/
├── requirements.md              # 要件定義
├── system.md                   # システムアーキテクチャ
├── technology-stack.md         # 技術スタック
└── directory-structure.md      # 本ドキュメント
```

### `src/frontend/` - フロントエンド
```
frontend/
├── components/                 # UIコンポーネント
│   ├── ui/                    # 基本UIコンポーネント（shadcn/ui）
│   ├── screen-share/          # 画面共有関連
│   ├── chat/                  # チャット関連
│   └── essay/                 # エッセイ出力関連
├── hooks/                     # カスタムフック
│   ├── use-screen-share.ts    # 画面共有フック
│   ├── use-chat.ts           # チャットフック
│   └── use-websocket.ts      # WebSocket接続フック
├── utils/                     # ユーティリティ関数
│   ├── api-client.ts         # APIクライアント
│   └── webrtc.ts             # WebRTC関連
├── styles/                    # スタイル定義
│   └── globals.css           # グローバルスタイル
└── app.tsx                   # メインアプリケーション
```

### `src/backend/` - バックエンド
```
backend/
├── api/                       # APIエンドポイント
│   ├── chat.ts               # チャットAPI
│   ├── screen-share.ts       # 画面共有API
│   └── essay.ts              # エッセイAPI
├── lib/                      # 共有ライブラリ
│   ├── gemini.ts            # Gemini API クライアント
│   ├── websocket.ts         # WebSocket処理
│   └── webrtc.ts            # WebRTC処理
├── server.ts                 # サーバーエントリーポイント
└── db.ts                     # データベース接続
```

### `src/shared/` - 共有コード
```
shared/
├── types/                    # 型定義
│   ├── api.ts               # API型定義
│   ├── chat.ts              # チャット関連型定義
│   └── screen-share.ts      # 画面共有関連型定義
└── constants/               # 定数定義
    └── config.ts           # 設定値
```

## 主要ファイルの説明

### フロントエンド

- `app.tsx`: アプリケーションのメインコンポーネント
- `components/ui/`: shadcn/uiを使用した基本UIコンポーネント
- `hooks/use-screen-share.ts`: 画面共有機能のカスタムフック
- `hooks/use-chat.ts`: チャット機能のカスタムフック
- `styles/globals.css`: Tailwind CSSを含むグローバルスタイル

### バックエンド

- `server.ts`: Honoを使用したサーバーの設定
- `api/`: APIエンドポイントの実装
- `lib/gemini.ts`: Gemini APIとの通信処理
- `db.ts`: SQLiteデータベースの設定と接続

### 共有

- `types/`: TypeScriptの型定義
- `constants/`: アプリケーション全体で使用する定数

## 設定ファイル

```
.
├── .env                      # 環境変数
├── package.json             # パッケージ設定
├── tsconfig.json           # TypeScript設定
├── vite.config.ts         # Vite設定
└── tailwind.config.js     # Tailwind CSS設定
```
