// Cloudinary Gallery Implementation
// 使用前に CLOUDINARY_CLOUD_NAME を設定してください

const CLOUDINARY_CONFIG = {
  cloudName: 'dlgfs051q', // ← ここに Cloudinary の Cloud Name を入力
  baseFolder: '', // ← 必要に応じてベースフォルダを指定（例: 'events'）
};

// ギャラリーデータ（フォルダ名と表示日付を定義）
const GALLERY_EVENTS = [
  {
    folder: '2025-12-11',  // Cloudinary のフォルダ名
    date: '2025.12.11',    // 表示用の日付
    title: '12月11日チェキ',    // タイトル（オプション）
  },
  {
    folder: '2024-02-20',
    date: '2024.02.20',
    title: 'イベント名',
  },
  // 必要に応じてイベントを追加
];

class CloudinaryGallery {
  constructor(config, events) {
    this.config = config;
    this.events = events;
    this.currentEvent = null;
    this.currentImages = [];

    this.modal = document.getElementById('galleryModal');
    this.modalTitle = this.modal.querySelector('.gallery-modal-title');
    this.modalCounter = this.modal.querySelector('.gallery-modal-counter');
    this.modalImagesGrid = document.getElementById('modalImagesGrid');
    this.gridContainer = document.getElementById('galleryGrid');

    this.init();
  }

  init() {
    this.renderGrid();
    this.bindModalEvents();
  }

  // Cloudinary URL を生成
  getCloudinaryUrl(publicId, transformation = {}) {
    const { cloudName } = this.config;
    const transforms = [];

    if (transformation.width) transforms.push(`w_${transformation.width}`);
    if (transformation.height) transforms.push(`h_${transformation.height}`);
    if (transformation.crop) transforms.push(`c_${transformation.crop}`);
    if (transformation.quality) transforms.push(`q_${transformation.quality}`);
    if (transformation.format) transforms.push(`f_${transformation.format}`);

    const transformStr = transforms.length ? transforms.join(',') + '/' : '';

    // 拡張子がない場合は .jpg を追加
    let finalPublicId = publicId;
    if (!publicId.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      finalPublicId = `${publicId}.jpg`;
    }

    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}${finalPublicId}`;
  }

  // フォルダ内の画像リストを取得（Cloudinary Admin API使用）
  async fetchFolderImages(folderName) {
    const { cloudName, baseFolder } = this.config;
    const fullPath = baseFolder ? `${baseFolder}/${folderName}` : folderName;

    try {
      // Cloudinary の Admin API を使用する場合（要認証）
      // ここでは、画像が public_id のパターンに従っていると仮定
      // 例: events/2024-01-15/image1.jpg, events/2024-01-15/image2.jpg

      // 代替案: 画像のpublic_idを直接配列で定義する方法
      // より確実な方法として、画像リストをJSONファイルで管理することも推奨

      // デモ用: 仮の画像リストを返す（実際にはAPI呼び出しまたはJSONから取得）
      const imageList = await this.getImageList(fullPath);
      return imageList;

    } catch (error) {
      console.error('Failed to fetch images:', error);
      return [];
    }
  }

  // 画像リストを取得（カスタマイズ可能）
  async getImageList(folderPath) {
    // 方法1: Cloudinary Search API を使用（要API Key）
    // 方法2: 画像リストを JSON ファイルで管理
    // 方法3: 固定の命名規則で画像をループ（例: image_1.jpg, image_2.jpg...）

    const maxImages = 30; // 試行する最大枚数

    // 並列で画像の存在をチェック（高速化）
    const checkPromises = [];
    for (let i = 1; i <= maxImages; i++) {
      const imageId = `${folderPath}/${i}`;
      checkPromises.push(
        this.checkImageExists(imageId).then(exists => ({ index: i, imageId, exists }))
      );
    }

    // すべてのチェックを並列実行
    const results = await Promise.all(checkPromises);

    // 存在する画像のみをフィルタリング
    const images = results
      .filter(r => r.exists)
      .sort((a, b) => a.index - b.index)
      .map(r => r.imageId);

    return images;
  }

  // 画像が存在するかチェック
  async checkImageExists(imageId) {
    const testUrl = this.getCloudinaryUrl(imageId, {
      width: 10,
      height: 10,
    });

    try {
      const response = await fetch(testUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // グリッドをレンダリング
  async renderGrid() {
    this.gridContainer.innerHTML = '';

    for (const event of this.events) {
      const item = this.createGridItem(event);
      this.gridContainer.appendChild(item);
    }
  }

  // グリッドアイテムを作成
  createGridItem(event) {
    const { cloudName, baseFolder } = this.config;
    const fullPath = baseFolder ? `${baseFolder}/${event.folder}` : event.folder;

    // 代表画像（1枚目）のサムネイル
    const thumbnailUrl = this.getCloudinaryUrl(`${fullPath}/1`, {
      width: 600,
      height: 450,
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
    });

    console.log('Thumbnail URL:', thumbnailUrl); // デバッグ用

    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `
      <img class="gallery-item-image" src="${thumbnailUrl}" alt="${event.date}" />
      <div class="gallery-item-overlay">
        <p class="gallery-item-date">${event.date}</p>
        ${event.title ? `<p class="gallery-item-count">${event.title}</p>` : ''}
      </div>
    `;

    const img = item.querySelector('.gallery-item-image');

    // 画像読み込み成功時
    img.addEventListener('load', () => {
      console.log('Image loaded successfully:', thumbnailUrl);
    });

    // 画像読み込みエラー時
    img.addEventListener('error', () => {
      console.error('Failed to load image:', thumbnailUrl);
      // エラー時はプレースホルダーを表示
      item.style.background = 'var(--panel)';
      img.style.display = 'none';
    });

    item.addEventListener('click', () => this.openGallery(event));

    return item;
  }

  // ギャラリーを開く
  async openGallery(event) {
    this.currentEvent = event;

    // モーダルを先に表示（ローディング状態）
    this.showModal();
    this.modalTitle.textContent = this.currentEvent.title || this.currentEvent.date;
    this.modalCounter.textContent = '読み込み中...';
    this.modalImagesGrid.innerHTML = '<div class="gallery-loading">画像を読み込んでいます...</div>';

    // 画像リストを非同期で取得
    const allImages = await this.fetchFolderImages(event.folder);

    // 1枚目（表紙）を除いた2枚目以降の画像を取得
    this.currentImages = allImages.slice(1);

    if (this.currentImages.length === 0) {
      this.modalImagesGrid.innerHTML = '<div class="gallery-empty">ギャラリー画像が見つかりませんでした。</div>';
      return;
    }

    this.renderModalImages();
  }

  // モーダルを表示
  showModal() {
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  // モーダルを非表示
  hideModal() {
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    this.modalImagesGrid.innerHTML = '';
  }

  // モーダル内に画像グリッドを表示
  renderModalImages() {
    this.modalTitle.textContent = this.currentEvent.title || this.currentEvent.date;
    this.modalCounter.textContent = `${this.currentImages.length}枚の写真`;

    this.modalImagesGrid.innerHTML = '';

    this.currentImages.forEach((imageId, index) => {
      const item = this.createModalGridItem(imageId, index);
      this.modalImagesGrid.appendChild(item);
    });
  }

  // モーダルグリッドアイテムを作成
  createModalGridItem(imageId, index) {
    const imageUrl = this.getCloudinaryUrl(imageId, {
      width: 500,
      height: 667,
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
    });

    const item = document.createElement('div');
    item.className = 'gallery-modal-grid-item';
    item.innerHTML = `
      <img class="gallery-modal-grid-image" src="${imageUrl}" alt="写真 ${index + 1}" loading="lazy" />
      <div class="gallery-modal-grid-loader"></div>
    `;

    const img = item.querySelector('.gallery-modal-grid-image');

    // 画像読み込みエラー時は非表示
    img.addEventListener('error', () => {
      item.style.display = 'none';
    });

    // クリックで拡大表示（オプション）
    item.addEventListener('click', () => {
      this.showFullscreenImage(imageId);
    });

    return item;
  }

  // 画像を拡大表示
  showFullscreenImage(imageId) {
    // 現在の画像のインデックスを取得
    const currentIndex = this.currentImages.indexOf(imageId);
    if (currentIndex === -1) return;

    const fullImageUrl = this.getCloudinaryUrl(imageId, {
      width: 1920,
      quality: 'auto',
      format: 'auto',
    });

    // フルスクリーンビューアーを作成
    const fullscreen = document.createElement('div');
    fullscreen.className = 'gallery-fullscreen active';
    fullscreen.innerHTML = `
      <img class="gallery-fullscreen-image" src="${fullImageUrl}" alt="拡大画像" />
      <button class="gallery-fullscreen-close" aria-label="閉じる">&times;</button>
      <button class="gallery-fullscreen-prev" aria-label="前へ">&#8249;</button>
      <button class="gallery-fullscreen-next" aria-label="次へ">&#8250;</button>
      <div class="gallery-fullscreen-counter">${currentIndex + 1} / ${this.currentImages.length}</div>
    `;

    document.body.appendChild(fullscreen);

    let currentFullscreenIndex = currentIndex;

    const updateFullscreenImage = (index) => {
      const newImageId = this.currentImages[index];
      const newImageUrl = this.getCloudinaryUrl(newImageId, {
        width: 1920,
        quality: 'auto',
        format: 'auto',
      });

      const img = fullscreen.querySelector('.gallery-fullscreen-image');
      const counter = fullscreen.querySelector('.gallery-fullscreen-counter');

      img.src = newImageUrl;
      counter.textContent = `${index + 1} / ${this.currentImages.length}`;
      currentFullscreenIndex = index;
    };

    const showPrevImage = () => {
      const newIndex = (currentFullscreenIndex - 1 + this.currentImages.length) % this.currentImages.length;
      updateFullscreenImage(newIndex);
    };

    const showNextImage = () => {
      const newIndex = (currentFullscreenIndex + 1) % this.currentImages.length;
      updateFullscreenImage(newIndex);
    };

    const closeFullscreen = () => {
      fullscreen.classList.remove('active');
      setTimeout(() => fullscreen.remove(), 300);
    };

    fullscreen.querySelector('.gallery-fullscreen-close').addEventListener('click', closeFullscreen);
    fullscreen.querySelector('.gallery-fullscreen-prev').addEventListener('click', showPrevImage);
    fullscreen.querySelector('.gallery-fullscreen-next').addEventListener('click', showNextImage);

    fullscreen.addEventListener('click', (e) => {
      if (e.target === fullscreen) closeFullscreen();
    });

    // キーボード操作
    const handleKeydown = (e) => {
      if (e.key === 'Escape') closeFullscreen();
      if (e.key === 'ArrowLeft') showPrevImage();
      if (e.key === 'ArrowRight') showNextImage();
    };

    document.addEventListener('keydown', handleKeydown);

    // クリーンアップ時にイベントリスナーを削除
    const originalClose = closeFullscreen;
    const closeWithCleanup = () => {
      document.removeEventListener('keydown', handleKeydown);
      originalClose();
    };

    fullscreen.querySelector('.gallery-fullscreen-close').removeEventListener('click', closeFullscreen);
    fullscreen.querySelector('.gallery-fullscreen-close').addEventListener('click', closeWithCleanup);
    fullscreen.removeEventListener('click', (e) => {
      if (e.target === fullscreen) closeFullscreen();
    });
    fullscreen.addEventListener('click', (e) => {
      if (e.target === fullscreen) closeWithCleanup();
    });
  }

  // モーダルイベントをバインド
  bindModalEvents() {
    const closeBtn = this.modal.querySelector('.gallery-modal-close');
    const overlay = this.modal.querySelector('.gallery-modal-overlay');

    closeBtn.addEventListener('click', () => this.hideModal());
    overlay.addEventListener('click', () => this.hideModal());

    // キーボード操作（ESCで閉じる）
    document.addEventListener('keydown', (e) => {
      if (this.modal.getAttribute('aria-hidden') === 'false') {
        if (e.key === 'Escape') this.hideModal();
      }
    });
  }
}

// 初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new CloudinaryGallery(CLOUDINARY_CONFIG, GALLERY_EVENTS);
  });
} else {
  new CloudinaryGallery(CLOUDINARY_CONFIG, GALLERY_EVENTS);
}
