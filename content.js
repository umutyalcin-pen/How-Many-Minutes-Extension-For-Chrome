

(function () {
  const WPM = 225;
  let debounceTimer;
  let lastTextLength = 0;

  function calculateReadingTime() {
    
    const article = document.querySelector('article') || document.body;

    if (!article) return;

   
    const text = article.innerText || "";

    
    if (Math.abs(text.length - lastTextLength) < 100) return;
    lastTextLength = text.length;

    
    const wordCount = text.trim().split(/\s+/).length;

    
    const readingTimeMinutes = Math.ceil(wordCount / WPM);

    updateBadge(readingTimeMinutes);
  }

  function updateBadge(minutes) {
    
    const existingBadge = document.querySelector('.reading-time-badge');
    if (existingBadge) {
      existingBadge.remove();
    }

    
    if (minutes < 1) return;

    const badge = document.createElement('div');
    badge.className = 'reading-time-badge';

    
    const icon = `
      <svg class="reading-time-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 6V12L16 14M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>
    `;

    badge.innerHTML = `${icon} <span>${minutes} dk okuma</span>`;

    
    badge.addEventListener('click', () => {
      badge.classList.remove('visible');
      
      setTimeout(() => {
        badge.style.display = 'none';
      }, 400);
    });

    document.body.appendChild(badge);

    
    requestAnimationFrame(() => {
      badge.classList.add('visible');
    });
  }

  
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
        
        calculateReadingTime();
      }
    }
  });

  
  function onMutation() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      calculateReadingTime();
    }, 1000); 
  }

 
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', calculateReadingTime);
  } else {
    calculateReadingTime();
  }

  
  const observer = new MutationObserver(onMutation);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

})();

