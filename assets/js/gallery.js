// Cloudinary Gallery Implementation
// 画像リストは assets/data/gallery-images.json で管理されています

const CLOUDINARY_CONFIG = {
  cloudName: 'dlgfs051q',
  baseFolder: '',
  imagesDataPath: 'assets/data/gallery-images.json'
};

class CloudinaryGallery {
  constructor(config) {
    this.config = config;
    this.events = [];
    this.currentEvent = null;
    this.currentImages = [];
    this.lastActiveElement = null;
    this.focusCleanup = null;

    this.modal = document.getElementById('galleryModal');
    this.modalTitle = this.modal.querySelector('.gallery-modal-title');
    this.modalCounter = this.modal.querySelector('.gallery-modal-counter');
    this.modalImagesGrid = document.getElementById('modalImagesGrid');
    this.gridContainer = document.getElementById('galleryGrid');

    this.init();
  }

  createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined && text !== null) el.textContent = text;
    return el;
  }

  async init() {
    await this.loadGalleryData();
    this.renderGrid();
    this.bindModalEvents();
  }

  // JSONファイルから画像データを読み込む
  async loadGalleryData() {
    try {
      const response = await fetch(this.config.imagesDataPath);
      if (!response.ok) {
        throw new Error('Failed to load gallery data');
      }
      const data = await response.json();
      this.events = data.events || [];
    } catch (error) {
      console.error('Error loading gallery data:', error);
      this.events = [];
    }
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

  // フォルダ内の画像リストを取得（JSONから読み込み）
  async fetchFolderImages(folderName) {
    try {
      // JSONデータから該当するイベントを検索
      const event = this.events.find(e => e.folder === folderName);

      if (!event || !event.images) {
        console.warn(`No images found for folder: ${folderName}`);
        return [];
      }

      return event.images;
    } catch (error) {
      console.error('Failed to fetch images:', error);
      return [];
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
    // 代表画像（1枚目）のサムネイル
    const firstImage = event.images && event.images.length > 0 ? event.images[0] : null;

    if (!firstImage) {
      console.warn(`No images for event: ${event.folder}`);
      return document.createElement('div'); // 空要素を返す
    }

    const thumbnailUrl = this.getCloudinaryUrl(firstImage, {
      width: 600,
      height: 450,
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
    });

    const item = this.createEl('div', 'gallery-item');
    const img = this.createEl('img', 'gallery-item-image');
    img.src = thumbnailUrl;
    img.alt = event.date || 'ギャラリー画像';

    const overlay = this.createEl('div', 'gallery-item-overlay');
    const dateEl = this.createEl('p', 'gallery-item-date', event.date || '');
    overlay.appendChild(dateEl);
    if (event.title) {
      const titleEl = this.createEl('p', 'gallery-item-count', event.title);
      overlay.appendChild(titleEl);
    }

    item.appendChild(img);
    item.appendChild(overlay);

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
    this.lastActiveElement = document.activeElement;
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (this.focusCleanup) this.focusCleanup();
    this.focusCleanup = this.trapFocus(this.modal);
    const focusTarget = this.modal.querySelector('.gallery-modal-close') || this.modal.querySelector('.gallery-modal-content');
    if (focusTarget && typeof focusTarget.focus === 'function') {
      focusTarget.focus();
    }
  }

  // モーダルを非表示
  hideModal() {
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    this.modalImagesGrid.innerHTML = '';
    if (this.focusCleanup) {
      this.focusCleanup();
      this.focusCleanup = null;
    }
    if (this.lastActiveElement && typeof this.lastActiveElement.focus === 'function') {
      this.lastActiveElement.focus();
    }
  }

  // フォーカストラップ
  trapFocus(container) {
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');
    const focusable = Array.from(container.querySelectorAll(focusableSelector));
    if (!focusable.length) return () => {};
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const onKeydown = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    container.addEventListener('keydown', onKeydown);
    return () => container.removeEventListener('keydown', onKeydown);
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

    const item = this.createEl('div', 'gallery-modal-grid-item');
    const img = this.createEl('img', 'gallery-modal-grid-image');
    img.src = imageUrl;
    img.alt = `写真 ${index + 1}`;
    img.loading = 'lazy';

    const loader = this.createEl('div', 'gallery-modal-grid-loader');

    item.appendChild(img);
    item.appendChild(loader);

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
    const fullscreen = this.createEl('div', 'gallery-fullscreen active');
    fullscreen.tabIndex = -1;

    const image = this.createEl('img', 'gallery-fullscreen-image');
    image.src = fullImageUrl;
    image.alt = '拡大画像';

    const closeBtn = this.createEl('button', 'gallery-fullscreen-close', '×');
    closeBtn.setAttribute('aria-label', '閉じる');

    const prevBtn = this.createEl('button', 'gallery-fullscreen-prev', '‹');
    prevBtn.setAttribute('aria-label', '前へ');

    const nextBtn = this.createEl('button', 'gallery-fullscreen-next', '›');
    nextBtn.setAttribute('aria-label', '次へ');

    const counter = this.createEl(
      'div',
      'gallery-fullscreen-counter',
      `${currentIndex + 1} / ${this.currentImages.length}`
    );

    fullscreen.appendChild(image);
    fullscreen.appendChild(closeBtn);
    fullscreen.appendChild(prevBtn);
    fullscreen.appendChild(nextBtn);
    fullscreen.appendChild(counter);

    document.body.appendChild(fullscreen);

    let currentFullscreenIndex = currentIndex;
    const lastActive = document.activeElement;
    if (closeBtn) closeBtn.focus();
    const fullscreenFocusCleanup = this.trapFocus(fullscreen);

    const updateFullscreenImage = (index) => {
      const newImageId = this.currentImages[index];
      const newImageUrl = this.getCloudinaryUrl(newImageId, {
        width: 1920,
        quality: 'auto',
        format: 'auto',
      });

      image.src = newImageUrl;
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

    prevBtn.addEventListener('click', showPrevImage);
    nextBtn.addEventListener('click', showNextImage);

    // キーボード操作
    let closeWithCleanup = () => {};
    const handleKeydown = (e) => {
      if (e.key === 'Escape') closeWithCleanup();
      if (e.key === 'ArrowLeft') showPrevImage();
      if (e.key === 'ArrowRight') showNextImage();
    };

    document.addEventListener('keydown', handleKeydown);

    // クリーンアップ時にイベントリスナーを削除
    const originalClose = closeFullscreen;
    closeWithCleanup = () => {
      document.removeEventListener('keydown', handleKeydown);
      fullscreenFocusCleanup();
      originalClose();
      if (lastActive && typeof lastActive.focus === 'function') {
        lastActive.focus();
      }
    };

    closeBtn.addEventListener('click', closeWithCleanup);
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
    new CloudinaryGallery(CLOUDINARY_CONFIG);
  });
} else {
  new CloudinaryGallery(CLOUDINARY_CONFIG);
}
