// ================================================
// main.js — Portfolio Interaktivität
// ================================================

// ------------------------------------------------
// 0. BURGER MENÜ — Mobile Navigation
// ------------------------------------------------
const menuBtn    = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

menuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
});

// Menü schließen wenn ein Link geklickt wird
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
  });
});

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

form.addEventListener('submit', async(e) => {
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

  /*try {
    //POST-Anfrage an Node.js Server
    const response = await fetch('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({name, email, message})
    });*/

    try {
      //Formspree URL : https://formspree.io/f/xbdpybqr
      const response = await fetch('https://formspree.io/f/xbdpybqr', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({name, email, message})
      });
    

    // Antwort als JSON lesen
    const data = await response.json();

    if (response.ok) {
      showFeedback(`Danke, ${name}! Deine Nachricht wurde gesendet. ✓`, 'success');
      form.reset();
    } else {
      showFeedback(data.error || 'Ein Fehler ist aufgetreten.', 'error');
    }

    // if (data.success) {
    //   showFeedback(data.message, 'success');
    //   form.reset();
    // } else {
    //   showFeedback(data.error, 'error');
    // }
  } catch (error) {
    //Netzwerkfehler → Server läuft vielleicht nicht
    showFeedback('Fehler beim Senden. Bitte versuche es erneut.', 'error');
    console.error(error);
  } finally {
    //Button immer wieder aktivieren
    submitBtn.disabled = false;
    submitBtn.textContent = 'Nachricht senden';
  }
});


// Hilfsfunktion: Feedback anzeigen
function showFeedback(message, type) {
    feedback.textContent = message;
    feedback.classList.remove('hidden', 'text-red-300', 'text-green-300');
    feedback.classList.add(type === 'error' ? 'text-red-300' : 'text-green-300');
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