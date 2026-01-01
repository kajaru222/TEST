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
    }
  };

  const openNav = () => {
    if (nav) {
      nav.classList.add('is-open');
      setExpanded(true);
      document.body.style.overflow = 'hidden';
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
    const ro = new ResizeObserver(() => setHeaderHeightVar());
    ro.observe(header);
  }

  window.addEventListener('resize', () => setHeaderHeightVar(), { passive: true });
  window.addEventListener('orientationchange', () => setHeaderHeightVar(), { passive: true });

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
})();