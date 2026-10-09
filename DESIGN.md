# DESIGN.md — Portfolio Samuel Jordan Ouabo

## Richtung: Retrieval-Index

**These:** Die Seite zeigt, was Samuel baut, statt es nur zu behaupten. Der Hero ist eine
Suchkonsole, die den eigenen Werdegang wie ein RAG-System durchsucht: Treffer werden im
Dokument mit Textmarker hervorgehoben und als Quellen [n] zitiert. Abgelehnt: der übliche
Hero mit Foto, Kennzahlen-Kacheln und Skill-Balken.

**Welt:** helles Arbeitsdokument. Kühles Papierweiß, tiefes Grün als Tinte, Limetten-Textmarker
ausschließlich für Treffer und Hervorhebung. Gliederung über Haarlinien und eine
Datumsspalte (Ledger), keine Kartenraster.

**Erster Viewport:** links die These als Display-Headline, kurze Vorstellung, Verfügbarkeit,
Kontakt-CTA; rechts die Konsole, die beim Laden einmal „LLM“ tippt und die Treffer zeigt.

**Signatur-Interaktion:** Suchen → Treffer werden im Text markiert und zitiert. Die
Skill-Buttons lösen dieselbe Suche aus und zeigen, in wie vielen Abschnitten eine Technologie
vorkommt.

## Tokens (docs/css/main.css)

| Rolle | Hell | Dunkel |
|---|---|---|
| `--bg` | `#F4F5F1` | `#0E1210` |
| `--surface` | `#FFFFFF` | `#161C19` |
| `--ink` | `#121614` | `#E8EDE9` |
| `--ink-2` / `--ink-3` | `#3F4742` / `#5E6761` | `#B8C1BB` / `#94A098` |
| `--accent` | `#0B6B50` | `#62D6AA` |
| `--marker` | `#D6F35E` | `#CFEE52` |
| `--contact-bg` | `#0B5A44` | `#0A3B2E` |

- **Farbstrategie:** zurückhaltend mit einer Ausnahme: Der Kontaktbereich ist vollflächig grün
  und bildet so den Abschluss der Seite.
- **Schriften:** Bricolage Grotesque (Display, optische Größen), Hanken Grotesk (Text),
  JetBrains Mono nur für Daten: Zeiträume, Noten, Zitate, Tags.
- **Icons:** Lucide als Inline-SVG-Sprite, Strichstärke 2. Keine Emojis.
- **Bewegung:** eine einzige choreografierte Stelle (Treffer-Einblendung + Textmarker-Wisch),
  sonst nur Zustandsübergänge. `prefers-reduced-motion` schaltet alles ab.
- **Verboten:** Eyebrow-Labels über Überschriften, Verlaufstext, Glas-Effekte, farbige
  Seitenränder an Karten, Emoji-Icons.
