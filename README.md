# Samuel Jordan Ouabo — Portfolio

> Persönliches Portfolio von Samuel Jordan Ouabo, Masterstudent der Informatik an der FAU Erlangen-Nürnberg.

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

---

## Über das Projekt

Statische Seite ohne Build-Schritt, ausgeliefert aus `docs/` (GitHub Pages).
Die Seite ist zweisprachig (DE/EN) und enthält eine kleine lokale Suchmaschine:
Das Suchfeld im Hero durchsucht die Abschnitte der Seite per BM25, markiert die
Treffer im Text und verlinkt sie als Quellen [1], [2] … Es läuft kein LLM und
es werden keine Daten an einen Server geschickt.

---

## Projektstruktur
```
portfolio/
├── docs/
│   ├── assets/images/   # Profilbild
│   ├── css/main.css     # Design-Tokens & Styles (inkl. Dark Mode)
│   ├── js/main.js       # Sprache, Navigation, Suche, Kontaktformular
│   └── index.html       # Inhalte DE/EN
├── server/index.js      # Alternatives Express-Backend fürs Kontaktformular (ungenutzt, Formspree aktiv)
├── DESIGN.md            # Designentscheidungen
└── package.json
```

---

## Technologien

| Technologie  | Verwendung                                          |
|--------------|-----------------------------------------------------|
| HTML5        | Semantische Struktur, Inhalte in `lang="de"`/`"en"` |
| CSS3         | Tokens, Layout, Dark Mode, reduzierte Bewegung      |
| JavaScript   | BM25-Suche, Sprachumschaltung, Formular             |
| Formspree    | Versand des Kontaktformulars                        |

---

## Lokal ansehen

```bash
python3 -m http.server 5173 --directory docs
```

Dann `http://localhost:5173` im Browser öffnen.

### Inhalte pflegen

- Jeder Text steht zweimal im HTML: `<span lang="de">…</span><span lang="en">…</span>`.
- Elemente mit `data-chunk` landen im Suchindex; die Quelle ist der Titel des umgebenden `data-entry`.

---

## Kontakt

| | |
|---|---|
| **E-Mail** | ouabosamuel10@gmail.com |
| **GitHub** | [github.com/so77nava](https://github.com/so77nava) |
| **Standort** | Erlangen, Deutschland |

---

## Lizenz

MIT © 2026 Samuel Jordan Ouabo
