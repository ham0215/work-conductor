# Admin Web

Work Conductor の管理コンソールアプリケーション。React + TypeScript + Vite で構築されています。

## 必要条件

- Node.js 20+
- npm

## ローカル開発環境のセットアップ

### 1. 依存関係のインストール

```bash
cd apps/admin-web
npm install
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env.local` を作成します：

```bash
cp .env.example .env.local
```

#### モック認証モード（Firebase不要）

Firebase の設定なしで開発を始めるには、モック認証モードを有効にします：

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_ENVIRONMENT=development
VITE_AUTH_MOCK_ENABLED=true
```

このモードでは：
- 自動的にモック管理者ユーザーとしてログインされます
- 黄色いバナーで「Mock Authentication Mode」と表示されます
- Firebase の設定は不要です

#### 本番認証モード（Firebase必須）

実際の Firebase 認証を使用する場合：

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_ENVIRONMENT=development
VITE_AUTH_MOCK_ENABLED=false
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### 3. HTTPS の設定（オプション）

ローカル開発で HTTPS を使用するには、mkcert で証明書を生成します。

#### mkcert のインストール

```bash
# macOS
brew install mkcert

# mkcert のルート CA をインストール（初回のみ）
mkcert -install
```

#### 証明書の生成

```bash
cd apps/admin-web
mkdir -p certs
cd certs
mkcert localhost 127.0.0.1 ::1
```

これにより `certs/` ディレクトリに以下のファイルが作成されます：
- `localhost+2.pem` - 証明書
- `localhost+2-key.pem` - 秘密鍵

証明書が存在する場合、開発サーバーは自動的に HTTPS で起動します。

### 4. 開発サーバーの起動

```bash
npm run dev
```

アクセス URL：
- HTTP: http://localhost:5173/ （証明書がない場合）
- HTTPS: https://localhost:5173/ （証明書がある場合）

## 利用可能なスクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | プロダクションビルド |
| `npm run preview` | ビルド結果をプレビュー |
| `npm run lint` | ESLint でコードをチェック |
| `npm run lint:fix` | ESLint で自動修正 |
| `npm run format` | Prettier でフォーマット |
| `npm run format:check` | フォーマットをチェック |
| `npm run test` | テストをウォッチモードで実行 |
| `npm run test:run` | テストを1回実行 |
| `npm run test:coverage` | カバレッジ付きでテスト実行 |

## ディレクトリ構成

```
src/
├── components/       # 再利用可能なコンポーネント
│   ├── settings/     # 設定関連のコンポーネント
│   └── users/        # ユーザー関連のコンポーネント
├── contexts/         # React Context（認証など）
├── hooks/            # カスタムフック
├── pages/            # ページコンポーネント
│   ├── tenants/      # テナント管理ページ
│   └── users/        # ユーザー管理ページ
├── services/         # 外部サービス連携（Firebase等）
├── types/            # TypeScript 型定義
└── utils/            # ユーティリティ関数
```
