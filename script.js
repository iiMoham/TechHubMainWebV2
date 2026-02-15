// ==========================================
// TYPING ANIMATION - HERO
// ==========================================
const element = document.querySelector('.text');
if (element) {
  const sentences = [
    { text: "اختر لعبتك", rtl: true },
    { text: "Choose Your Game", rtl: false }
  ];

  let i = 0, j = 0, deleting = false;

  function type() {
    const current = sentences[i];
    element.style.direction = current.rtl ? "rtl" : "ltr";
    element.textContent = current.text.substring(0, j);

    if (!deleting) {
      if (j < current.text.length) j++;
      else { deleting = true; setTimeout(type, 2000); return; }
    } else {
      if (j > 0) j--;
      else {
        deleting = false;
        i = (i + 1) % sentences.length;
      }
    }
    setTimeout(type, deleting ? 50 : 100);
  }
  type();
}

// ==========================================
// TYPING ANIMATION - ANALYTICS
// ==========================================
const analyticsElement = document.querySelector('.analyticsText');
if (analyticsElement) {
  const analyticsSentences = [
    { text: "شاهد الإحصائيات", rtl: true },
    { text: "View Analytics", rtl: false }
  ];

  let ai = 0, aj = 0, aDeleting = false;

  function analyticsType() {
    const current = analyticsSentences[ai];
    analyticsElement.style.direction = current.rtl ? "rtl" : "ltr";
    analyticsElement.textContent = current.text.substring(0, aj);

    if (!aDeleting) {
      if (aj < current.text.length) aj++;
      else { aDeleting = true; setTimeout(analyticsType, 2000); return; }
    } else {
      if (aj > 0) aj--;
      else {
        aDeleting = false;
        ai = (ai + 1) % analyticsSentences.length;
      }
    }
    setTimeout(analyticsType, aDeleting ? 50 : 100);
  }
  analyticsType();
}

// ==========================================
// NAVBAR SCROLL EFFECT
// ==========================================
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ==========================================
// SCROLL REVEAL (IntersectionObserver)
// ==========================================
function initReveal() {
  const revealElements = document.querySelectorAll('.reveal-up, .game-card, .analytics-card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

// ==========================================
// CARD GLOW — FOLLOW MOUSE
// ==========================================
function initCardGlow() {
  const cards = document.querySelectorAll('.game-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');
    });
  });
}

// ==========================================
// SMOOTH SCROLL FOR NAV LINKS
// ==========================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ==========================================
// INIT ALL
// ==========================================
function init() {
  initReveal();
  initCardGlow();
  initSmoothScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
