/**
 * Global Loading Screen & Page Transition
 * 
 * ページ遷移時および読み込み時にロード画面（プログレスバー付き）を表示します。
 * 初回訪問時（index.html）のオープニングスプラッシュとは別で動作しますが、
 * オープニングがある場合は競合しないように制御します。
 */

(function () {
  'use strict';

  // --- Configuration ---
  const LOADER_ID = 'global-loader';
  const STYLE_ID = 'global-loader-style';

  // Theme Colors
  const COLOR_BG = '#2A0E12'; // Dark Red like Opening
  const COLOR_BAR = '#D4AF37'; // Gold
  const COLOR_BAR_BG = 'rgba(212, 175, 55, 0.2)';

  // --- HTML Generation ---
  function createLoader() {
    if (document.getElementById(LOADER_ID)) return;

    const loader = document.createElement('div');
    loader.id = LOADER_ID;
    loader.setAttribute('aria-hidden', 'true');

    // Add initial load class by default to prevent flicker
    loader.classList.add('is-initial-load');

    loader.innerHTML = `
      <div class="loader-content">
        <div class="loader-logo-wrap">
          <!-- Logo matching the site header/splash -->
          <img src="assets/img/logo-88w.webp" alt="" class="loader-logo" width="44" height="44">
        </div>
        <div class="loader-text">Loading...</div>
        <div class="loader-progress-wrap">
          <div class="loader-bar" id="${LOADER_ID}-bar"></div>
        </div>
      </div>
    `;
    document.body.appendChild(loader);
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const css = `
      /* Loader Container */
      #${LOADER_ID} {
        position: fixed;
        inset: 0;
        z-index: 9999;
        background-color: ${COLOR_BG};
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Cinzel', serif;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.5s ease;
      }

      /* Active State (Visible) */
      #${LOADER_ID}.is-active {
        opacity: 1;
        pointer-events: auto;
      }

      /* Initial Load State - Prevent Flicker */
      #${LOADER_ID}.is-initial-load {
        opacity: 1 !important;
        pointer-events: auto !important;
        transition: none !important;
      }

      /* Content Layout */
      #${LOADER_ID} .loader-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        width: 240px;
        transform: translateY(10px);
        transition: transform 0.5s ease;
      }
      #${LOADER_ID}.is-active .loader-content,
      #${LOADER_ID}.is-initial-load .loader-content {
        transform: translateY(0);
      }

      /* Logo */
      #${LOADER_ID} .loader-logo {
        width: 48px;
        height: 48px;
        opacity: 0.9;
        animation: rotateLogo 3s infinite linear;
      }

      /* Text */
      #${LOADER_ID} .loader-text {
        font-size: 14px;
        letter-spacing: 0.1em;
        color: ${COLOR_BAR};
        text-transform: uppercase;
        opacity: 0.8;
      }

      /* Progress Bar */
      #${LOADER_ID} .loader-progress-wrap {
        width: 100%;
        height: 2px;
        background: ${COLOR_BAR_BG};
        border-radius: 2px;
        overflow: hidden;
        position: relative;
      }

      #${LOADER_ID} .loader-bar {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 0%;
        background-color: ${COLOR_BAR};
        box-shadow: 0 0 8px ${COLOR_BAR};
        transition: width 0.2s ease-out;
      }

      @keyframes rotateLogo {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  // --- Logic ---

  // Helper: Set bar percentage
  function setProgress(percent) {
    const bar = document.getElementById(`${LOADER_ID}-bar`);
    if (bar) {
      bar.style.width = `${percent}%`;
    }
  }

  // Helper: Toggle visibility
  function toggleLoader(show) {
    const loader = document.getElementById(LOADER_ID);
    if (!loader) return;

    if (show) {
      loader.classList.add('is-active');
      loader.setAttribute('aria-hidden', 'false');
    } else {
      loader.classList.remove('is-active');
      loader.setAttribute('aria-hidden', 'true');
    }
  }

  // Setup Link Interception (Exit Transition)
  function setupLinkInterception() {
    document.body.addEventListener('click', (e) => { // Use body delegation
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      const target = link.getAttribute('target');

      // Ignore conditions
      if (!href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        target === '_blank') {
        return;
      }

      let url;
      try {
        url = new URL(href, window.location.href);
      } catch (error) {
        // Invalid URL format - ignore and let browser handle it
        console.debug('Invalid URL format, skipping transition:', href, error);
        return;
      }

      if (url.origin !== window.location.origin) return;

      // Ignore same page (including same page with hash navigation)
      const normalizePath = (p) => p.replace(/\/index\.html$/, '/');
      const currentPath = normalizePath(window.location.pathname);
      const nextPath = normalizePath(url.pathname);

      if (nextPath === currentPath && url.search === window.location.search) {
        return;
      }

      // Modifier keys
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      e.preventDefault();

      // Remove is-initial-load just in case
      const loader = document.getElementById(LOADER_ID);
      if (loader) loader.classList.remove('is-initial-load');

      // Start Exit Animation
      toggleLoader(true);

      // Fake progress for exit
      let progress = 0;
      setProgress(0);

      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        setProgress(progress);
      }, 50);

      // Navigate after short delay
      setTimeout(() => {
        clearInterval(interval);
        window.location.href = href;
      }, 600); // 0.6s delay
    });
  }

  // Entry Animation (Page Load)
  function playEntryAnimation() {
    const loader = document.getElementById(LOADER_ID);

    // Check if Opening Splash is present
    const openingSplash = document.querySelector('.opening-splash');
    // Check if opening needs to be shown (not removed AND session not seen)
    const isOpeningActive = openingSplash && !openingSplash.classList.contains('is-removed') && sessionStorage.getItem('hasSeenOpening') !== 'true';

    if (isOpeningActive) {
      // Opening overrides global loader
      if (loader) {
        loader.classList.remove('is-initial-load');
        loader.classList.remove('is-active');
      }
      return;
    }

    // Default Entry Animation logic
    // We start with is-initial-load class (opacity:1, transition:none)
    // We add is-active to keep it visible after we remove is-initial-load
    toggleLoader(true);

    setProgress(0);

    // Animate Bar
    setTimeout(() => {
      setProgress(60);
    }, 100);

    // Function to finish loading
    const finish = () => {
      setProgress(100);
      setTimeout(() => {
        // Prepare for fade out
        if (loader) {
          // Remove the 'force visible' style so calling toggleLoader(false) will trigger transition
          loader.classList.remove('is-initial-load');
          // Force reflow/repaint to ensure browser acknowledges transition property enabled
          void loader.offsetWidth;
        }
        toggleLoader(false);
      }, 500); // visual wait
    };

    if (document.readyState === 'complete') {
      finish();
    } else {
      window.addEventListener('load', finish);
      setTimeout(finish, 3000);
    }
  }

  // --- Init ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectStyles();
      createLoader();
      setupLinkInterception();
      playEntryAnimation();
    });
  } else {
    injectStyles();
    createLoader();
    setupLinkInterception();
    playEntryAnimation();
  }

  // Handle Back/Forward Cache
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      const loader = document.getElementById(LOADER_ID);
      if (loader) {
        loader.classList.remove('is-active', 'is-initial-load');
      }
    }
  });

})();
