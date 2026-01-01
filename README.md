# KohLongEnn Site (TEST)

このフォルダをそのまま GitHub リポジトリ「TEST」の直下に配置してデプロイできます。

## Netlify 設定
- Publish directory: `/`
- Build command: (なし)

## ページ
- `/index.html` TOP（横スクロール + Hero演出 + Cast横スライド）
- `/cast.html` 龍紹介（選択 + 右ドロワー詳細）
- `/story.html` 龍の小噺（Tumblr RSSをNetlify Functions経由で取得）

## Tumblr RSS
`netlify/functions/tumblr.js` を使っています。Git連携デプロイ推奨。
