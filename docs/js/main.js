// ================================================
// main.js — Portfolio Interaktivität
// Sprache, Navigation, lokale Suche (BM25), Kontaktformular
// ================================================

(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // localStorage kann in privaten Fenstern werfen
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* ignorieren */ } },
  };

  const STRINGS = {
    de: {
      title: 'Samuel Jordan Ouabo – AI & Software Engineer',
      indexSize: 'Index: {n} Abschnitte',
      hits: '{k} Treffer in {n} Abschnitten für „{q}“',
      noHits: 'Keine Treffer für „{q}“. Versuch es mit RAG, Python oder Docker.',
      skillCount: '{label}: in {n} Abschnitten erwähnt, anzeigen',
      skillNone: '{label}: anzeigen',
      fillAll: 'Bitte fülle alle drei Felder aus.',
      badEmail: 'Diese E-Mail-Adresse sieht nicht vollständig aus.',
      sending: 'Wird gesendet …',
      sent: 'Danke, {name}! Deine Nachricht ist angekommen.',
      failed: 'Senden hat nicht geklappt. Schreib mir gern direkt an ouabosamuel10@gmail.com.',
      menuOpen: 'Menü schließen',
      menuClosed: 'Menü öffnen',
    },
    en: {
      title: 'Samuel Jordan Ouabo – AI & Software Engineer',
      indexSize: 'Index: {n} sections',
      hits: '{k} hits in {n} sections for “{q}”',
      noHits: 'No hits for “{q}”. Try RAG, Python or Docker.',
      skillCount: '{label}: mentioned in {n} sections, show',
      skillNone: '{label}: show',
      fillAll: 'Please fill in all three fields.',
      badEmail: 'That email address looks incomplete.',
      sending: 'Sending …',
      sent: 'Thanks, {name}! Your message has arrived.',
      failed: 'Sending failed. Feel free to email me directly at ouabosamuel10@gmail.com.',
      menuOpen: 'Close menu',
      menuClosed: 'Open menu',
    },
  };

  let lang = root.lang === 'en' ? 'en' : 'de';
  const t = (key, vars = {}) =>
    STRINGS[lang][key].replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : ''));


  // ------------------------------------------------
  // 1. SPRACHE
  // ------------------------------------------------
  const langButtons = document.querySelectorAll('[data-set-lang]');

  function applyLang(next) {
    lang = next;
    root.lang = next;
    document.title = t('title');
    langButtons.forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.setLang === next)));
    document.querySelectorAll('[data-ph-de]').forEach(el => {
      el.setAttribute('placeholder', el.dataset['ph' + (next === 'de' ? 'De' : 'En')]);
    });
    updateMenuLabel();
  }

  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.setLang === lang) return;
      store.set('lang', btn.dataset.setLang);
      applyLang(btn.dataset.setLang);
      // Index neu aufbauen, weil sich der sichtbare Text geändert hat
      buildIndex();
      updateSkillCounts();
      runSearch(input.value, { quiet: true });
    });
  });


  // ------------------------------------------------
  // 2. NAVIGATION
  // ------------------------------------------------
  const masthead = document.getElementById('masthead');
  const menuBtn = document.getElementById('menu-btn');
  const nav = document.getElementById('nav');

  function updateMenuLabel() {
    const open = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-label', t(open ? 'menuOpen' : 'menuClosed'));
  }

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
    updateMenuLabel();
  }

  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
  });

  const onScroll = () => masthead.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Aktiven Abschnitt in der Navigation markieren
  const navLinks = [...nav.querySelectorAll('a')];
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(a => a.setAttribute('aria-current', String(a.hash === '#' + entry.target.id)));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach(a => { const s = document.querySelector(a.hash); if (s) spy.observe(s); });


  // ------------------------------------------------
  // 3. LOKALE SUCHE — BM25 über die Abschnitte der Seite
  // ------------------------------------------------
  const form = document.getElementById('search-form');
  const input = document.getElementById('q');
  const statusEl = document.getElementById('search-status');
  const resultsEl = document.getElementById('results');
  const consoleEl = document.getElementById('console');

  const STOP = new Set((
    'der die das und oder mit von zu im in am an auf für über bei aus als ein eine einer eines einem einen ' +
    'ich mein meine dem den des ist sind wird werden auch sowie inkl vs zur zum nach durch ' +
    'the a an and or of to in on at for with by from as is are be it its my via into'
  ).split(' '));

  // Kleine Synonymliste, damit Fragen in beiden Sprachen und mit Alltagswörtern greifen
  const SYNONYMS = {
    ki: ['ai', 'llm'], ai: ['ki', 'llm'], llm: ['ki', 'ai', 'mistral', 'ollama', 'openai'],
    lehre: ['übungsleiter', 'übungsgruppen', 'vermittlung'],
    teaching: ['exercise', 'groups'],
    datenbank: ['datenbanken', 'sql', 'postgresql', 'mysql', 'mariadb', 'mongodb'],
    database: ['databases', 'sql', 'postgresql', 'mysql', 'mariadb', 'mongodb'],
    frontend: ['angular', 'vue.js', 'spa', 'typescript'],
    backend: ['asp.net', 'flask', 'express', 'node.js', 'rest'],
    cloud: ['openstack', 'docker', 'kubernetes', 'deployment'],
    sicherheit: ['garak', 'jwt', 'rbac', 'dsgvo'], security: ['garak', 'jwt', 'rbac', 'gdpr'],
    rag: ['retrieval', 'chromadb', 'vektorsuche', 'vector'],
  };

  const TOKEN_RE = /[\p{L}\p{N}](?:[\p{L}\p{N}#+.\-]*[\p{L}\p{N}#+])?/gu;

  const norm = s => s.toLowerCase().normalize('NFKC');

  // Ganze Token plus Teile, damit „Node“ auch „node.js“ und „RAG“ auch „rag-system“ findet
  function tokenize(text) {
    const out = [];
    for (const m of norm(text).matchAll(TOKEN_RE)) {
      const tok = m[0];
      if (!STOP.has(tok)) out.push(tok);
      if (/[.\-]/.test(tok)) {
        tok.split(/[.\-]+/).forEach(part => { if (part && !STOP.has(part)) out.push(part); });
      }
    }
    return out;
  }

  // Textknoten in der aktiven Sprache
  function isOtherLang(node) {
    const el = (node.nodeType === 1 ? node : node.parentElement).closest('[lang]');
    return el && el !== root && el.lang !== lang;
  }

  function textNodes(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: n => (n.nodeValue.trim() && !isOtherLang(n))
        ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    return nodes;
  }

  const visibleText = el => textNodes(el).map(n => n.nodeValue).join(' ').replace(/\s+/g, ' ').trim();

  let docs = [];
  let vocab = [];
  let avgLen = 1;

  function buildIndex() {
    const chunks = [...document.querySelectorAll('[data-chunk]')];
    docs = chunks.map((el, i) => {
      if (!el.id) el.id = 'c-' + (i + 1);
      const text = visibleText(el);
      const tokens = tokenize(text);
      const tf = new Map();
      tokens.forEach(tok => tf.set(tok, (tf.get(tok) || 0) + 1));
      const entry = el.closest('[data-entry]');
      const titleEl = entry && entry.querySelector('.entry-title');
      const source = titleEl ? visibleText(titleEl) : '';
      // Tag-Listen sind kurz und würden BM25 sonst dominieren
      const boost = el.classList.contains('tags') ? 0.55 : 1;
      return { el, text, tf, len: tokens.length || 1, source, boost };
    });
    const all = new Set();
    docs.forEach(d => d.tf.forEach((_, k) => all.add(k)));
    vocab = [...all];
    avgLen = docs.reduce((s, d) => s + d.len, 0) / Math.max(docs.length, 1);
  }

  // Welche Index-Wörter passen zu einem Suchwort, mit welchem Gewicht?
  function expandTerm(q) {
    const matches = new Map();
    for (const v of vocab) {
      let w = 0;
      if (v === q) w = 1;
      else if (q.length >= 5 && v.startsWith(q)) w = 0.7;
      else if (q.length >= 5 && v.includes(q)) w = 0.5;
      if (w) matches.set(v, Math.max(matches.get(v) || 0, w));
    }
    return matches;
  }

  function search(query) {
    const qTokens = [...new Set(tokenize(query))];
    if (!qTokens.length) return { results: [], terms: new Set() };

    // Suchwörter plus Synonyme (Synonyme zählen weniger)
    const weighted = new Map();
    qTokens.forEach(q => {
      weighted.set(q, 1);
      (SYNONYMS[q] || []).forEach(s => { if (!weighted.has(s)) weighted.set(s, 0.4); });
    });

    const k1 = 1.2, b = 0.75, N = docs.length;
    const scores = new Array(N).fill(0);
    const terms = new Set();

    weighted.forEach((qWeight, q) => {
      const matches = expandTerm(q);
      if (!matches.size) return;
      matches.forEach((_, v) => terms.add(v));

      const tfs = docs.map(d => {
        let tf = 0;
        matches.forEach((w, v) => { tf += (d.tf.get(v) || 0) * w; });
        return tf;
      });
      const df = tfs.filter(x => x > 0).length;
      const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));

      tfs.forEach((tf, i) => {
        if (!tf) return;
        const sat = tf * (k1 + 1) / (tf + k1 * (1 - b + b * docs[i].len / avgLen));
        scores[i] += qWeight * idf * sat * docs[i].boost;
      });
    });

    const results = scores
      .map((score, i) => ({ score, doc: docs[i] }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score);

    return { results, terms };
  }

  // Ein Wort trifft, wenn es selbst oder einer seiner Teile im Trefferset liegt
  function tokenHits(tok, terms) {
    const n = norm(tok);
    if (terms.has(n)) return true;
    return /[.\-]/.test(n) && n.split(/[.\-]+/).some(p => terms.has(p));
  }

  // Textmarker im Dokument setzen
  function clearMarks() {
    document.querySelectorAll('mark.hl').forEach(m => {
      const parent = m.parentNode;
      parent.replaceChild(document.createTextNode(m.textContent), m);
      parent.normalize();
    });
    document.querySelectorAll('[data-cite]').forEach(el => el.removeAttribute('data-cite'));
  }

  function markChunk(el, terms) {
    textNodes(el).forEach(node => {
      const text = node.nodeValue;
      const frag = document.createDocumentFragment();
      let last = 0, found = false;
      for (const m of text.matchAll(TOKEN_RE)) {
        if (!tokenHits(m[0], terms)) continue;
        found = true;
        frag.append(text.slice(last, m.index));
        const mark = document.createElement('mark');
        mark.className = 'hl';
        mark.textContent = m[0];
        frag.append(mark);
        last = m.index + m[0].length;
      }
      if (!found) return;
      frag.append(text.slice(last));
      node.parentNode.replaceChild(frag, node);
    });
  }

  // Ausschnitt rund um den ersten Treffer, als DOM (kein innerHTML)
  function snippet(text, terms) {
    const span = document.createElement('span');
    span.className = 'hit-snippet';
    let first = -1;
    for (const m of text.matchAll(TOKEN_RE)) {
      if (tokenHits(m[0], terms)) { first = m.index; break; }
    }
    let start = Math.max(0, first - 50);
    if (start > 0) start = text.indexOf(' ', start) + 1 || start;
    const cut = text.slice(start);
    if (start > 0) span.append('… ');
    let last = 0;
    for (const m of cut.matchAll(TOKEN_RE)) {
      if (!tokenHits(m[0], terms)) continue;
      span.append(cut.slice(last, m.index));
      const mark = document.createElement('mark');
      mark.textContent = m[0];
      span.append(mark);
      last = m.index + m[0].length;
    }
    span.append(cut.slice(last));
    return span;
  }

  const MAX_RESULTS = 4;
  let lastQuery = null;

  function runSearch(raw, { quiet = false } = {}) {
    const query = raw.trim();
    clearMarks();
    resultsEl.replaceChildren();
    resultsEl.classList.remove('is-fresh');
    syncActiveButtons(query);

    if (!query) {
      statusEl.textContent = t('indexSize', { n: docs.length });
      lastQuery = '';
      return;
    }

    const { results, terms } = search(query);

    if (!results.length) {
      statusEl.textContent = '';
      const li = document.createElement('li');
      li.className = 'results-empty';
      li.textContent = t('noHits', { q: query });
      resultsEl.append(li);
      lastQuery = query;
      return;
    }

    results.forEach(r => markChunk(r.doc.el, terms));

    // Höchstens zwei Zitate pro Eintrag, damit die Treffer breit streuen
    const perEntry = new Map();
    const cited = results.filter(r => {
      const key = r.doc.source;
      const n = perEntry.get(key) || 0;
      perEntry.set(key, n + 1);
      return n < 2;
    }).slice(0, MAX_RESULTS);

    cited.forEach((r, i) => {
      r.doc.el.dataset.cite = String(i + 1);
      const li = document.createElement('li');
      li.style.setProperty('--i', i);
      const a = document.createElement('a');
      a.className = 'hit';
      a.href = '#' + r.doc.el.id;
      const ref = document.createElement('span');
      ref.className = 'hit-ref';
      ref.textContent = '[' + (i + 1) + ']';
      const src = document.createElement('span');
      src.className = 'hit-src';
      src.textContent = r.doc.source;
      a.append(ref, src, snippet(r.doc.text, terms));
      a.addEventListener('click', () => flashTarget(r.doc.el));
      li.append(a);
      resultsEl.append(li);
    });

    statusEl.textContent = t('hits', { k: cited.length, n: results.length, q: query });

    if (!quiet && query !== lastQuery) {
      void resultsEl.offsetWidth; // Animation neu starten
      resultsEl.classList.add('is-fresh');
    }
    lastQuery = query;
  }

  function flashTarget(el) {
    el.classList.remove('is-target');
    void el.offsetWidth;
    el.classList.add('is-target');
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
    el.addEventListener('animationend', () => el.classList.remove('is-target'), { once: true });
  }

  // Aktive Chips und Skill-Buttons hervorheben
  const queryButtons = [...document.querySelectorAll('.chip, .skill')];
  const buttonQuery = btn => btn.dataset.q || btn.dataset['q' + (lang === 'de' ? 'De' : 'En')] || '';

  function syncActiveButtons(query) {
    const q = norm(query);
    queryButtons.forEach(btn => btn.classList.toggle('is-active', !!q && norm(buttonQuery(btn)) === q));
  }

  let debounce;
  input.addEventListener('input', () => {
    stopDemo();
    clearTimeout(debounce);
    debounce = setTimeout(() => runSearch(input.value), 140);
  });
  input.addEventListener('focus', stopDemo);
  form.addEventListener('submit', e => {
    e.preventDefault();
    stopDemo();
    clearTimeout(debounce);
    runSearch(input.value);
  });

  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      stopDemo();
      input.value = buttonQuery(chip);
      runSearch(input.value);
    });
  });

  // Skills: Klick zeigt, wo die Technologie vorkommt
  const skillButtons = [...document.querySelectorAll('.skill')];

  function updateSkillCounts() {
    skillButtons.forEach(btn => {
      const label = btn.dataset.label || btn.textContent.trim();
      btn.dataset.label = label;
      const n = search(buttonQuery(btn)).results.length;
      let badge = btn.querySelector('.skill-n');
      if (n) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'skill-n';
          badge.setAttribute('aria-hidden', 'true');
          btn.append(badge);
        }
        badge.textContent = n;
      } else if (badge) {
        badge.remove();
      }
      btn.setAttribute('aria-label', n ? t('skillCount', { label, n }) : t('skillNone', { label }));
    });
  }

  skillButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      stopDemo();
      input.value = buttonQuery(btn);
      runSearch(input.value);
      consoleEl.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
    });
  });

  // Einmalige Vorführung: tippt „LLM“ und zeigt die Treffer
  let demoTimer = null;
  let demoRunning = false;

  function stopDemo() {
    if (!demoRunning) return;
    demoRunning = false;
    clearTimeout(demoTimer);
  }

  function startDemo(word) {
    if (reduceMotion.matches) {
      input.value = word;
      runSearch(word);
      return;
    }
    demoRunning = true;
    let i = 0;
    const step = () => {
      if (!demoRunning) return;
      i += 1;
      input.value = word.slice(0, i);
      if (i < word.length) {
        demoTimer = setTimeout(step, 140);
      } else {
        demoRunning = false;
        runSearch(word);
      }
    };
    demoTimer = setTimeout(step, 700);
  }

  applyLang(lang);
  buildIndex();
  updateSkillCounts();
  runSearch('');
  startDemo('LLM');


  // ------------------------------------------------
  // 4. KONTAKTFORMULAR — Formspree
  // ------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('submit-btn');
  const submitLabel = submitBtn.querySelector('.btn-label');

  function showFeedback(message, type) {
    feedback.textContent = message;
    feedback.classList.toggle('is-error', type === 'error');
    feedback.classList.toggle('is-ok', type === 'ok');
  }

  contactForm.addEventListener('submit', async e => {
    e.preventDefault();

    const fields = ['name', 'email', 'message'].map(id => document.getElementById(id));
    fields.forEach(f => f.removeAttribute('aria-invalid'));
    const [name, email, message] = fields.map(f => f.value.trim());

    const empty = fields.filter(f => !f.value.trim());
    if (empty.length) {
      empty.forEach(f => f.setAttribute('aria-invalid', 'true'));
      empty[0].focus();
      showFeedback(t('fillAll'), 'error');
      return;
    }
    if (!fields[1].checkValidity()) {
      fields[1].setAttribute('aria-invalid', 'true');
      fields[1].focus();
      showFeedback(t('badEmail'), 'error');
      return;
    }

    submitBtn.disabled = true;
    const savedLabel = [...submitLabel.childNodes].map(n => n.cloneNode(true));
    submitLabel.textContent = t('sending');
    showFeedback('', null);

    try {
      const response = await fetch('https://formspree.io/f/xbdpybqr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (response.ok) {
        showFeedback(t('sent', { name }), 'ok');
        contactForm.reset();
      } else {
        showFeedback(t('failed'), 'error');
      }
    } catch (error) {
      console.error(error);
      showFeedback(t('failed'), 'error');
    } finally {
      submitBtn.disabled = false;
      submitLabel.replaceChildren(...savedLabel);
    }
  });
})();
