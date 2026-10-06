> Complete-site v01 update: see [COMPLETE_SITE_V01.md](COMPLETE_SITE_V01.md). The product reframe supersedes the long-film scene durations. Articolo 32 is a legal protection service, not the technical origin of CareProgram/FarmaCOmm tokens; Prosperya is autonomous.

# PB-CARe 2.0 — VISUAL SYSTEM

## Palette madre

Base: deep navy, petrolio, blu, celeste, grigio freddo, bianco,
accenti luminosi controllati.

Token correnti (style.css `:root`):

| Token | Valore | Uso |
|---|---|---|
| `--bg0` | `#071513` | sfondo profondo |
| `--bg1` | `#0b2420` | petrolio secondario |
| `--paper` | `#e5e2d7` | carta / identità |
| `--gold` | `#f1c847` | luce / diritto / passaggi |
| `--mint` | `#9fd8c9` | accento primario |
| `--ink` | `#ecf4ef` | testo chiaro |
| `--muted` | `#8aa49d` | testo secondario |

## Sistema cromatico dinamico delle scene

Principio centrale della nuova direzione: quando l'esperienza entra nel
territorio di un'altra identità, il mondo PB-CARe **assorbe
progressivamente** la sua palette.

NON "ora pagina verde / ora pagina arancione": una **contaminazione
dello stesso mondo**, che avviene DURANTE lo scroll (narrativa, non
decorativa).

Direzioni per territorio:

| Territorio | Contaminazione |
|---|---|
| CareProgram | petrolio/blu assorbe verde + arancione |
| FarmaCOmm | si raffredda verso blu/ciano clinico |
| CAMIT | teal/verde/silver sobrio e umano |
| EventiScientifici | blu/ciano aperto, dinamico |
| Enzima | blu/teal/cyan sperimentale, distinto da EventiScientifici |
| Prosperya | presenza multicolore come identità autonoma — MAI tutta la scena arcobaleno |

Il colore si esprime attraverso: luce, atmosfera, gradienti, canvas,
micro-particelle, linee, halo, bordi, micro-interazioni, tipografia.
NON riempire lo schermo col colore del brand.

### Passaggi reali fra identità (Pass 03)

Il mondo reagisce in continuità — ogni scena mixa la propria atmosfera
verso il territorio che attraversa via `mixRGB` sulle palette del data
layer:

| Passaggio | Transizione |
|---|---|
| #relation → accesso | madre → verde CareProgram + micro-arancio (radial wash) |
| #event → presa in carico | oro diritto → ciano clinico FarmaCOmm (punto di accoglienza + asse) |
| #knowledge → k≥5 | ciano tracce → atmosfera blu FarmaCOmm (radial dal centro) |
| #knowledge → ES | banda aggregata → azzurro aperto EventiScientifici (superficie) |
| #knowledge → CAMIT | ultima traccia → teal CAMIT (percorso con waypoint) |
| #research | teal/cyan Enzima (ciclo, stazioni, ritorno) |
| #reveal | tutti gli accenti → mix verso menta madre (streams `STREAM_COLS`) |

Nessun rainbow permanente: ogni colore arriva dalla palette reale
dell'entità in `data/ecosystem.js` e ha una causa narrativa.

## Implementazione tecnica

- Ogni entità definisce la propria palette in `data/ecosystem.js`
  (`palette: { primary, secondary, accent, atmosphere }`).
- Ogni `.scene` espone CSS custom properties: `--scene-accent`,
  `--scene-accent2`, `--scene-atmo` — settate via `data-palette` o dal
  data module.
- Niente colori hardcoded sparsi: nuovi visual leggono la palette della
  scena/entità.

## Materia vietata

Vedi SOURCE_OF_TRUTH §7: niente wallpaper AI, persone sintetiche, reti
luminose fotografiche, DNA 3D, medical stock. Materia = canvas, grana,
luce, tipografia, dati generati dal codice.

## Motion

- Lenis smooth wheel (attivo).
- Progresso scena 0→1 normalizzato da geometria sticky.
- Scene canvas ridisegnate ogni frame; scene DOM solo su variazione.
- `prefers-reduced-motion`: niente Lenis, animazioni ridotte.
