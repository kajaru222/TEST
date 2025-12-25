# KohLongEnn 静的サイト（Studio移植用）

## できたもの
- `index.html` … 1ページ完結（セクションに分割）
- `assets/img` … 画像置き場
- `assets/css/style.css` … デザイン
- `assets/js/main.js` … スマホ用メニューなど

## 更新のしかた（おすすめ）
1. GitHub上で `index.html` の各セクションを書き換える
2. 画像を差し替える場合は `assets/img` に追加し、HTML内のパスを変更
3. 公開先（Netlify / GitHub Pages など）が自動デプロイなら、そのまま反映

## よく触る場所
- ヘッダーメニュー：`<nav class="site-nav"> ... </nav>`
- ヒーロー文言：`<section class="hero"> ... </section>`
- メールアドレス：`mailto:example@example.com` を差し替え

## 注意
- 画像は大きいので、必要ならWebP化/圧縮を推奨（表示はそのままでも動きます）
