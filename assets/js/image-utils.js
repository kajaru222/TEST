/**
 * Image utility functions for responsive WebP images
 * 画像の軽量化とレスポンシブ対応のためのユーティリティ関数
 */
window.ImageUtils = {
  /**
   * Convert image path to WebP with size suffix
   * @param {string} path - Original image path (with or without extension)
   * @param {string} size - Size suffix (e.g., '480w', '800w', '1024w')
   * @returns {string} WebP path
   */
  toWebP(path, size) {
    if (!path) return '';

    // Remove extension if present
    const base = path.replace(/\.(png|jpg|jpeg)$/i, '');

    return `${base}-${size}.webp`;
  },

  /**
   * Generate srcset string for responsive images
   * @param {string} basePath - Base image path (without extension)
   * @param {string[]} sizes - Array of size suffixes (e.g., ['480w', '800w'])
   * @returns {string} srcset attribute value
   */
  generateSrcset(basePath, sizes) {
    if (!basePath || !Array.isArray(sizes) || sizes.length === 0) {
      return '';
    }

    return sizes
      .map(size => `${basePath}-${size}.webp ${size}`)
      .join(', ');
  },

  /**
   * Get appropriate sizes attribute for image type
   * @param {string} type - Image type ('portrait', 'icon', 'flower', 'card', 'background')
   * @returns {string} sizes attribute value
   */
  getSizesAttr(type) {
    const sizeMap = {
      portrait: '(max-width: 768px) 480px, 800px',
      icon: '160px',
      flower: '(max-width: 768px) 320px, 640px',
      card: '(max-width: 768px) 400px, 600px',
      background: '100vw',
      logo: '44px'
    };

    return sizeMap[type] || '100vw';
  },

  /**
   * Set responsive image attributes on an img element
   * @param {HTMLImageElement} img - Image element
   * @param {string} basePath - Base image path (without extension)
   * @param {string[]} sizes - Array of size suffixes
   * @param {string} type - Image type for sizes attribute
   * @param {string} defaultSize - Default size to use as src (e.g., '800w')
   */
  setResponsiveImage(img, basePath, sizes, type, defaultSize) {
    if (!img || !basePath) return;

    // Remove extension from base path
    const cleanBase = basePath.replace(/\.(png|jpg|jpeg)$/i, '');

    // Set srcset
    img.srcset = this.generateSrcset(cleanBase, sizes);

    // Set sizes
    img.sizes = this.getSizesAttr(type);

    // Set fallback src
    img.src = this.toWebP(cleanBase, defaultSize || sizes[sizes.length - 1]);
  },

  /**
   * Preload responsive image
   * @param {string} basePath - Base image path
   * @param {string} size - Primary size to preload
   * @param {string} [media] - Optional media query for responsive preload
   */
  preloadImage(basePath, size, media) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = this.toWebP(basePath, size);

    if (media) {
      link.media = media;
    }

    document.head.appendChild(link);
  },

  /**
   * Check if browser supports WebP
   * @returns {Promise<boolean>}
   */
  async supportsWebP() {
    if (this._webpSupport !== undefined) {
      return this._webpSupport;
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this._webpSupport = img.width === 1 && img.height === 1;
        resolve(this._webpSupport);
      };
      img.onerror = () => {
        this._webpSupport = false;
        resolve(false);
      };
      img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
    });
  }
};

// Auto-check WebP support on load
if (typeof document !== 'undefined') {
  ImageUtils.supportsWebP().then(supported => {
    if (supported) {
      console.log('✓ WebP supported');
    } else {
      console.warn('⚠ WebP not supported, using fallback images');
    }
  });
}
