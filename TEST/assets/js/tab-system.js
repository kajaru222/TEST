/**
 * Universal Tab System
 * Handles tab switching for both button-based and data-attribute-based tabs
 */

(() => {
  'use strict';

  /**
   * Initialize tab system with event delegation
   * @param {Object} options - Configuration options
   */
  const initTabs = (options = {}) => {
    const {
      buttonSelector = '.tab-button, .story-btn',
      contentSelector = '.tab-content, .story-section',
      activeClass = 'active',
      onTabChange = null
    } = options;

    const buttons = document.querySelectorAll(buttonSelector);
    if (buttons.length === 0) return;

    // Event delegation for tab buttons
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        handleTabClick(e, { buttonSelector, contentSelector, activeClass, onTabChange });
      });
    });
  };

  /**
   * Handle tab button click
   */
  const handleTabClick = (e, options) => {
    const button = e.currentTarget;
    const { buttonSelector, contentSelector, activeClass, onTabChange } = options;

    // Get target content ID
    const targetId = button.dataset.tab || button.getAttribute('onclick')?.match(/['"]([^'"]+)['"]/)?.[1];
    if (!targetId) return;

    // Prevent default if it's a link
    e.preventDefault();

    // Remove active class from all buttons and content
    document.querySelectorAll(buttonSelector).forEach(btn => {
      btn.classList.remove(activeClass);
    });

    document.querySelectorAll(contentSelector).forEach(content => {
      content.classList.remove(activeClass);
    });

    // Add active class to clicked button
    button.classList.add(activeClass);

    // Show target content
    const targetContent = document.getElementById(targetId);
    if (targetContent) {
      targetContent.classList.add(activeClass);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Call callback if provided
    if (typeof onTabChange === 'function') {
      onTabChange(targetId, button);
    }
  };

  /**
   * Initialize intro page specific tabs with title update
   */
  const initIntroTabs = () => {
    const title = document.getElementById('main-title');
    if (!title) return;

    const titleMap = {
      'story1': '煌龍園の物語',
      'story2': '龍の遣い(ろんろんちゃん達)について'
    };

    initTabs({
      buttonSelector: '.story-btn',
      contentSelector: '.story-section',
      onTabChange: (tabId) => {
        // Update title with fade effect
        title.style.opacity = '0';
        setTimeout(() => {
          title.textContent = titleMap[tabId] || titleMap['story1'];
          title.style.opacity = '1';
        }, 200);
      }
    });
  };

  /**
   * Auto-initialize based on page content
   */
  const autoInit = () => {
    // Check if intro page (has story tabs)
    if (document.querySelector('.story-btn')) {
      initIntroTabs();
    }
    // Check if about page (has regular tabs)
    else if (document.querySelector('.tab-button')) {
      initTabs({
        buttonSelector: '.tab-button',
        contentSelector: '.tab-content'
      });
    }
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

  // Export for external use
  window.TabSystem = {
    initTabs,
    initIntroTabs,
    autoInit
  };
})();
