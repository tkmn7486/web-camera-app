# WebCamera

プロフェッショナルなブラウザベースカメラアプリ。Next.js、React、Tailwind CSSで構築されています。

## 主な機能

- 📱 **PWA対応**: スマートフォンやPCにアプリとしてインストール可能
- 📸 高品質な写真撮影
- 🔍 ズーム機能（1x〜3x）
- 📐 グリッド線と水平線の表示
- 📷 複数カメラの切り替え対応
- 🖼️ 撮影した写真のIndexedDB保存（大容量対応）
- ⏰ 遅延撮影モード（1秒前のフレームを記録）
- 🎨 シンプルでモダンなUI

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **UIライブラリ**: React 19
- **スタイリング**: Tailwind CSS 4
- **UIコンポーネント**: Radix UI
- **型安全性**: TypeScript

## セットアップ

### 必要要件

- Node.js 22以上
- npm、yarn、pnpm、またはbun

### インストール

```bash
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて結果を確認できます。

### ビルド

```bash
npm run build
```

### 本番環境で起動

```bash
npm run start
```

## Netlifyへのデプロイ

### 方法1: Netlify自動検出（推奨）

1. **GitHubにリポジトリをプッシュ**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Netlifyで新しいサイトを作成**
   - [Netlify](https://www.netlify.com/)にアクセスしてログイン
   - 「Add new site」→「Import an existing project」をクリック
   - GitHubアカウントを連携（初回のみ）
   - デプロイしたいリポジトリを選択
   - 「Deploy site」をクリック

3. **自動設定**
   - Next.js 16の場合、Netlifyが自動的に設定を検出
   - ビルドコマンド: `npm run build`
   - 公開ディレクトリ: 自動設定

### 方法2: Netlify CLI

```bash
# Netlify CLIをインストール
npm install -g netlify-cli

# ログイン
netlify login

# サイトを初期化
netlify init

# デプロイ
netlify deploy --prod
```

### 環境変数（必要に応じて）

Netlifyダッシュボード → Site settings → Environment variables から環境変数を設定できます。

## PWAとしてインストール

このアプリはPWA（Progressive Web App）対応しており、デバイスにアプリとしてインストールできます。

### iOS (Safari)

1. Safariでアプリを開く
2. 画面下部の共有ボタン（□↑）をタップ
3. 「ホーム画面に追加」を選択
4. 「追加」をタップ

### Android (Chrome/Edge)

1. ブラウザでアプリを開く
2. 画面下部に表示される「インストール」バナーをタップ
3. または、メニュー（⋮）から「アプリをインストール」を選択

### PC (Chrome/Edge)

1. ブラウザでアプリを開く
2. アドレスバーの右側に表示される「インストール」アイコンをクリック
3. 「インストール」をクリック

インストール後は、ネイティブアプリのように起動できます。

### PWAアイコンの作成

PWAとしてインストールするには、アイコン画像が必要です。以下のサイズのアイコンを作成して`public`ディレクトリに配置してください：

- `icon-192.png` - 192x192px
- `icon-512.png` - 512x512px

アイコン作成ツール:
- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Canva](https://www.canva.com/) など

## カメラアクセスの許可

このアプリはブラウザのカメラAPIを使用します。初回起動時にブラウザからカメラへのアクセス許可を求められる場合があります。

### カメラが利用できない場合

1. ブラウザの設定を確認してください
2. 他のアプリケーションがカメラを使用していないか確認してください
3. カメラが正しく接続されているか確認してください

## データ保存について

このアプリは撮影した写真を**IndexedDB**（ブラウザ内のデータベース）に保存します。

- **大容量対応**: localStorageとは異なり、IndexedDBは通常数百MB〜数GBの容量が利用可能
- **高速アクセス**: ローカルストレージに保存されるため、オフラインでもアクセス可能
- **プライバシー**: すべてのデータは端末内に保存され、外部には送信されません

### 写真のダウンロード

ギャラリー画面で各写真をクリックし、「ダウンロード」ボタンから写真を端末の保存フォルダにダウンロードできます。

## ライセンス

MIT License

## 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/)
