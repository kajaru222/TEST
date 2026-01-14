/**
 * Cast page - Icon grid scroll functionality
 */

document.addEventListener('DOMContentLoaded', function() {
  const scrollContainer = document.getElementById('iconScrollContainer');
  const scrollUpBtn = document.getElementById('iconScrollUp');
  const scrollDownBtn = document.getElementById('iconScrollDown');
  const iconGrid = document.getElementById('iconGrid');

  if (!scrollContainer || !scrollUpBtn || !scrollDownBtn || !iconGrid) return;

  // Get currently active icon
  function getCurrentActiveIcon() {
    return iconGrid.querySelector('.thumb-btn.is-active');
  }

  // Get list of visible icons
  function getVisibleIcons() {
    return Array.from(iconGrid.querySelectorAll('.thumb-btn')).filter(btn => {
      return btn.style.display !== 'none';
    });
  }

  // Up button click - select previous icon
  scrollUpBtn.addEventListener('click', function() {
    const visibleIcons = getVisibleIcons();
    const currentActive = getCurrentActiveIcon();

    if (visibleIcons.length === 0) return;

    let targetIndex = 0;

    if (currentActive) {
      const currentIndex = visibleIcons.indexOf(currentActive);
      if (currentIndex > 0) {
        targetIndex = currentIndex - 1;
      } else {
        // Wrap to last icon
        targetIndex = visibleIcons.length - 1;
      }
    }

    visibleIcons[targetIndex].click();
  });

  // Down button click - select next icon
  scrollDownBtn.addEventListener('click', function() {
    const visibleIcons = getVisibleIcons();
    const currentActive = getCurrentActiveIcon();

    if (visibleIcons.length === 0) return;

    let targetIndex = 0;

    if (currentActive) {
      const currentIndex = visibleIcons.indexOf(currentActive);
      if (currentIndex < visibleIcons.length - 1) {
        targetIndex = currentIndex + 1;
      } else {
        // Wrap to first icon
        targetIndex = 0;
      }
    }

    visibleIcons[targetIndex].click();
  });
});
