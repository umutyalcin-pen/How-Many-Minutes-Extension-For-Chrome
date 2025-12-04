/**
 * Reading Time Extension
 * Calculates reading time based on 225 WPM.
 * Supports SPAs via MutationObserver.
 */

(function () {
  const WPM = 225;
  let debounceTimer;
  let lastTextLength = 0;

  function calculateReadingTime() {
    // Select text-heavy elements. 
    const article = document.querySelector('article') || document.body;

    if (!article) return;

    // Get text content
    const text = article.innerText || "";

    // Optimization: If text length hasn't changed significantly (e.g. < 100 chars), skip
    if (Math.abs(text.length - lastTextLength) < 100) return;
    lastTextLength = text.length;

    // Simple word count: split by whitespace
    const wordCount = text.trim().split(/\s+/).length;

    // Calculate minutes
    const readingTimeMinutes = Math.ceil(wordCount / WPM);

    updateBadge(readingTimeMinutes);
  }

  function updateBadge(minutes) {
    // Remove existing badge
    const existingBadge = document.querySelector('.reading-time-badge');
    if (existingBadge) {
      existingBadge.remove();
    }

    // Don't show if it's too short (e.g. < 1 min)
    if (minutes < 1) return;

    const badge = document.createElement('div');
    badge.className = 'reading-time-badge';

    // SVG Icon (Book/Clock style)
    const icon = `
      <svg class="reading-time-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 6V12L16 14M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>
    `;

    badge.innerHTML = `${icon} <span>${minutes} dk okuma</span>`;

    // Add click listener to hide
    badge.addEventListener('click', () => {
      badge.classList.remove('visible');
      // Wait for animation to finish before hiding
      setTimeout(() => {
        badge.style.display = 'none';
      }, 400);
    });

    document.body.appendChild(badge);

    // Trigger animation
    requestAnimationFrame(() => {
      badge.classList.add('visible');
    });
  }

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggle_badge") {
      const badge = document.querySelector('.reading-time-badge');
      if (badge) {
        if (badge.style.display === 'none') {
          badge.style.display = 'flex';
          requestAnimationFrame(() => badge.classList.add('visible'));
        } else {
          badge.classList.remove('visible');
          setTimeout(() => { badge.style.display = 'none'; }, 400);
        }
      } else {
        // Force recalc if not present
        calculateReadingTime();
      }
    }
  });

  // Debounce function to prevent excessive calculations during page load/updates
  function onMutation() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      calculateReadingTime();
    }, 1000); // Wait 1 second after last change
  }

  // Initial run
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', calculateReadingTime);
  } else {
    calculateReadingTime();
  }

  // Watch for changes (SPA support)
  const observer = new MutationObserver(onMutation);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

})();
