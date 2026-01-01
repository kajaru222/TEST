# Cloudinary ギャラリー セットアップガイド

## 概要

`route.html` ページに Cloudinary を使用したギャラリー機能を実装しました。日付が表示されたサムネイルをクリックすると、Cloudinary の同名フォルダ内の写真をモーダルで表示できます。

## セットアップ手順

### 1. Cloudinary の設定

`assets/js/gallery.js` ファイルを開き、以下の設定を行ってください。

```javascript
const CLOUDINARY_CONFIG = {
  cloudName: 'YOUR_CLOUD_NAME', // ← Cloudinary の Cloud Name を入力
  baseFolder: '', // ← 必要に応じてベースフォルダを指定（例: 'events'）
};
```

**Cloud Name の確認方法:**
1. [Cloudinary Dashboard](https://cloudinary.com/console) にログイン
2. 右上のアカウント情報から「Cloud Name」を確認
3. 上記の `YOUR_CLOUD_NAME` 部分に貼り付け

### 2. イベント（ギャラリー）の追加

同じく `assets/js/gallery.js` で、ギャラリーに表示したいイベントを定義します。

```javascript
const GALLERY_EVENTS = [
  {
    folder: '2024-01-15',  // Cloudinary のフォルダ名
    date: '2024.01.15',    // 表示用の日付
    title: 'イベント名',    // タイトル（オプション）
  },
  {
    folder: '2024-02-20',
    date: '2024.02.20',
    title: '新年会',
  },
  // 必要に応じて追加
];
```

### 3. Cloudinary 上の画像構造

画像は以下のような構造で Cloudinary にアップロードしてください。

```
your-cloud/
├── 2024-01-15/
│   ├── 1.jpg
│   ├── 2.jpg
│   ├── 3.jpg
│   └── ...
├── 2024-02-20/
│   ├── 1.jpg
│   ├── 2.jpg
│   └── ...
```

**重要:**
- 各フォルダ内の画像ファイル名は `1.jpg`, `2.jpg`, `3.jpg`... のように連番にしてください
- サムネイルとして表示されるのは `1.jpg` です

もし `baseFolder` を設定した場合（例: `'events'`）、構造は以下のようになります:

```
your-cloud/
└── events/
    ├── 2024-01-15/
    │   ├── 1.jpg
    │   └── 2.jpg
    └── 2024-02-20/
        ├── 1.jpg
        └── 2.jpg
```

### 4. 画像のアップロード方法

#### 方法A: Cloudinary Dashboard から手動アップロード
1. [Cloudinary Media Library](https://cloudinary.com/console/media_library) を開く
2. フォルダを作成（例: `2024-01-15`）
3. フォルダ内に画像をアップロード
4. アップロードした画像の Public ID が `2024-01-15/1`, `2024-01-15/2` となっていることを確認

#### 方法B: Cloudinary CLI を使用
```bash
# Cloudinary CLI のインストール
npm install -g cloudinary-cli

# アップロード
cld uploader upload image1.jpg --public-id 2024-01-15/1
cld uploader upload image2.jpg --public-id 2024-01-15/2
```

## カスタマイズ

### 画像の命名規則を変更したい場合

デフォルトでは `1.jpg`, `2.jpg`... という命名規則を前提としていますが、これを変更したい場合は `gallery.js` の `getImageList()` メソッドを編集してください。

例: `photo_001.jpg`, `photo_002.jpg` のような命名規則の場合:

```javascript
async getImageList(folderPath) {
  const images = [];
  for (let i = 1; i <= 20; i++) {
    const num = String(i).padStart(3, '0');
    images.push(`${folderPath}/photo_${num}`);
  }
  return images;
}
```

### JSONファイルで画像リストを管理する場合

より柔軟な管理のため、JSON ファイルで画像リストを定義することもできます。

1. `assets/data/gallery-data.json` を作成:

```json
{
  "2024-01-15": [
    "2024-01-15/img001",
    "2024-01-15/img002",
    "2024-01-15/img003"
  ],
  "2024-02-20": [
    "2024-02-20/photo1",
    "2024-02-20/photo2"
  ]
}
```

2. `gallery.js` の `getImageList()` を編集:

```javascript
async getImageList(folderPath) {
  const response = await fetch('/assets/data/gallery-data.json');
  const data = await response.json();
  return data[folderPath] || [];
}
```

## トラブルシューティング

### 画像が表示されない場合

1. **Cloud Name が正しいか確認**
   - `gallery.js` の `cloudName` 設定を確認

2. **画像が Public アクセス可能か確認**
   - Cloudinary Dashboard で画像の設定を確認
   - Upload Preset が "unsigned" または適切に設定されているか確認

3. **Public ID が正しいか確認**
   - ブラウザの開発者ツールで Network タブを開く
   - 画像の URL が正しく生成されているか確認

4. **CORS エラーが出る場合**
   - Cloudinary の設定で CORS を許可する必要があります
   - Dashboard > Settings > Security > Allowed fetch domains に自サイトのドメインを追加

### サムネイルが表示されるが、クリックしても開かない

- `gallery.js` の `getImageList()` メソッドが正しく画像リストを返しているか確認
- ブラウザのコンソールでエラーメッセージを確認

## 機能一覧

- グリッド表示（レスポンシブ対応）
- モーダルビューアー
- 画像の前後ナビゲーション（ボタン / 矢印キー）
- ESC キーでモーダルを閉じる
- 画像の遅延読み込み（lazy loading）
- Cloudinary の自動最適化（quality: auto, format: auto）

## ライセンス

このコードは煌龍園プロジェクトの一部です。
