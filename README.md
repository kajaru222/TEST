# 煌龍園 (KohLongEnn) 公式サイト

龍をテーマにした高級感あふれる喫茶店「煌龍園」の公式ウェブサイトです。
深紅×ゴールドの中華風高級パレットと、yui540スタイルのエレガントなアニメーションが特徴です。

## ✨ 特徴

- 🎨 **高級感のあるデザイン**: 深紅×ゴールドの中華風カラーパレット
- ⚡ **パフォーマンス最適化**: WebP画像、レスポンシブ対応、preload活用
- 💫 **エレガントなアニメーション**: yui540スタイルのスクロール連動アニメーション
- ♿ **アクセシビリティ対応**: セマンティックHTML、ARIA属性、キーボードナビゲーション
- 🔒 **セキュリティ**: CSP、セキュリティヘッダー完備
- 📱 **レスポンシブ**: モバイル・タブレット・デスクトップ完全対応

## 📁 ページ構成

- `index.html` - トップページ（ヒーローセクション、コンセプト、キャスト紹介、アクセス）
- `intro.html` - はじめに（世界観の紹介）
- `about.html` - カフェについて
- `cast.html` - 龍紹介（キャスト詳細ページ）
- `stories.html` - 龍の小噺（Tumblr連携）
- `gallery.html` - 龍の追憶（Cloudinaryギャラリー）
- `access.html` - アクセス・お問い合わせ

## 🛠 技術スタック

### フロントエンド
- **HTML5** - セマンティックマークアップ
- **CSS3** - カスタムプロパティ、アニメーション、グリッドレイアウト
- **JavaScript (ES6+)** - モジュラー設計、非同期処理
- **GSAP** - スクロールアニメーション (ScrollTrigger)

### バックエンド・インフラ
- **Netlify** - ホスティング、サーバーレス関数
- **Netlify Functions** - Tumblr RSS取得用プロキシ
- **Cloudinary** - 画像ホスティング・配信

### 画像最適化
- **WebP** - 次世代画像フォーマット
- **Sharp** - 画像変換・最適化ツール
- **Responsive Images** - srcset、sizes属性による最適配信

### フォント
- **Google Fonts** - Cormorant Garamond, Cinzel
- **カスタムフォント** - 装甲明朝 (Soukou Mincho)

## 🚀 セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/kajaru222/TEST.git
cd TEST
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. ローカルで確認

静的サイトなので、ローカルサーバーで開くだけで動作します:

```bash
# Python 3の場合
python -m http.server 8000

# Node.jsのhttpサーバーの場合
npx http-server
```

ブラウザで `http://localhost:8000` を開いてください。

### 4. Netlify Functionsのローカルテスト

```bash
netlify dev
```

## 📸 画像最適化の方法

### WebP変換スクリプト

元画像（PNG/JPG）をWebPに変換し、レスポンシブサイズを生成:

```bash
# 単一画像を変換
npx sharp-cli --input original.png --output image-{size}.webp \
  resize 480 --webp

# 複数サイズを一括生成
for size in 480 800 1024 1920; do
  npx sharp-cli --input original.png \
    --output image-${size}w.webp \
    --resize ${size} --webp --quality 85
done
```

### 推奨サイズ
- モバイル: 480w
- タブレット: 800w
- デスクトップ: 1024w
- 大画面: 1920w

## 🌐 Netlify デプロイ設定

### 基本設定
- **Publish directory**: `/`（ルートディレクトリ）
- **Build command**: なし（静的サイト）
- **Functions directory**: `netlify/functions`

### 環境変数

Netlify管理画面で以下を設定してください:

- `TUMBLR_BLOG_NAME` - Tumblrブログ名（例: kohlongenn）

### デプロイ方法

1. GitHub連携でNetlifyにリポジトリを接続
2. 上記設定を入力
3. 「Deploy site」をクリック

または、Netlify CLIを使用:

```bash
# Netlify CLIをインストール
npm install -g netlify-cli

# ログイン
netlify login

# デプロイ
netlify deploy --prod
```

## 🗂 ディレクトリ構造

```
.
├── assets/
│   ├── css/           # スタイルシート
│   │   ├── style.css      # ベーススタイル
│   │   ├── animations.css # yui540アニメーション
│   │   ├── index.css      # トップページ
│   │   ├── cast.css       # キャストページ
│   │   └── ...
│   ├── js/            # JavaScript
│   │   ├── main.js        # メイン処理
│   │   ├── common-parts.js # ヘッダー・フッター
│   │   ├── page-transition.js # ページ遷移
│   │   ├── image-utils.js  # 画像ユーティリティ
│   │   └── ...
│   ├── img/           # 画像アセット
│   │   ├── dragons/   # 龍の画像
│   │   ├── flowers/   # 装飾用花
│   │   └── ...
│   └── data/          # データファイル
│       └── gallery-images.json # ギャラリー画像データ
├── netlify/
│   └── functions/     # サーバーレス関数
│       └── tumblr.js  # Tumblr RSSプロキシ
├── netlify.toml       # Netlify設定
├── package.json       # 依存関係
└── README.md          # このファイル
```

## 🎨 カスタマイズ

### カラーパレット変更

`assets/css/style.css` の `:root` セクションでカラー変数を変更:

```css
:root {
  --accent: #C93545;      /* メインアクセント色 */
  --gold: #D4AF37;        /* ゴールド */
  --bg: #2A0E12;          /* 背景色 */
  /* ... */
}
```

### アニメーション調整

`assets/css/animations.css` でイージングやタイミングを調整:

```css
:root {
  --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
  --ease-luxe: cubic-bezier(0.16, 1, 0.3, 1);
  /* ... */
}
```

## 🐛 トラブルシューティング

### Tumblr RSSが表示されない

1. Netlify Functionsがデプロイされているか確認
2. 環境変数 `TUMBLR_BLOG_NAME` が設定されているか確認
3. ブラウザの開発者ツールでエラーを確認

### 画像が表示されない

1. WebPに変換されているか確認
2. ファイル名が正しいか確認（例: `image-480w.webp`）
3. ブラウザがWebPをサポートしているか確認

### アニメーションが動かない

1. JavaScriptエラーがないか確認
2. GSAPライブラリが読み込まれているか確認
3. `prefers-reduced-motion` 設定を確認

## 📝 ライセンス

このプロジェクトは個人利用を目的としています。

©SQUARE ENIX
記載されている会社名・製品名・システム名などは、各社の商標、または登録商標です。

## 🤝 コントリビューション

バグ報告や改善提案は [Issues](https://github.com/kajaru222/TEST/issues) までお願いします。

## 📞 お問い合わせ

- **X (Twitter)**: [@ll_KohLongEnn](https://x.com/ll_KohLongEnn)
- **お問い合わせフォーム**: https://5ne.co/0jvu
