// ================================================
// main.js — Portfolio Interaktivität
// ================================================


// ------------------------------------------------
// 1. NAVBAR — Schatten beim Scrollen hinzufügen
// ------------------------------------------------
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    // Wenn der User mehr als 20px gescrollt hat → Schatten hinzufügen
    navbar.classList.add('shadow-md');
  } else {
    // Zurück nach oben → Schatten entfernen
    navbar.classList.remove('shadow-md');
  }
});


// ------------------------------------------------
// 2. SMOOTH SCROLL — Sanftes Scrollen bei Klick
//    auf Navigationslinks
// ------------------------------------------------
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault(); // Standard-Sprungverhalten verhindern

    const targetId = link.getAttribute('href');       // z.B. "#about"
    const targetEl = document.querySelector(targetId); // Das echte Element finden

    if (targetEl) {
      targetEl.scrollIntoView({
        behavior: 'smooth', // Sanft scrollen
        block: 'start'
      });
    }
  });
});


// ------------------------------------------------
// 3. KONTAKTFORMULAR — Validierung & Feedback
// ------------------------------------------------
const form = document.getElementById('contact-form');
const feedback = document.getElementById('form-feedback');
const submitBtn = document.getElementById('submit-btn');

form.addEventListener('submit', (e) => {
  e.preventDefault(); // Seite nicht neu laden

  // Werte aus dem Formular lesen
  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  // Einfache Validierung
  if (!name || !email || !message) {
    showFeedback('Bitte alle Felder ausfüllen.', 'error');
    return;
  }

  // Button deaktivieren während "Senden"
  submitBtn.disabled = true;
  submitBtn.textContent = 'Wird gesendet...';

  // Simuliertes Senden (wird später mit Node.js ersetzt)
  setTimeout(() => {
    showFeedback(`Danke, ${name}! Deine Nachricht wurde empfangen. ✓`, 'success');
    form.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = 'Nachricht senden';
  }, 1500);
});

// Hilfsfunktion: Feedback anzeigen
function showFeedback(message, type) {
  feedback.textContent = message;
  feedback.classList.remove('hidden', 'text-red-300', 'text-green-300');

  if (type === 'error') {
    feedback.classList.add('text-red-300');
  } else {
    feedback.classList.add('text-green-300');
  }
}


// ------------------------------------------------
// 4. SCROLL ANIMATION — Sektionen sanft einblenden
// ------------------------------------------------

// Alle Sektionen beobachten
const sections = document.querySelectorAll('section');

// IntersectionObserver: wird ausgelöst wenn Element sichtbar wird
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Element ist sichtbar → einblenden
      entry.target.classList.add('opacity-100', 'translate-y-0');
      entry.target.classList.remove('opacity-0', 'translate-y-4');
    }
  });
}, { threshold: 0.1 }); // 10% des Elements muss sichtbar sein

// Anfangszustand setzen und Observer starten
sections.forEach(section => {
  section.classList.add('opacity-0', 'translate-y-4', 'transition-all', 'duration-700');
  observer.observe(section);
});