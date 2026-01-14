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
  let isTouchDown = false;
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

    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;

    // For mouse, set dragging immediately
    // For touch, wait until movement is detected
    if (e.type === "mousedown") {
      isDragging = true;
      viewport.classList.add("is-dragging");
      e.preventDefault();
    } else {
      isTouchDown = true;
    }

    startX = clientX;
    scrollLeft = getScrollLeft();
    velocity = 0;
    lastMoveX = clientX;
    lastMoveTime = Date.now();

    stopAnimation();
  };

  // Mouse/touch move
  const onPointerMove = (e) => {
    if (!isDragging && !isTouchDown) return;

    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const deltaX = Math.abs(clientX - startX);

    // For touch, only start dragging if moved more than 5px
    if (isTouchDown && !isDragging) {
      if (deltaX > 5) {
        isDragging = true;
        isTouchDown = false;
        viewport.classList.add("is-dragging");
      } else {
        return; // Not enough movement yet
      }
    }

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
    // If touch was down but never became a drag, trigger click
    if (isTouchDown) {
      isTouchDown = false;

      // Find the element that was touched
      if (e.type === "touchend" && e.changedTouches && e.changedTouches[0]) {
        const touch = e.changedTouches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);

        // Find the closest .cast-card link
        const link = element?.closest('.cast-card');
        if (link && link.href) {
          // Navigate to the link
          window.location.href = link.href;
        }
      }

      return;
    }

    if (!isDragging) return;

    isDragging = false;
    viewport.classList.remove("is-dragging");

    const clientX = e.type === "touchend" ? lastMoveX : e.clientX;
    const totalDragDistance = Math.abs(clientX - startX);

    // Different thresholds for touch vs mouse
    const dragThreshold = e.type === "touchend" ? 10 : 5;

    // If dragged more than threshold, prevent click and start momentum
    if (totalDragDistance > dragThreshold) {
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
  viewport.addEventListener("touchstart", onPointerDown, { passive: true });
  viewport.addEventListener("touchmove", onPointerMove, { passive: false });
  viewport.addEventListener("touchend", onPointerUp, { passive: true });
  viewport.addEventListener("touchcancel", onPointerUp, { passive: true });

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
