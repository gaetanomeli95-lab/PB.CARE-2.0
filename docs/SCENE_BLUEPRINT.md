# PB-CARe 2.0 — SCENE BLUEPRINT

## Stato: NARRATIVE PASS 02 — attiva

La struttura non è più "slide": è un unico mondo che cambia stato.
Master narrative: PERSONA → IDENTITÀ → SEPARAZIONE → CURA NEL TEMPO →
RELAZIONE → EVENTO → MISURA → CONOSCENZA → RICERCA → ECOSISTEMA → PB-CARe.

L'utente deve prima VIVERE le regole del sistema; solo dopo capisce che
ciò che ha attraversato è PB-CARe.

## Atti implementati (pass 02)

| # | id | Tipo | Contenuto | Stato |
|---|---|---|---|---|
| 01 | `#s1` | canvas+DOM | LA PERSONA — dal campo disperso emerge una traccia (filo del tempo) + nucleo | riscritto |
| 02 | `#sep` | canvas+DOM | IL NOME RESTA FUORI — separazione identità/clinica + contaminazione cromatica CareProgram→FarmaCOmm | mantenuto, contaminato |
| 03 | `#tempo` | canvas+DOM | IL TEMPO — asse, giorni, traccia di aderenza con interruzione, eventi datati, esito | NUOVO |
| 04 | `#s2` | canvas+DOM | IL SISTEMA — profondità/layer: la spina-traccia attraversa identità, clinica, conoscenza, ricerca; Prosperya esterna (tratteggiata) | riscritto — niente satelliti |
| 05 | `#s3` | canvas+DOM | ARTICOLO 32 — mantenuto provvisoriamente come fallback | invariato, peso da definire |
| 06 | `#s4` | canvas+DOM | ENZIMA — ciclo osservazione→ricerca→progetto→applicazione→impatto (rimossi claim commerciali/finanza agevolata) | copy riscritto |
| — | `#end` | DOM | Statement finale + contatti + network links | invariato |

## Atti pianificati (pass successivi)

- **RELAZIONE** (persona ↔ professionista): connessione che nasce, è
  attiva, può essere revocata SOLO dalla persona. Prossimità, consenso,
  distanza — niente network diagram generico.
- **IL DIRITTO DIVENTA EVENTO**: il token della separazione si trasforma
  in evento datato (assegnazione → presa in carico → erogazione → evento).
- **DALL'INDIVIDUO ALLA CONOSCENZA**: molte tracce → pattern, con soglia
  k≥5 rappresentata visivamente. FarmaCOmm emerge come ambiente (logo
  reveal), EventiScientifici emerge DA quell'ambiente.
- **REVEAL PB-CARe**: "questo è PB-CARe" — il nome arriva dopo
  l'esperienza, non prima.

## Decisioni documentate

- Articolo 32 mantenuto come scena intera in questo pass (fallback
  sicuro) — il suo peso narrativo definitivo resta da collocare.
- Gruppo Trua rimosso dalla narrativa (legacy, documentato nel data
  layer con `narrative:false`).
- Prosperya presente come relazione esterna (connessione tratteggiata,
  layer `esterna`) — non satellite, non dipartimento.
- Integralinea esclusa finché il ruolo non è definito.
- "Sette realtà. Una rete." smontato: sostituito dal sistema a layer.

## Continuità tra scene (spina narrativa)

La TRACCIA è l'elemento conduttore: nasce nell'atto 01 (filo del tempo
sotto il nucleo-persona), è tagliata dal confine nell'atto 02 (righello),
diventa la misura nell'atto 03, e riappare come spina verticale che
attraversa i livelli del sistema nell'atto 04.

## Palette dinamica implementata

- Atto 02: il lato identità si contamina verde+arancio (CareProgram),
  la luce clinica raffredda verso ciano (FarmaCOmm) — `mixRGB` in
  main.js legge le palette reali da `data/ecosystem.js`.
- Atto 03: fondo raffreddato verso `palette.atmosphere` FarmaCOmm.
- Atto 04: ogni layer tinto dall'accent dell'entità.
