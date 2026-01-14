/**
 * Introduction page - Story tab switching functionality
 */

(() => {
  const buttons = Array.from(document.querySelectorAll('.story-btn'));
  const title = document.getElementById('main-title');

  const switchTab = (tab) => {
    // Hide all story sections
    document.querySelectorAll('.story-section').forEach(s => s.classList.remove('active'));

    // Show selected section
    document.getElementById(tab).classList.add('active');

    // Update button active states
    buttons.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));

    // Update title with fade effect
    if (!title) return;
    title.style.opacity = 0;
    setTimeout(() => {
      title.textContent = tab === 'story1' ? '煌龍園の物語' : '龍の遣い(ろんろんちゃん達)について';
      title.style.opacity = 1;
    }, 200);
  };

  // Attach click event listeners
  buttons.forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));
})();
