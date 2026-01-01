/**
 * Tab navigation functionality
 * Used in about.html and intro.html
 */

function openTab(evt, contentId) {
  // Hide all tab content
  const tabcontent = document.getElementsByClassName("tab-content");
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].classList.remove("active");
  }

  // Remove active class from all tab buttons
  const tabbuttons = document.getElementsByClassName("tab-button");
  for (let i = 0; i < tabbuttons.length; i++) {
    tabbuttons[i].classList.remove("active");
  }

  // Show the current tab content
  document.getElementById(contentId).classList.add("active");

  // Add active class to the clicked button
  evt.currentTarget.classList.add("active");

  // Scroll to top
  window.scrollTo(0, 0);
}
