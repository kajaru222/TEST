(() => {
  const dragons = (window.DRAGONS || []);
  if (!Array.isArray(dragons) || dragons.length === 0) return;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const els = {
    stage: $("#dragonStage"),
    panel: $(".dragons-panel"),
    left: $(".panel-left"),
    list: $$(".panel-list li"),
    title: $("#dragonTitle"),
    name: $("#dragonName"),
    tag: $("#dragonTags") || $("#dragonTag"),
    birthday: $("#dragonBirthday"),
    oneLiner: $("#dragonPhrase") || $("#dragonOneLiner"),
    colorName: $("#dragonColorName"),
    portrait: $("#dragonPortrait"),
    flower: $("#dragonFlower"),
    grid: $("#iconGrid"),
    detailsBtn: $("#viewDetails"),
    modal: $("#dragonModal"),
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
  let detailById = new Map();
  let detailLoadPromise = null;
  const loadDetailData = () => {
    if (detailLoadPromise) return detailLoadPromise;
    detailLoadPromise = fetch("assets/data/dragons_detail.json")
      .then(r => r.ok ? r.json() : [])
      .then(arr => {
        if (Array.isArray(arr)) detailById = new Map(arr.map(x => [x.id, x]));
        return detailById;
      })
      .catch(() => detailById);
    return detailLoadPromise;
  };

const setText = (el, v) => { if (el) el.textContent = (v ?? ""); };

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
    setText(els.birthday, d.birthday);
    setText(els.oneLiner, d.oneLiner || "—");

    // hide panel list item if oneLiner is empty
    const phraseListItem = els.oneLiner?.closest("li");
    if (phraseListItem) {
      if (d.oneLiner && d.oneLiner.trim()) {
        phraseListItem.style.display = "";
      } else {
        phraseListItem.style.display = "none";
      }
    }
    setText(els.colorName, d.imageColorName || "—");

    if (els.portrait) {
      // Preload image to ensure proper positioning
      const img = new Image();
      img.loading = "eager";
      img.decoding = "async";
      img.onload = () => {
        els.portrait.src = d.images.portrait;
        els.portrait.alt = `${d.dragonTitle} ${d.name} 立ち絵`;
        els.portrait.loading = "eager";
        els.portrait.decoding = "async";
      };
      img.src = d.images.portrait;
    }
    if (els.flower) {
      if (d.images.flower) {
        els.flower.src = d.images.flower;
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
  const openModal = async (d) => {
    if (!els.modal) return;
    await loadDetailData();

    const detail = detailById.get(d.id) || null;

    els.modal.classList.add("is-open");
    els.modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    const esc = (s) => (s ?? "").toString().replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");

    if (els.modalTitle) els.modalTitle.textContent = `${d.dragonTitle} / ${d.name}`;
    if (!els.modalBody) return;

    const drinks = (detail?.drinks || []).map(x => `
      <li>
        <span class="item-name">名前：${esc(x.name)}</span>
        <span class="item-desc">${esc(x.desc)}</span>
      </li>
    `).join("");

    const prefs = (detail?.preferences || []).map(x => `
      <div class="kv">
        <span class="label">${esc(x.label)}</span>
        <div class="value">${esc(x.value)}</div>
      </div>
    `).join("");

    const kvTop = `
      <div class="modal-kv">
        <div class="kv"><span class="label">誕生日</span><div class="value">${esc(d.birthday)}</div></div>
        <div class="kv"><span class="label">イメージカララント</span><div class="value">${esc(d.imageColorName || "—")}</div></div>
        <div class="kv"><span class="label">一人称</span><div class="value">${esc(detail?.firstPerson || "—")}</div></div>
        ${detail?.chekiMenu && detail.chekiMenu.trim() ? `<div class="kv"><span class="label">チェキセットのお食事メニュー</span><div class="value">${esc(detail.chekiMenu)}</div></div>` : ""}
      </div>
    `;

    els.modalBody.innerHTML = `
      ${d.images?.id_card ? `<div class="modal-id-card"><img src="${esc(d.images.id_card)}" alt="${esc(d.name)} ID Card" loading="lazy" decoding="async" /></div>` : ""}

      ${d.oneLiner && d.oneLiner.trim() ? `<div class="modal-catch">『 ${esc(d.oneLiner)} 』</div>` : ""}

      ${kvTop}

      ${drinks ? `<div class="modal-section-title">オリジナルドリンク</div><ul class="modal-list">${drinks}</ul>` : ""}

      ${(prefs || detail?.preferences?.length) ? `<div class="modal-section-title">Preference</div><div class="modal-kv">${prefs}</div>` : ""}

      ${detail?.personality ? `<div class="modal-section-title">性格</div><div class="modal-story">${esc(detail.personality)}</div>` : ""}

      ${detail?.setting ? `<div class="modal-section-title">龍の設定・どうして煌龍園に降り立ったか</div><div class="modal-story">${esc(detail.setting)}</div>` : ""}

      ${detail?.masterDragon ? `<div class="modal-section-title">主たる龍</div><div class="modal-story">${esc(detail.masterDragon)}</div>` : ""}

      <div class="modal-footer">
        <button class="modal-navbtn" type="button" data-action="prev">PREV</button>
        <button class="modal-navbtn" type="button" data-action="next">NEXT</button>
      </div>
    `;

    // reset scroll position to top
    els.modalBody.scrollTop = 0;

    // keep current id for nav
    els.modal.dataset.currentId = d.id;
  };

  const closeModal = () => {
    if (!els.modal) return;
    els.modal.classList.add("is-closing");

    // Wait for animation to complete before hiding
    setTimeout(() => {
      els.modal.classList.remove("is-open");
      els.modal.classList.remove("is-closing");
      els.modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    }, 300); // Match animation duration
  };

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

      const img = document.createElement("img");
      img.className = "thumb-img";
      img.loading = "lazy";
      img.decoding = "async";
      img.alt = "";
      img.src = d.images.icon;

      btn.appendChild(img);
      btn.addEventListener("click", () => {
        // use hash so back/forward works
        location.hash = encodeURIComponent(d.id);
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
    gsap.set([u.title, u.name, u.tag, ...u.list, u.details].filter(Boolean), { opacity: 0, y: 10 });
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
      .to([u.tag].filter(Boolean), { opacity: 1, y: 0, duration: 0.18 }, 0.08)
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
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;

      // backdrop click closes
      if (t.dataset.role === "backdrop") return closeModal();

      // drawer nav
      if (t.dataset.action === "prev" || t.dataset.action === "next") {
        const curId = els.modal.dataset.currentId || dragons[0].id;
        const curIdx = dragons.findIndex(x => x.id === curId);
        const idx = curIdx >= 0 ? curIdx : 0;
        const nextIdx = t.dataset.action === "prev"
          ? (idx - 1 + dragons.length) % dragons.length
          : (idx + 1) % dragons.length;
        const next = dragons[nextIdx];

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
