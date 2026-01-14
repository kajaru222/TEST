/**
 * Page Transition Animation - Simple & Elegant
 *
 * シンプルなフェードトランジション
 * - 内部リンククリック時に発動
 * - ふわっとフェードアウト→フェードインの演出
 */

(function() {
  'use strict';

  // Create transition element
  function createTransitionElement() {
    // Check if already exists
    if (document.querySelector('.page-transition')) return;

    const transition = document.createElement('div');
    transition.className = 'page-transition';
    document.body.appendChild(transition);
  }

  // Add CSS for page transition
  function addTransitionStyles() {
    if (document.querySelector('#page-transition-styles')) return;

    const style = document.createElement('style');
    style.id = 'page-transition-styles';
    style.textContent = `
      .page-transition {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #0a0a0a;
        pointer-events: none;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.4s ease;
      }

      /* Active state - fade out */
      .page-transition.is-active {
        opacity: 1;
      }

      /* Exit state - fade in */
      .page-transition.is-exit {
        opacity: 0;
      }
    `;
    document.head.appendChild(style);
  }

  // Execute page transition
  function executeTransition(href) {
    const transition = document.querySelector('.page-transition');
    if (!transition) return;

    // Start fade out animation
    transition.classList.add('is-active');

    // Navigate after animation completes
    setTimeout(() => {
      window.location.href = href;
    }, 400);
  }

  // Handle link clicks
  function handleLinkClick(e) {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');

    // Skip if:
    // - No href
    // - Hash link (#)
    // - External link (different domain)
    // - Target="_blank"
    // - mailto: or tel: links
    if (!href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        link.target === '_blank' ||
        link.hostname !== window.location.hostname) {
      return;
    }

    // Skip if same page
    if (href === window.location.pathname || href === window.location.href) {
      return;
    }

    e.preventDefault();
    executeTransition(href);
  }

  // Page load entry animation
  function playEntryAnimation() {
    const transition = document.querySelector('.page-transition');
    if (!transition) return;

    // Start with overlay visible
    transition.classList.add('is-active');

    // Fade out the overlay
    requestAnimationFrame(() => {
      transition.classList.remove('is-active');
      transition.classList.add('is-exit');

      // Clean up after animation
      setTimeout(() => {
        transition.classList.remove('is-exit');
      }, 400);
    });
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    addTransitionStyles();
    createTransitionElement();

    // Only play entry animation if not from opening splash
    const hasOpeningSplash = document.querySelector('.opening-splash:not(.is-removed)');
    if (!hasOpeningSplash) {
      playEntryAnimation();
    }

    // Add click handler for all links
    document.addEventListener('click', handleLinkClick);
  });

  // Handle browser back/forward
  window.addEventListener('pageshow', (e) => {
    // If page is loaded from cache (back button)
    if (e.persisted) {
      const transition = document.querySelector('.page-transition');
      if (transition) {
        transition.classList.remove('is-active', 'is-exit', 'is-loading');
        playEntryAnimation();
      }
    }
  });

})();
