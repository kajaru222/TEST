/**
 * Common Parts Loader (Header & Footer)
 * 
 * 共通パーツ（ヘッダー、フッター）を各ページに動的に挿入します。
 * メンテナンス性を向上させるためのスクリプトです。
 */

(function () {
  'use strict';

  // --- HTML Templates ---

  // NOTE: Logo is unified to logo-88w.webp for consistency/performance.
  // NOTE: The 'active' class on links is not strictly needed as CSS handles hover/focus,
  // but if needed, we can implement active state logic based on current URL.

  const HEADER_HTML = `
    <div class="container header-inner">
      <a class="brand" href="index.html" aria-label="煌龍園 トップへ">
        <img srcset="assets/img/logo-88w.webp 1x, assets/img/logo-180w.webp 2x" src="assets/img/logo-88w.webp"
          alt="煌龍園 ロゴ" width="44" height="44" />
      </a>

      <button class="nav-toggle" type="button" aria-controls="site-nav" aria-expanded="false">
        <span class="nav-toggle-bar"></span>
        <span class="nav-toggle-bar"></span>
        <span class="nav-toggle-bar"></span>
        <span class="sr-only">メニュー</span>
      </button>

      <nav class="site-nav" id="site-nav" aria-label="グローバルナビゲーション">
        <button class="nav-close" id="navClose" type="button" aria-label="メニューを閉じる">
          <span class="nav-close-icon">×</span>
        </button>
        <a href="index.html">入口</a>
        <a href="intro.html">はじめに</a>
        <a href="about.html">カフェについて</a>
        <a href="cast.html">龍紹介</a>
        <a href="stories.html">龍の小噺</a>
        <a href="gallery.html">龍の追憶</a>
        <a href="access.html">アクセス</a>
        <a href="https://5ne.co/0jvu" target="_blank" rel="noopener">問い合わせ</a>
      </nav>
    </div>
  `;

  const FOOTER_HTML = `
    <div class="container footer-inner">
      <div class="footer-brand">
        <img src="assets/img/logo-88w.webp" alt="" width="36" height="36" loading="lazy" />
        <div>
          <div class="footer-title">煌龍園 | KohLongEnn</div>
          <div class="footer-note">©SQUARE ENIX<br>記載されている会社名・製品名・システム名などは、各社の商標、または登録商標です。</div>
        </div>
      </div>

      <a class="to-top" href="#top">▲ Top</a>
    </div>
  `;

  // --- Insertion Logic ---

  function insertComponent(selector, html) {
    const el = document.querySelector(selector);
    if (el) {
      el.innerHTML = html;
      initNavScript();
    }
  }

  // We need to re-initialize the nav toggle script (main.js) logic 
  // because the elements are newly added to DOM.
  // Since main.js runs on DOMContentLoaded (or IIFE), it might miss these if we inject them later?
  // Actually, main.js is defer. This script (common-parts.js) should also be defer.
  // If common-parts.js runs BEFORE main.js, main.js will find the elements.
  // We will ensure common-parts.js is loaded BEFORE main.js.

  function applyActiveLink() {
    const nav = document.getElementById('site-nav');
    if (!nav) return;

    // Get current filename
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';

    const links = nav.querySelectorAll('a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href === page) {
        link.classList.add('active');
      }
    });
  }

  // Expose initialization if needed, but we run immediately if possible

  // Find placeholders
  // We assume the HTML has <header class="site-header" id="top"></header> empty
  // OR we replace content.

  // Since we are transitioning from hardcoded, we will setup the placeholders in HTML first.

  const header = document.querySelector('.site-header');
  if (header && !header.innerHTML.trim().length) {
    // Only inject if empty (allows override if needed)
    header.innerHTML = HEADER_HTML;
  } else if (header && header.hasAttribute('data-auto-header')) {
    header.innerHTML = HEADER_HTML;
  }

  const footer = document.querySelector('.site-footer');
  if (footer && !footer.innerHTML.trim().length) {
    footer.innerHTML = FOOTER_HTML;
  } else if (footer && footer.hasAttribute('data-auto-footer')) {
    footer.innerHTML = FOOTER_HTML;
  }

  applyActiveLink();

})();
