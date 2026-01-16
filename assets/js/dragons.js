(() => {
  const dragons = (window.DRAGONS || []);
  if (!Array.isArray(dragons) || dragons.length === 0) return;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const isMobileView = () => window.matchMedia?.("(max-width: 980px)")?.matches;

  const els = {
    stage: $("#dragonStage"),
    panel: $(".dragons-panel"),
    left: $(".panel-left"),
    list: $$(".panel-list li"),
    title: $("#dragonTitle"),
    name: $("#dragonName"),
    tag: $("#dragonTags") || $("#dragonTag"),
    oneLiner: $("#dragonOneLiner"),
    birthday: $("#dragonBirthday"),
    colorName: $("#dragonColorName"),
    portrait: $("#dragonPortrait"),
    flower: $("#dragonFlower"),
    grid: $("#iconGrid"),
    detailsBtn: $("#viewDetails"),
    modal: $("#dragonModal"),
    dialog: $(".modal-dialog"),
    modalClose: $("#modalClose"),
    modalBody: $("#modalBody"),
    modalTitle: $("#modalTitle"),
  };
  // --- Support query param (?cast=xxx) in addition to hash (#xxx)
  const qs = new URLSearchParams(location.search || "");
  const qCast = (qs.get("cast") || "").trim();
  if (qCast && (!location.hash || location.hash === "#")) {
    location.hash = encodeURIComponent(qCast.toLowerCase());
  }


  // --- detail data (for drawer)
  // --- detail data (for drawer)
  let detailById = new Map();
  const loadDetailData = () => {
    // Synchronous load from global variable (avoids CORS issues with file://)
    const arr = window.DRAGONS_DETAIL || [];
    detailById = new Map(arr.map(x => [x.id, x]));
    return Promise.resolve(detailById);
  };

  const setText = (el, v) => { if (el) el.textContent = (v ?? ""); };
  const createEl = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined && text !== null) el.textContent = text;
    return el;
  };
  let lastModalActive = null;
  let modalFocusCleanup = null;
  const trapFocus = (container) => {
    if (!container) return () => {};
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
      if (e.key !== "Tab") return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    container.addEventListener("keydown", onKeydown);
    return () => container.removeEventListener("keydown", onKeydown);
  };

  // calculate luminance to determine if text should be light or dark
  const getLuminance = (hex) => {
    if (!hex) return 0;
    const rgb = hex.replace(/^#/, '').match(/.{2}/g);
    if (!rgb || rgb.length !== 3) return 0;
    const [r, g, b] = rgb.map(x => {
      const val = parseInt(x, 16) / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  // theme variables (keep as-is: CSS uses these)
  const setTheme = (colors) => {
    if (!colors) return;
    const root = document.documentElement;

    // set color variables
    root.style.setProperty("--main-color", colors.main);
    root.style.setProperty("--accent-color", colors.accent);
    root.style.setProperty("--sub-color", colors.sub);

    root.style.setProperty("--d-main", colors.main);
    root.style.setProperty("--d-accent", colors.accent);
    root.style.setProperty("--d-sub", colors.sub);

    // automatic contrast adjustment for text colors
    // modal uses --d-main as background
    const mainLum = getLuminance(colors.main);
    const isDark = mainLum <= 0.5;
    // for very light backgrounds, use darker text for better contrast
    const mainTextColor = isDark ? '#fff' : (mainLum > 0.75 ? '#1a1a1a' : '#111');
    const mainMutedColor = isDark ? 'rgba(255,255,255,.72)' : (mainLum > 0.75 ? 'rgba(0,0,0,.85)' : 'rgba(0,0,0,.72)');

    // for dark backgrounds, use dark semi-transparent backgrounds for items
    // for light backgrounds, use white semi-transparent backgrounds
    // for very light backgrounds, use darker semi-transparent backgrounds
    const modalItemBg = isDark ? 'rgba(0,0,0,.35)' : (mainLum > 0.75 ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.4)');
    const modalBtnBg = isDark ? 'rgba(0,0,0,.45)' : (mainLum > 0.75 ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.45)');
    const modalBtnHover = isDark ? 'rgba(0,0,0,.65)' : (mainLum > 0.75 ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.65)');

    // adjust accent color for label contrast
    // if accent color is too light on light background, darken it
    const accentLum = getLuminance(colors.accent);
    let accentColor = colors.accent;
    if (!isDark && accentLum > 0.7) {
      // both main and accent are light - use dark color for labels
      accentColor = '#2a2a2a';
    }
    root.style.setProperty("--d-accent-contrast", accentColor);

    // panel uses --d-sub as background
    const subLum = getLuminance(colors.sub);
    const panelTextColor = subLum > 0.5 ? '#111' : '#fff';
    const panelMutedColor = subLum > 0.5 ? 'rgba(0,0,0,.72)' : 'rgba(255,255,255,.72)';

    root.style.setProperty("--panel-text", panelTextColor);
    root.style.setProperty("--panel-muted", panelMutedColor);
    root.style.setProperty("--modal-text", mainTextColor);
    root.style.setProperty("--modal-muted", mainMutedColor);
    root.style.setProperty("--modal-item-bg", modalItemBg);
    root.style.setProperty("--modal-btn-bg", modalBtnBg);
    root.style.setProperty("--modal-btn-hover", modalBtnHover);
  };

  const setDragon = (d) => {
    setTheme(d.colors);

    setText(els.title, d.dragonTitle);
    setText(els.name, d.name);
    setText(els.tag, d.tag);
    setText(els.oneLiner, d.oneLiner);
    setText(els.birthday, d.birthday);

    setText(els.colorName, d.imageColorName || "—");

    if (els.portrait) {
      // Preload image to ensure proper positioning
      const img = new Image();
      img.loading = "eager";
      img.decoding = "async";
      img.onload = () => {
        // Set responsive WebP images with srcset
        els.portrait.srcset = `${d.images.portrait}-480w.webp 480w, ${d.images.portrait}-800w.webp 800w`;
        els.portrait.sizes = '(max-width: 768px) 480px, 800px';
        els.portrait.src = `${d.images.portrait}-800w.webp`;
        els.portrait.alt = `${d.dragonTitle} ${d.name} 立ち絵`;
        els.portrait.loading = "eager";
        els.portrait.decoding = "async";
      };
      img.src = `${d.images.portrait}-800w.webp`;
    }
    if (els.flower) {
      if (d.images.flower) {
        // Set responsive WebP images with srcset
        els.flower.srcset = `${d.images.flower}-320w.webp 320w, ${d.images.flower}-640w.webp 640w`;
        els.flower.sizes = '(max-width: 768px) 320px, 640px';
        els.flower.src = `${d.images.flower}-640w.webp`;
        els.flower.loading = "lazy";
        els.flower.decoding = "async";
        els.flower.classList.remove("is-hidden");
      } else {
        els.flower.classList.add("is-hidden");
      }
    }

    // keep active selection
    $$(".thumb-btn").forEach(btn => btn.classList.toggle("is-active", btn.dataset.id === d.id));

    if (els.detailsBtn) {
      els.detailsBtn.dataset.id = d.id;
    }

    document.title = `龍紹介 | 煌龍園 | ${d.name}`;
  };

  // --- modal
  // --- drawer (modal)
  // --- drawer (modal)
  const openModal = async (d) => {
    if (!els.modal) return;

    // lock body scroll
    document.body.style.overflow = "hidden";
    lastModalActive = document.activeElement;

    await loadDetailData();

    const detail = detailById.get(d.id) || null;

    els.modal.classList.add("is-open");
    els.modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    els.modal.style.display = "flex";
    if (els.dialog) {
      if (modalFocusCleanup) modalFocusCleanup();
      modalFocusCleanup = trapFocus(els.dialog);
      els.dialog.focus();
    }


    if (els.modalTitle) els.modalTitle.textContent = `${d.dragonTitle} / ${d.name}`;
    if (!els.modalBody) return;

    const body = els.modalBody;
    body.innerHTML = "";

    const frag = document.createDocumentFragment();
    const nameUpper = (d.name || "").toUpperCase();
    const bgTextName = `${nameUpper}   ${nameUpper}   ${nameUpper}   ${nameUpper}`;

    const hero = createEl("div", "modal-hero");
    hero.appendChild(createEl("div", "modal-hero-bg-text", `${bgTextName} ${bgTextName}`));
    hero.appendChild(createEl("div", "modal-hero-frame"));

    for (let i = 0; i < 18; i++) {
      const sparkle = createEl("div", "sparkle");
      sparkle.style.left = `${Math.random() * 100}%`;
      sparkle.style.top = `${Math.random() * 90 + 5}%`;
      sparkle.style.width = `${Math.random() * 5 + 2}px`;
      sparkle.style.height = sparkle.style.width;
      sparkle.style.animationDelay = `${Math.random() * 4}s`;
      sparkle.style.animationDuration = `${Math.random() * 3 + 3}s`;
      hero.appendChild(sparkle);
    }

    if (d.oneLiner) {
      hero.appendChild(createEl("div", "modal-hero-catch-vertical", d.oneLiner));
    }

    if (d.images?.portrait) {
      const portrait = createEl("img");
      portrait.srcset = `${d.images.portrait}-480w.webp 480w, ${d.images.portrait}-800w.webp 800w`;
      portrait.sizes = "(max-width: 768px) 480px, 800px";
      portrait.src = `${d.images.portrait}-800w.webp`;
      portrait.alt = `${d.name || ""} portrait`;
      portrait.loading = "lazy";
      portrait.decoding = "async";
      hero.appendChild(portrait);
    }

    const heroText = createEl("div", "modal-hero-text");
    const heroJp = createEl("div", "modal-hero-jp");
    if (d.dragonTitle) heroJp.appendChild(document.createTextNode(d.dragonTitle));
    if (d.imageColorName) {
      heroJp.appendChild(document.createTextNode(" / "));
      const color = createEl("span", null, d.imageColorName);
      color.style.fontSize = "0.9em";
      heroJp.appendChild(color);
    }
    heroText.appendChild(heroJp);
    heroText.appendChild(createEl("div", "modal-hero-name", d.name || ""));
    if (d.tag) {
      heroText.appendChild(createEl("div", "modal-hero-tag", d.tag));
    }
    hero.appendChild(heroText);

    frag.appendChild(hero);

    const wrapper = createEl("div", "modal-section-wrapper");
    wrapper.appendChild(createEl("div", "modal-section-title", "STORY"));

    if (detail?.personality) {
      const subtext = createEl("div", "modal-body-subtext", detail.personality);
      subtext.style.whiteSpace = "pre-wrap";
      subtext.style.marginBottom = "20px";
      subtext.style.lineHeight = "1.8";
      wrapper.appendChild(subtext);
    }
    if (detail?.setting) {
      wrapper.appendChild(createEl("div", "modal-section-title", "LORE"));
      const lore = createEl("div", "modal-story", detail.setting);
      lore.style.margin = "0 0 20px";
      wrapper.appendChild(lore);
    }
    if (detail?.masterDragon) {
      wrapper.appendChild(createEl("div", "modal-section-title", "MASTER"));
      const master = createEl("div", "modal-story", detail.masterDragon);
      master.style.margin = "0 0 20px";
      wrapper.appendChild(master);
    }

    const drinks = detail?.drinks || [];
    if (drinks.length) {
      wrapper.appendChild(createEl("div", "modal-section-title", "ORIGINAL DRINK"));
      const drinksGrid = createEl("div", "modal-profile-grid");
      drinks.forEach((x) => {
        const item = createEl("div", "modal-profile-item");
        const label = createEl("span", "modal-profile-label", `Drink: ${x.name || ""}`);
        const value = createEl("div", "modal-profile-value", x.desc || "");
        value.style.fontSize = "0.85rem";
        value.style.fontWeight = "500";
        item.append(label, value);
        drinksGrid.appendChild(item);
      });
      wrapper.appendChild(drinksGrid);
    }

    wrapper.appendChild(createEl("div", "modal-section-title", "PROFILE"));
    const profileGrid = createEl("div", "modal-profile-grid");
    const addProfileItem = (label, value, extraClass) => {
      const item = createEl("div", `modal-profile-item${extraClass ? ` ${extraClass}` : ""}`);
      item.appendChild(createEl("span", "modal-profile-label", label));
      item.appendChild(createEl("div", "modal-profile-value", value));
      profileGrid.appendChild(item);
    };
    addProfileItem("Birthday", d.birthday || "");
    addProfileItem("Image Color", d.imageColorName || "?", "item-image-color");
    addProfileItem("First Person", detail?.firstPerson || "?");
    if (detail?.chekiMenu) {
      addProfileItem("Food (Cheki Set)", detail.chekiMenu);
    }
    (detail?.preferences || []).forEach((x) => {
      addProfileItem(x.label || "", x.value || "");
    });
    wrapper.appendChild(profileGrid);

    if (d.images?.id_card) {
      const idCard = createEl("div", "modal-id-card");
      const idImg = createEl("img");
      idImg.srcset = `${d.images.id_card}-400w.webp 400w, ${d.images.id_card}-600w.webp 600w`;
      idImg.sizes = "(max-width: 768px) 400px, 600px";
      idImg.src = `${d.images.id_card}-600w.webp`;
      idImg.alt = `${d.name || ""} ID Card`;
      idImg.loading = "lazy";
      idImg.decoding = "async";
      idCard.appendChild(idImg);
      wrapper.appendChild(idCard);
    }

    wrapper.appendChild(createEl("div", "modal-section-title", "MEMBER"));
    const memberGrid = createEl("div", "modal-member-grid");
    dragons.forEach((m) => {
      const btn = createEl(
        "button",
        `modal-member-btn${m.id === d.id ? " is-active" : ""}`
      );
      btn.type = "button";
      btn.dataset.action = "jump";
      btn.dataset.target = m.id;
      if (m.name) btn.setAttribute("aria-label", m.name);
      const img = createEl("img");
      img.srcset = `${m.images.icon}-160w.webp 1x, ${m.images.icon}-240w.webp 2x`;
      img.src = `${m.images.icon}-160w.webp`;
      img.alt = m.name || "";
      img.loading = "lazy";
      btn.appendChild(img);
      memberGrid.appendChild(btn);
    });
    wrapper.appendChild(memberGrid);

    frag.appendChild(wrapper);

    const footer = createEl("div", "modal-footer");
    const prevBtn = createEl("button", "modal-navbtn", "PREV");
    prevBtn.type = "button";
    prevBtn.dataset.action = "prev";
    const nextBtn = createEl("button", "modal-navbtn", "NEXT");
    nextBtn.type = "button";
    nextBtn.dataset.action = "next";
    footer.append(prevBtn, nextBtn);
    frag.appendChild(footer);

    body.appendChild(frag);
    // reset scroll position to top
    if (els.modalBody) els.modalBody.scrollTop = 0;

    // keep current id for nav
    els.modal.dataset.currentId = d.id;

    // Show modal with animation
    els.modal.classList.remove("is-closing");
    els.modal.classList.add("is-open");
    els.modal.scrollTop = 0;

    // Trigger internal animations after a slight delay
    requestAnimationFrame(() => {
      els.modalBody.querySelector(".modal-hero")?.classList.add("is-animating");
    });
  };

  function closeModal() {
    if (!els.modal) return;

    // Start closing animation
    els.modal.classList.remove("is-open");
    els.modal.classList.add("is-closing");

    // Remove animation class from hero immediately
    els.modal.querySelector('.modal-hero')?.classList.remove('is-animating');

    // Wait for animation to finish
    els.modal.addEventListener("animationend", () => {
      els.modal.classList.remove("is-closing");
      els.modal.style.display = "none";
      els.modal.setAttribute("aria-hidden", "true");

      const hero = els.modal.querySelector('.modal-hero');
      if (hero) hero.classList.remove('is-animating');

      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";

      if (modalFocusCleanup) {
        modalFocusCleanup();
        modalFocusCleanup = null;
      }
      if (lastModalActive && typeof lastModalActive.focus === "function") {
        lastModalActive.focus();
      }
    }, { once: true });

    // sync URL hash
    history.replaceState(null, "", `${location.pathname}${location.search}`);
  }

  // --- thumbnails
  const byId = new Map(dragons.map(d => [d.id, d]));

  const buildGrid = () => {
    if (!els.grid) return;
    els.grid.innerHTML = "";
    dragons.forEach(d => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "thumb-btn";
      btn.dataset.id = d.id;
      btn.setAttribute("aria-label", `${d.dragonTitle} ${d.name}`);

      // Inline style for dynamic background color on mobile
      btn.style.setProperty("--btn-color", d.colors?.main || "#333");

      // 1. Desktop Icon (existing)
      const img = document.createElement("img");
      img.className = "thumb-img";
      img.loading = "lazy";
      img.decoding = "async";
      img.alt = "";
      // Set responsive WebP images with srcset
      img.srcset = `${d.images.icon}-160w.webp 1x, ${d.images.icon}-240w.webp 2x`;
      img.src = `${d.images.icon}-160w.webp`;

      // 2. Mobile Card Content (new)
      const cardDiv = document.createElement("div");
      cardDiv.className = "card-content";

      // Background large English Name
      const enName = document.createElement("div");
      enName.className = "card-en-name";
      enName.textContent = d.name; // e.g. "Liuu Qalli"

      // Foreground Japanese Title/Name
      const jpName = document.createElement("div");
      jpName.className = "card-jp-name";
      const jpTitle = createEl("span", "card-jp-title", d.dragonTitle || "");
      jpName.appendChild(jpTitle);
      jpName.appendChild(document.createTextNode(d.name || ""));
      // Note: d.name might be English, d.dragonTitle is "黒龍". 
      // User might want English name in background, Japanese in foreground.
      // Actually d.name is "Liuu Qalli".
      // Let's check the reference image behavior. 
      // The reference has Group Name. 
      // Here we probably want Dragon Title (Kanji) + Name? or just Name?
      // Let's put DragonTitle (Kanji) distinctively.

      // Portrait Image
      const portrait = document.createElement("img");
      portrait.className = "card-portrait";
      portrait.loading = "lazy";
      portrait.decoding = "async";
      // Set responsive WebP images
      portrait.srcset = `${d.images.portrait}-480w.webp`;
      portrait.src = `${d.images.portrait}-480w.webp`;
      portrait.alt = "";

      cardDiv.appendChild(enName);
      cardDiv.appendChild(portrait);
      cardDiv.appendChild(jpName);

      btn.appendChild(img);
      btn.appendChild(cardDiv);

      btn.addEventListener("click", async () => {
        // use hash so back/forward works
        location.hash = encodeURIComponent(d.id);

        if (isMobileView()) {
          setDragon(d); // Update active state and theme colors
          await openModal(d);
        }
      });

      els.grid.appendChild(btn);
    });
  };

  // --- GSAP animation helpers
  const prefersReduced = () =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const preloadImages = (urls, timeoutMs = 700) => {
    const unique = [...new Set((urls || []).filter(Boolean))];
    if (unique.length === 0) return Promise.resolve();

    const loadOne = (src) => new Promise((resolve) => {
      const img = new Image();
      let done = false;
      const finish = () => { if (!done) { done = true; resolve(); } };
      img.onload = finish;
      img.onerror = finish;
      img.src = src;
      window.setTimeout(finish, timeoutMs);
    });

    return Promise.all(unique.map(loadOne)).then(() => void 0);
  };

  const collectAnimTargets = () => {
    // refresh because DOM is stable but list may be there
    const list = $$(".panel-list li");
    return {
      panel: $(".dragons-panel"),
      title: $("#dragonTitle"),
      name: $("#dragonName"),
      tag: $("#dragonTags") || $("#dragonTag"),
      oneLiner: $("#dragonOneLiner"),
      list,
      details: $("#viewDetails"),
      flower: $("#dragonFlower"),
      portrait: $("#dragonPortrait"),
    };
  };

  let isSwitching = false;

  const animateSwitch = async (nextId, { instant = false } = {}) => {
    const next = byId.get(nextId) || dragons[0];
    if (!next) return;

    // already showing
    if (els.detailsBtn?.dataset?.id === next.id) return;

    const canAnimate =
      !instant &&
      !prefersReduced() &&
      typeof window.gsap !== "undefined" &&
      typeof window.gsap.timeline === "function";

    if (!canAnimate || isSwitching) {
      setDragon(next);
      return;
    }

    isSwitching = true;

    // preload portrait + flower to reduce popping
    await preloadImages([next.images?.portrait, next.images?.flower]);

    const t = collectAnimTargets();
    const gsap = window.gsap;

    // fade out whole panel quickly
    await new Promise((resolve) => {
      gsap.to(t.panel, {
        opacity: 0,
        duration: 0.16,
        ease: "power1.out",
        onComplete: resolve
      });
    });

    // swap content while invisible
    setDragon(next);

    // trigger accent bar flash animation on character switch
    const accentBars = $$(".accent-bar");
    accentBars.forEach(bar => {
      bar.classList.remove("flash-anim");
      void bar.offsetWidth; // force reflow
      bar.classList.add("flash-anim");
    });
    // remove class after animation completes to allow re-triggering
    setTimeout(() => {
      accentBars.forEach(bar => bar.classList.remove("flash-anim"));
    }, 1000);

    // trigger band flash animation on character switch
    const bands = $$(".band");
    bands.forEach(band => {
      band.classList.remove("flash-anim");
      void band.offsetWidth; // force reflow
      band.classList.add("flash-anim");
    });
    // remove class after animation completes to allow re-triggering
    setTimeout(() => {
      bands.forEach(band => band.classList.remove("flash-anim"));
    }, 1500);

    // re-collect because img src changed
    const u = collectAnimTargets();

    // set initial state for staged fade-in
    gsap.set(u.panel, { opacity: 1 });
    gsap.set([u.title, u.name, u.tag, u.oneLiner, ...u.list, u.details].filter(Boolean), { opacity: 0, y: 10 });
    if (u.flower && !u.flower.classList.contains("is-hidden")) {
      gsap.set(u.flower, { opacity: 0, scale: 0.98 });
    }
    if (u.portrait) {
      gsap.set(u.portrait, { opacity: 0, x: 18 });
    }

    // timeline: text first, then flower, then portrait
    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => { isSwitching = false; }
    });

    tl.to([u.title, u.name].filter(Boolean), { opacity: 1, y: 0, duration: 0.22, stagger: 0.04 }, 0)
      .to([u.tag, u.oneLiner].filter(Boolean), { opacity: 1, y: 0, duration: 0.18, stagger: 0.04 }, 0.08)
      .to(u.list || [], { opacity: 1, y: 0, duration: 0.18, stagger: 0.04 }, 0.12)
      .to([u.details].filter(Boolean), { opacity: 1, y: 0, duration: 0.18 }, 0.22);

    if (u.flower && !u.flower.classList.contains("is-hidden")) {
      tl.to(u.flower, { opacity: 0.38, scale: 1, duration: 0.26 }, 0.10);
    }
    if (u.portrait) {
      tl.to(u.portrait, { opacity: 1, x: 0, duration: 0.28 }, 0.10);
    }
  };

  const byHash = () => {
    const raw = (location.hash || "").replace("#", "");
    const id = raw ? decodeURIComponent(raw) : dragons[0].id;
    animateSwitch(id);
  };

  // init
  buildGrid();
  // set initial instantly (no animation)
  const raw = (location.hash || "").replace("#", "");
  const initId = raw ? decodeURIComponent(raw) : dragons[0].id;
  animateSwitch(initId, { instant: true });

  window.addEventListener("hashchange", byHash);

  // modal events
  if (els.detailsBtn) {
    els.detailsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = els.detailsBtn.dataset.id;
      const d = byId.get(id) || dragons[0];
      openModal(d);
    });
  }
  if (els.modalClose) els.modalClose.addEventListener("click", closeModal);
  if (els.modal) {
    els.modal.addEventListener("click", async (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;

      // backdrop click closes
      if (target.dataset.role === "backdrop") return closeModal();

      // check for action button (handles clicks on child img elements)
      const t = target.closest("[data-action]");
      if (!t) return;

      // drawer nav
      if (t.dataset.action === "prev" || t.dataset.action === "next" || t.dataset.action === "jump") {
        const curId = els.modal.dataset.currentId || dragons[0].id;

        let next;
        if (t.dataset.action === "jump") {
          const targetId = t.dataset.target;
          next = byId.get(targetId) || dragons[0];
        } else {
          const curIdx = dragons.findIndex(x => x.id === curId);
          const idx = curIdx >= 0 ? curIdx : 0;
          const nextIdx = t.dataset.action === "prev"
            ? (idx - 1 + dragons.length) % dragons.length
            : (idx + 1) % dragons.length;
          next = dragons[nextIdx];
        }

        // keep URL in sync (so refresh/back works)
        location.hash = encodeURIComponent(next.id);

        await animateSwitch(next.id);
        await openModal(next);
      }
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
})();
