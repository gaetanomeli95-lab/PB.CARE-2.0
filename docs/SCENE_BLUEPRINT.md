# PB-CARe 2.0 — SCENE BLUEPRINT

## Stato: NARRATIVE PASS 03 — attiva

La struttura non è più "slide": è un unico mondo che cambia stato.
Master narrative: PERSONA → IDENTITÀ → SEPARAZIONE → TEMPO → RELAZIONE →
EVENTO → MISURA → MOLTE TRACCE → CONOSCENZA → RICERCA → SISTEMA → PB-CARe.

L'utente deve prima VIVERE le regole del sistema; solo dopo capisce che
ciò che ha attraversato è PB-CARe. Per questo la scena "sistema" è stata
spostata verso la fine: è sintesi, non inventario.

## Atti implementati (pass 03)

| # | id | data-scene | Contenuto | Stato |
|---|---|---|---|---|
| 01 | `#s1` | s1 | LA PERSONA — dal campo disperso emerge una traccia + nucleo | riscritto (pass 02) |
| 02 | `#sep` | sep | IL NOME RESTA FUORI — separazione identità/clinica + contaminazione CareProgram→FarmaCOmm | mantenuto |
| 03 | `#tempo` | tempo | IL TEMPO — asse, giorni, traccia di aderenza con interruzione, eventi datati, esito | mantenuto; uscita ora consegna a #relation |
| 04 | `#relation` | relation | LA RELAZIONE — persona↔professionista: richiesta al confine, consenso, accesso, revoca. Firma CareProgram | NUOVO |
| 05 | `#event` | event | IL DIRITTO DIVENTA EVENTO — anello oro → assegnazione → presa in carico → erogazione → evento datato. Art.32 integrato | NUOVO (assorbe ex #s3) |
| 06 | `#knowledge` | knowledge | DALL'INDIVIDUO ALLA CONOSCENZA — 5 tracce separate, k≥5 condensa il pattern; FarmaCOmm, CAMIT, EventiScientifici emergono | NUOVO — scena cardine |
| 07 | `#research` | research | ENZIMA — ciclo chiuso: osservazione→ricerca→progetto→applicazione→ritorno che perturba il campo | riscritto da ex #s4 |
| 08 | `#system` | system | IL SISTEMA — sintesi a layer; i marchi emergono col layer dominante | spostato a fine (era #s2) |
| 09 | `#reveal` | reveal | PB-CARe — le grammatiche convergono, il marchio reale compare come conseguenza | NUOVO |
| — | `#end` | — | Statement finale + contatti + network links | invariato |

## Articolo 32 — ruolo definitivo

Non più macro-scena autonoma: è la FONTE del diritto dentro `#event`
(citazione costituzionale + servizi di tutela). Il suo valore narrativo
(«il diritto») è ciò che il token porta nel tempo. Contenuti preservati,
peso ridotto a momento integrato.

## Entità fuori narrativa

- Gruppo Trua: legacy, `narrative:false` — mai incluso.
- Integralinea: ruolo non definito — escluso.
- Prosperya: solo relazione esterna nel layer `esterna` (connessione
  tratteggiata + logo quando il layer è dominante).

## Continuità tra scene (spina narrativa)

La TRACCIA è l'elemento conduttore: nasce nell'atto 01 (filo del tempo),
è tagliata dal confine nell'atto 02, diventa misura nell'atto 03, piega
verso il basso e riappare come presenza-persona nell'atto 05, l'evento
datato dell'atto 06 siede sullo stesso asse, le tracce dell'atto 07 sono
la stessa grammatica ripetuta, il ciclo dell'atto 08 le perturba, la spina
dell'atto 09 le attraversa tutte, i fili dell'atto 10 le ricompongono.

## Scene lifecycle (Pass 02B — non regredibile)

Ogni scena riceve `is-before` / `is-active` / `is-after` dal progresso
normalizzato. `is-after` toglie pointer-events allo stage. Exit envelope
sugli ultimi punti di progresso. Debug: `?debugScroll=1` (overlay
p/rect/state/errori) e `?snap=<id>:<p>` per QA diretto — funziona con
tutti i nuovi id (relation, event, knowledge, research, system, reveal).

## Loghi — regole d'uso

Asset reali RGBA in `assets/brand/<entità>/logo.png`.
- Compaiono come FIRMA del concetto appena vissuto, mai come [LOGO]+testo.
- Canvas crea il mondo; il logo resta il logo (DOM `<img>`, opacity+scale).
- CareProgram: nella relazione, quando identità+accesso sono leggibili.
- FarmaCOmm: quando la conoscenza esiste (k≥5 → ambiente).
- CAMIT: percorso clinico dentro l'ambiente (traccia → percorso strutturato).
- EventiScientifici: emerge DALL'ambiente FarmaCOmm (superficie condivisa).
- Enzima: firma del ciclo.
- PB-CARe: solo nel reveal finale, come conseguenza.
