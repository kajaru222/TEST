(() => {
  // --- Mobile nav toggle ---
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  const navClose = document.getElementById('navClose');

  const setExpanded = (v) => toggle && toggle.setAttribute('aria-expanded', String(v));

  const closeNav = () => {
    if (nav && nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      setExpanded(false);
      document.body.style.overflow = '';
      document.body.classList.remove('nav-open');
    }
  };

  const openNav = () => {
    if (nav) {
      nav.classList.add('is-open');
      setExpanded(true);
      document.body.style.overflow = 'hidden';
      document.body.classList.add('nav-open');
    }
  };

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.contains('is-open');
      if (open) {
        closeNav();
      } else {
        openNav();
      }
    });

    // Close button
    if (navClose) {
      navClose.addEventListener('click', closeNav);
    }

    // Close menu on nav link click (mobile)
    nav.addEventListener('click', (e) => {
      if (!(e.target instanceof HTMLElement)) return;
      if (e.target.tagName.toLowerCase() === 'a') {
        closeNav();
      }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeNav();
      }
    });
  }

  // --- Sticky header height -> CSS variable (for tab bars etc.) ---
  const header = document.querySelector('.site-header');

  const setHeaderHeightVar = () => {
    if (!header) return;
    const h = Math.ceil(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--header-h', `${h}px`);
  };

  setHeaderHeightVar();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => setHeaderHeightVar()).catch(() => {});
  }
  window.addEventListener('load', () => setHeaderHeightVar(), { passive: true });

  if ('ResizeObserver' in window && header) {
    try {
      const ro = new ResizeObserver(() => setHeaderHeightVar());
      ro.observe(header);
    } catch (error) {
      // ResizeObserver failed, relying on resize/orientationchange events
      console.warn('ResizeObserver initialization failed:', error);
    }
  }

  window.addEventListener('resize', () => setHeaderHeightVar(), { passive: true });
  window.addEventListener('orientationchange', () => setHeaderHeightVar(), { passive: true });

  // --- Split text for per-letter animations ---
  const splitTextSelectors = [
    '.text-split-appear',
    '.text-fade-in-char',
    '.text-blur-in',
    '.text-rotate-in'
  ];

  const splitText = (el) => {
    if (!el || el.dataset.splitProcessed === 'true') return;

    const originalText = el.textContent;
    if (!originalText || !originalText.trim()) return;

    const textNodes = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      textNodes.push(node);
      node = walker.nextNode();
    }

    if (!textNodes.length) return;

    const delayStep = Number(el.dataset.splitDelay || 0.04);
    let charIndex = 0;

    textNodes.forEach((textNode) => {
      const text = textNode.nodeValue || '';
      const frag = document.createDocumentFragment();

      for (const char of text) {
        const span = document.createElement('span');
        span.textContent = char;
        span.setAttribute('aria-hidden', 'true');
        if (Number.isFinite(delayStep) && delayStep > 0) {
          span.style.animationDelay = `${(charIndex * delayStep).toFixed(3)}s`;
        }
        frag.appendChild(span);
        charIndex += 1;
      }

      textNode.parentNode.replaceChild(frag, textNode);
    });

    if (!el.hasAttribute('aria-label') && !el.hasAttribute('aria-labelledby')) {
      el.setAttribute('aria-label', originalText.trim());
    }

    el.dataset.splitProcessed = 'true';
  };

  const prepareSplitText = () => {
    if (!splitTextSelectors.length) return;
    const targets = document.querySelectorAll(splitTextSelectors.join(','));
    targets.forEach(splitText);
  };

  // --- yui540 animation observer ---
  const yuiAnimationSelectors = [
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

  const yuiObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        yuiObserver.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.15
  });

  const observeYuiAnimations = () => {
    if (!yuiAnimationSelectors.length) return;
    const targets = document.querySelectorAll(yuiAnimationSelectors.join(','));
    targets.forEach((el) => yuiObserver.observe(el));
  };

  prepareSplitText();
  observeYuiAnimations();

  // --- Scroll animations ---
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  // Observe all sections and fade-in elements
  const animatedElements = document.querySelectorAll('.section, .fade-in');
  animatedElements.forEach(el => observer.observe(el));

  // --- Smooth scroll to top for .to-top links ---
  document.addEventListener('click', (e) => {
    const target = e.target.closest('.to-top');
    if (!target) return;

    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
})();
