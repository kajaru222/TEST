(() => {
  if (!document.body.classList.contains("page-top")) return;

  const track = document.getElementById("castTrack");
  if (!track) return;

  const dragons = (window.DRAGONS || []).slice();
  if (!dragons.length) return;

  const norm = (s) => String(s || "").trim().toLowerCase();

  const mk = (tag, cls) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    return el;
  };

  const pickCandidates = (id) => ([
    `assets/img/cards/${id}_card-400w.webp`,
    `assets/img/dragons/${id}_icon-160w.webp`,
    `assets/img/dragons/${id}_full-480w.webp`,
  ]);

  const buildCard = (d) => {
    const id = norm(d.id);
    const isDummy = id.startsWith('dummy-') || id === 'native';
    const a = mk("a", "cast-card");

    if (isDummy) {
      a.classList.add('cast-card-placeholder');
      a.href = "#";
      a.style.pointerEvents = "none";
    } else {
      a.href = `cast.html#${encodeURIComponent(id)}`;
    }

    a.setAttribute("data-id", id);
    a.setAttribute("aria-label", `${d.dragonTitle || d.name}`);

    const flash = mk("span", "cast-flash");
    a.appendChild(flash);

    if (isDummy) {
      // Create placeholder content
      const placeholder = mk("div", "cast-placeholder-content");

      const icon = mk("div", "placeholder-icon");
      icon.textContent = "🐉";
      placeholder.appendChild(icon);

      const text = mk("div", "placeholder-text");
      text.textContent = "準備中";
      placeholder.appendChild(text);

      a.appendChild(placeholder);
    } else {
      const img = mk("img");
      img.alt = d.dragonTitle || d.name || id;
      img.loading = "lazy";
      img.decoding = "async";

      // Set responsive images with srcset
      img.srcset = `assets/img/cards/${id}_card-400w.webp 400w, assets/img/cards/${id}_card-600w.webp 600w`;
      img.sizes = "(max-width: 768px) 400px, 600px";

      const cands = pickCandidates(id);
      let idx = 0;
      const tryNext = () => {
        if (idx >= cands.length) {
          console.warn(`No image found for dragon: ${id}`);
          // Create fallback placeholder
          a.classList.add('cast-card-placeholder');
          const placeholder = mk("div", "cast-placeholder-content");
          const icon = mk("div", "placeholder-icon");
          icon.textContent = "🐉";
          placeholder.appendChild(icon);
          const text = mk("div", "placeholder-text");
          text.textContent = "準備中";
          placeholder.appendChild(text);
          a.appendChild(placeholder);
          return;
        }
        img.src = cands[idx++];
      };
      img.onerror = tryNext;
      img.onload = () => {
        // Successfully loaded
        img.style.opacity = "1";
      };

      // Start with transparent until loaded
      img.style.opacity = "0";
      img.style.transition = "opacity 0.3s ease";

      tryNext();

      a.appendChild(img);
    }

    return a;
  };

  // Build 1st set
  track.innerHTML = "";
  const frag = document.createDocumentFragment();
  dragons.forEach((d) => frag.appendChild(buildCard(d)));
  track.appendChild(frag);

  // Duplicate for seamless loop - rebuild cards instead of cloning
  const frag2 = document.createDocumentFragment();
  dragons.forEach((d) => frag2.appendChild(buildCard(d)));
  track.appendChild(frag2);

  // Mark counts (for JS loop calculations)
  track.dataset.originalCount = String(dragons.length);
})();