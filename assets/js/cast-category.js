/**
 * Cast page - Category selection functionality
 */

// Category definitions
const DRAGON_CATEGORIES = {
  dragons: ['liuu', 'lyco', 'hicolili', 'lis', 'sulia', 'xuemei', 'native'],
  servants: ['blu-ronron', 'pnk-ronron', 'red-ronron']
};

let currentCategory = 'dragons';

document.addEventListener('DOMContentLoaded', function() {
  const categoryItems = document.querySelectorAll('.category-item');

  categoryItems.forEach(item => {
    item.addEventListener('click', function() {
      const category = this.getAttribute('data-category');

      // Update active state
      categoryItems.forEach(ci => ci.classList.remove('active'));
      this.classList.add('active');

      // Update category
      currentCategory = category;

      // Rebuild icon grid
      filterIconsByCategory(category);
    });
  });

  // Initial display
  filterIconsByCategory('dragons');
});

function filterIconsByCategory(category) {
  const iconGrid = document.getElementById('iconGrid');
  if (!iconGrid) return;

  const allowedIds = DRAGON_CATEGORIES[category];
  const allButtons = iconGrid.querySelectorAll('.thumb-btn');

  // Visible icon index counter
  let visibleIndex = 0;

  allButtons.forEach((btn) => {
    const dragonId = btn.getAttribute('data-id');

    // Remove animation class first to reset to initial state
    btn.classList.remove('fade-in');
    // Preserve active state
    const wasActive = btn.classList.contains('is-active');

    if (allowedIds.includes(dragonId)) {
      btn.style.display = '';

      // Temporarily remove active state to run animation
      if (wasActive) {
        btn.classList.remove('is-active');
      }

      // Stagger animation for visible icons
      const delay = visibleIndex * 50;
      setTimeout(() => {
        btn.classList.add('fade-in');

        // Restore active state after animation
        if (wasActive) {
          setTimeout(() => {
            btn.classList.add('is-active');
          }, 500);
        }

        // Clear inline styles after animation completes
        setTimeout(() => {
          btn.style.transform = '';
          btn.style.opacity = '';
        }, 500);
      }, delay);

      visibleIndex++;
    } else {
      btn.style.display = 'none';
    }
  });
}
