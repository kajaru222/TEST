/**
 * Cast card drag scroll - Rebuilt for reliability
 * Features: Drag scroll, infinite loop, click-through to cast.html
 */
(() => {
  // Only run on top page
  if (!document.body.classList.contains("page-top")) return;

  const viewport = document.getElementById("castScroll");
  const track = document.getElementById("castTrack");
  if (!viewport || !track) return;

  // State
  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;
  let velocity = 0;
  let animationId = null;
  let lastMoveX = 0;
  let lastMoveTime = 0;

  // Get loop width (width of one set of cards)
  const getLoopWidth = () => {
    const count = parseInt(track.dataset.originalCount || "0", 10);
    if (count === 0) return 0;

    const cards = Array.from(track.querySelectorAll(".cast-card"));
    if (cards.length < count) return 0;

    const firstSet = cards.slice(0, count);
    const firstCard = firstSet[0];
    const lastCard = firstSet[count - 1];

    if (!firstCard || !lastCard) return 0;

    const firstLeft = firstCard.offsetLeft;
    const lastRight = lastCard.offsetLeft + lastCard.offsetWidth;
    return lastRight - firstLeft;
  };

  // Get current scroll position
  const getScrollLeft = () => {
    const transform = track.style.transform || "";
    const match = transform.match(/translate3d\(([^,]+)/);
    if (!match) return 0;
    return parseFloat(match[1]) || 0;
  };

  // Set scroll position
  const setScrollLeft = (x) => {
    track.style.transform = `translate3d(${x}px, 0, 0)`;
  };

  // Wrap scroll position for infinite loop
  const wrapScroll = (scroll) => {
    const loopWidth = getLoopWidth();
    if (loopWidth === 0) return scroll;

    // Keep scroll in range [-loopWidth, 0]
    while (scroll > 0) {
      scroll -= loopWidth;
    }
    while (scroll <= -loopWidth) {
      scroll += loopWidth;
    }
    return scroll;
  };

  // Animation loop for momentum
  const animate = () => {
    if (isDragging) {
      animationId = requestAnimationFrame(animate);
      return;
    }

    // Apply velocity
    if (Math.abs(velocity) > 0.1) {
      scrollLeft += velocity;
      scrollLeft = wrapScroll(scrollLeft);
      setScrollLeft(scrollLeft);

      // Decay velocity
      velocity *= 0.95;
      animationId = requestAnimationFrame(animate);
    } else {
      velocity = 0;
      animationId = null;
    }
  };

  // Start animation loop
  const startAnimation = () => {
    if (!animationId) {
      animationId = requestAnimationFrame(animate);
    }
  };

  // Stop animation loop
  const stopAnimation = () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  };

  // Mouse/touch down
  const onPointerDown = (e) => {
    // Only handle left mouse button or touch
    if (e.type === "mousedown" && e.button !== 0) return;

    isDragging = true;
    viewport.classList.add("is-dragging");

    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    startX = clientX;
    scrollLeft = getScrollLeft();
    velocity = 0;
    lastMoveX = clientX;
    lastMoveTime = Date.now();

    stopAnimation();

    // Prevent text selection
    e.preventDefault();
  };

  // Mouse/touch move
  const onPointerMove = (e) => {
    if (!isDragging) return;

    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - startX;
    const now = Date.now();
    const dt = now - lastMoveTime;

    // Update scroll position
    scrollLeft = wrapScroll(getScrollLeft() - (lastMoveX - clientX));
    setScrollLeft(scrollLeft);

    // Calculate velocity for momentum
    if (dt > 0) {
      velocity = (clientX - lastMoveX) / dt * 16; // Scale to ~60fps
    }

    lastMoveX = clientX;
    lastMoveTime = now;

    e.preventDefault();
  };

  // Mouse/touch up
  const onPointerUp = (e) => {
    if (!isDragging) return;

    isDragging = false;
    viewport.classList.remove("is-dragging");

    const clientX = e.type === "touchend" ? lastMoveX : e.clientX;
    const totalDragDistance = Math.abs(clientX - startX);

    // If dragged more than 5px, prevent click and start momentum
    if (totalDragDistance > 5) {
      // Prevent link click
      const preventClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      };

      // Add one-time click preventer
      track.addEventListener("click", preventClick, { capture: true, once: true });

      // Start momentum animation
      startAnimation();
    } else {
      // Just a click - no momentum
      velocity = 0;
    }
  };

  // Mouse events
  viewport.addEventListener("mousedown", onPointerDown);
  viewport.addEventListener("mousemove", onPointerMove);
  viewport.addEventListener("mouseup", onPointerUp);
  viewport.addEventListener("mouseleave", onPointerUp);

  // Touch events
  viewport.addEventListener("touchstart", onPointerDown, { passive: false });
  viewport.addEventListener("touchmove", onPointerMove, { passive: false });
  viewport.addEventListener("touchend", onPointerUp);
  viewport.addEventListener("touchcancel", onPointerUp);

  // Prevent context menu on long press
  viewport.addEventListener("contextmenu", (e) => {
    if (isDragging) e.preventDefault();
  });

  // Handle window resize
  window.addEventListener("resize", () => {
    scrollLeft = wrapScroll(getScrollLeft());
    setScrollLeft(scrollLeft);
  });

  // Initialize position
  setTimeout(() => {
    scrollLeft = wrapScroll(0);
    setScrollLeft(scrollLeft);
  }, 100);
})();
