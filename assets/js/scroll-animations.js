/**
 * Scroll Animations for TOP page
 *
 * このファイルの責務:
 * - IntersectionObserverでパネルにis-visibleクラスを付与
 * - セクションナビゲーションの状態管理
 * - ホイール/キーボード/タッチによるセクションスナップスクロール
 * - hero背景のパララックス効果
 * - cast cardのアニメーショントリガー(is-animatedクラス付与)
 *
 * アニメーションの分担:
 * - CSS (top.css): is-visibleトリガーでパネル/カードのフェードイン
 * - CSS (animations.css): 背景エフェクト、ホバー効果
 * - GSAP (top-hero.js): hero要素の補助アニメーション
 * - JS (top-cast-inertia.js): castカードのドラッグスクロール
 *
 * 注意: インラインスタイルでopacity/transformを設定するとCSSと競合するため、
 *       基本的にクラス付与のみ行い、実際のアニメーションはCSSで定義する
 */

(function() {
  'use strict';

  // Section Navigation State Management
  let isScrolling = false;
  let scrollTimeout;
  let currentSectionIndex = 0;
  const scrollContainer = document.querySelector('main');

  // Get all panels
  function getPanels() {
    return Array.from(document.querySelectorAll('.panel[data-panel]'));
  }

  // Update active section in navigation
  function updateActiveSection() {
    const panels = getPanels();
    const navItems = document.querySelectorAll('.section-nav-item');
    const scrollPosition = scrollContainer ? scrollContainer.scrollTop : window.pageYOffset;
    const viewportCenter = scrollPosition + window.innerHeight / 2;

    let activePanel = null;
    let activePanelIndex = 0;

    panels.forEach((panel, index) => {
      const panelTop = panel.offsetTop;
      const panelBottom = panelTop + panel.offsetHeight;

      if (viewportCenter >= panelTop && viewportCenter < panelBottom) {
        activePanel = panel;
        activePanelIndex = index;
      }
    });

    if (activePanel) {
      currentSectionIndex = activePanelIndex;
      const activeSectionId = activePanel.id;
      navItems.forEach(item => {
        const sectionId = item.getAttribute('data-section');
        if (sectionId === activeSectionId) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
  }

  // Smooth scroll to specific panel
  function scrollToPanel(panelIndex) {
    const panels = getPanels();
    if (panelIndex < 0 || panelIndex >= panels.length) return;

    const targetPanel = panels[panelIndex];
    isScrolling = true;

    // Smooth scroll animation
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: targetPanel.offsetTop,
        behavior: 'smooth'
      });
    } else {
      targetPanel.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }

    currentSectionIndex = panelIndex;

    // Reset scrolling flag after animation
    setTimeout(() => {
      isScrolling = false;
      updateActiveSection();
    }, 1000);
  }

  // Handle section navigation clicks
  function handleSectionNavClick(e) {
    e.preventDefault();
    const targetSection = e.currentTarget.getAttribute('data-section');
    const targetElement = document.getElementById(targetSection);

    if (targetElement) {
      const panels = getPanels();
      const targetIndex = panels.findIndex(panel => panel.id === targetSection);
      if (targetIndex !== -1) {
        scrollToPanel(targetIndex);
      }
    }
  }

  // Handle wheel scroll - 一気にスクロール
  function handleWheelScroll(e) {
    if (isScrolling) {
      e.preventDefault();
      return;
    }

    const panels = getPanels();
    const delta = e.deltaY;

    // Scroll down
    if (delta > 0 && currentSectionIndex < panels.length - 1) {
      e.preventDefault();
      scrollToPanel(currentSectionIndex + 1);
    }
    // Scroll up
    else if (delta < 0 && currentSectionIndex > 0) {
      e.preventDefault();
      scrollToPanel(currentSectionIndex - 1);
    }
  }

  // Handle keyboard navigation
  function handleKeyDown(e) {
    if (isScrolling) return;

    const panels = getPanels();

    switch(e.key) {
      case 'ArrowDown':
      case 'PageDown':
        if (currentSectionIndex < panels.length - 1) {
          e.preventDefault();
          scrollToPanel(currentSectionIndex + 1);
        }
        break;
      case 'ArrowUp':
      case 'PageUp':
        if (currentSectionIndex > 0) {
          e.preventDefault();
          scrollToPanel(currentSectionIndex - 1);
        }
        break;
      case 'Home':
        e.preventDefault();
        scrollToPanel(0);
        break;
      case 'End':
        e.preventDefault();
        scrollToPanel(panels.length - 1);
        break;
    }
  }

  // Intersection Observer for fade-in animations
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -100px 0px',
    threshold: 0.1
  };

  const panelObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, observerOptions);

  // Observer for yui540 animation classes
  const animationClasses = [
    '.mask-reveal-x',
    '.mask-reveal-y',
    '.mask-reveal-diagonal',
    '.text-blur-reveal',
    '.text-split-appear',
    '.bounce-scale',
    '.scroll-unfold',
    '.scroll-clip-reveal',
    '.scroll-rotate',
    '.stagger-fade-in',
    '.scroll-bounce-in',
    '.scroll-slide-left',
    '.scroll-slide-right',
    '.scroll-zoom-in',
    '.scroll-flip',
    '.scroll-3d-rotate'
  ];

  const elementObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Once animated, stop observing
        elementObserver.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.15
  });

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    const panels = document.querySelectorAll('.panel');
    panels.forEach(panel => {
      panelObserver.observe(panel);
    });

    // Observe all yui540 animation elements
    animationClasses.forEach(className => {
      document.querySelectorAll(className).forEach(el => {
        // Don't observe if already visible or inside hero (handled separately)
        if (!el.closest('.panel-hero')) {
          elementObserver.observe(el);
        }
      });
    });

    // Make hero panel visible immediately with staggered animations
    const heroPanel = document.querySelector('.panel-hero');
    if (heroPanel) {
      setTimeout(() => {
        heroPanel.classList.add('is-visible');
        // Trigger hero element animations
        heroPanel.querySelectorAll(animationClasses.join(',')).forEach((el, index) => {
          setTimeout(() => {
            el.classList.add('is-visible');
          }, index * 150);
        });
      }, 300);
    }

    // Initialize section navigation
    const navItems = document.querySelectorAll('.section-nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', handleSectionNavClick);
    });

    // Add wheel scroll handler
    const targetElement = scrollContainer || window;
    targetElement.addEventListener('wheel', handleWheelScroll, { passive: false });

    // Add keyboard navigation
    document.addEventListener('keydown', handleKeyDown);

    // Add touch support for mobile
    let touchStartY = 0;
    let touchEndY = 0;

    targetElement.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    targetElement.addEventListener('touchend', (e) => {
      touchEndY = e.changedTouches[0].clientY;
      handleTouchScroll();
    }, { passive: true });

    function handleTouchScroll() {
      if (isScrolling) return;

      const panels = getPanels();
      const swipeDistance = touchStartY - touchEndY;
      const minSwipeDistance = 50;

      // Swipe up (scroll down)
      if (swipeDistance > minSwipeDistance && currentSectionIndex < panels.length - 1) {
        scrollToPanel(currentSectionIndex + 1);
      }
      // Swipe down (scroll up)
      else if (swipeDistance < -minSwipeDistance && currentSectionIndex > 0) {
        scrollToPanel(currentSectionIndex - 1);
      }
    }

    // Initial active section update
    updateActiveSection();
  });

  // Parallax effect for hero background
  let ticking = false;

  function updateParallax() {
    const heroPanel = document.querySelector('.panel-hero');
    const heroBg = document.querySelector('.hero-bg');

    if (!heroPanel || !heroBg) return;

    const scrolled = window.pageYOffset;
    const heroHeight = heroPanel.offsetHeight;

    if (scrolled < heroHeight) {
      const parallaxSpeed = 0.5;
      const yPos = scrolled * parallaxSpeed;
      heroBg.style.transform = `translateY(${yPos}px) scale(1.1)`;
    }

    ticking = false;
  }

  function requestParallaxUpdate() {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  // Smooth scroll behavior with section navigation update
  const scrollTarget = scrollContainer || window;

  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', () => {
      requestParallaxUpdate();

      // Update active section with debounce
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (!isScrolling) {
          updateActiveSection();
        }
      }, 150);
    }, { passive: true });
  } else {
    window.addEventListener('scroll', () => {
      requestParallaxUpdate();

      // Update active section with debounce
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (!isScrolling) {
          updateActiveSection();
        }
      }, 150);
    }, { passive: true });
  }

  // Handle anchor links with smooth scroll
  document.addEventListener('click', (e) => {
    const target = e.target.closest('a[href^="#"]');
    if (!target) return;

    const href = target.getAttribute('href');
    if (href === '#') return;

    e.preventDefault();

    // Handle #top specifically - scroll to top of page
    if (href === '#top') {
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
      return;
    }

    const targetElement = document.querySelector(href);
    if (!targetElement) return;

    const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
    const targetPosition = targetElement.offsetTop - headerHeight;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  });

  /**
   * Cast Cards Animation
   * - top.cssにCSSアニメーションを追加して制御
   * - JSはis-animatedクラスを付与するのみ
   * - インラインスタイルはCSSと競合するため使用しない
   */
  const castObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const cards = entry.target.querySelectorAll('.cast-card');
        cards.forEach((card, index) => {
          // CSSでアニメーション、JSはクラス付与とディレイのみ
          setTimeout(() => {
            card.classList.add('is-animated');
          }, index * 100);
        });
      }
    });
  }, {
    threshold: 0.2
  });

  document.addEventListener('DOMContentLoaded', () => {
    const castSection = document.querySelector('.panel-cast');
    if (castSection) {
      castObserver.observe(castSection);
      // 初期状態はCSSで制御（top.cssに追加）
    }
  });

})();
