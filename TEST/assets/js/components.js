/**
 * Shared UI Components
 * Header and Footer HTML templates
 */

(() => {
  'use strict';

  // Header component
  const HEADER_HTML = `
    <a class="skip" href="#main">本文へスキップ</a>
    <header class="site-header" id="top">
      <div class="container header-inner">
        <a class="brand" href="index.html" aria-label="煌龍園 トップへ">
          <img src="assets/img/logo.png" alt="煌龍園 ロゴ" width="44" height="44" />
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
          <a href="route.html">龍の追憶</a>
          <a href="access.html">アクセス</a>
          <a href="https://5ne.co/0jvu" target="_blank" rel="noopener">問い合わせ</a>
        </nav>
      </div>
    </header>
  `;

  // Footer component
  const FOOTER_HTML = `
    <footer class="site-footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <img src="assets/img/logo.png" alt="" width="36" height="36" loading="lazy" />
          <div>
            <div class="footer-title">煌龍園 | KohLongEnn</div>
            <div class="footer-note">©SQUARE ENIX<br>記載されている会社名・製品名・システム名などは、各社の商標、または登録商標です。</div>
          </div>
        </div>

        <a class="to-top" href="#top">▲ Top</a>
      </div>
    </footer>
  `;

  /**
   * Initialize components on page load
   */
  const initComponents = () => {
    // Insert header at the beginning of body
    if (!document.querySelector('.site-header')) {
      document.body.insertAdjacentHTML('afterbegin', HEADER_HTML);
    }

    // Insert footer at the end of body
    if (!document.querySelector('.site-footer')) {
      document.body.insertAdjacentHTML('beforeend', FOOTER_HTML);
    }

    // Set active navigation link
    setActiveNavLink();
  };

  /**
   * Set active class on current page's nav link
   */
  const setActiveNavLink = () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.site-nav a');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  };

  // Initialize on DOM content loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initComponents);
  } else {
    initComponents();
  }

  // Export for potential external use
  window.UIComponents = {
    initComponents,
    setActiveNavLink
  };
})();
