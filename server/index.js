// ================================================
// server/index.js — Express Backend
// ================================================

// Abhängigkeiten laden
const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');
const path    = require('path');

// .env Variablen laden
dotenv.config({ path: path.join(__dirname, '.env') });

// Express App erstellen
const app  = express();
const PORT = process.env.PORT || 3000;


// ------------------------------------------------
// MIDDLEWARE
// Middleware = Funktionen die bei JEDER Anfrage
// ausgeführt werden, bevor die Route antwortet
// ------------------------------------------------

// CORS erlauben → Frontend darf den Server ansprechen
app.use(cors());

// JSON-Body parsen → wir können req.body lesen
app.use(express.json());

// Statische Dateien aus /src ausliefern
// → http://localhost:3000 zeigt index.html
app.use(express.static(path.join(__dirname, '../src')));


// ------------------------------------------------
// ROUTES
// ------------------------------------------------

// GET / → Startseite (wird von static ausgeliefert)
// Kein Code nötig — express.static übernimmt das


// POST /api/contact → Formular empfangen
app.post('/api/contact', (req, res) => {

  // Daten aus dem Request-Body lesen
  const { name, email, message } = req.body;

  // Validierung: sind alle Felder vorhanden?
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: 'Alle Felder sind erforderlich.'
    });
  }

  // E-Mail-Format prüfen (einfache Regex)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Ungültige E-Mail-Adresse.'
    });
  }

  // Nachricht in der Konsole ausgeben (später: E-Mail senden)
  console.log('📬 Neue Nachricht empfangen:');
  console.log(`   Name:    ${name}`);
  console.log(`   E-Mail:  ${email}`);
  console.log(`   Nachricht: ${message}`);

  // Erfolgreich antworten
  return res.status(200).json({
    success: true,
    message: `Danke, ${name}! Deine Nachricht wurde empfangen.`
  });
});


// ------------------------------------------------
// SERVER STARTEN
// ------------------------------------------------
app.listen(PORT, () => {
  console.log(`✅ Server läuft auf http://localhost:${PORT}`);
});