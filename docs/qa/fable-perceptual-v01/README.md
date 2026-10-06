# QA Snapshots — Fable Perceptual Pass

Snapshot QA della verifica visiva del **Fable Perceptual / Cinematic Polish Pass**
(branch `work/pbcare-fable-perceptual-v01`).

- **Baseline SHA**: `7033617a5ec4d0ec47364bac8b2a1568f4e84e0d` (Pass 03)
- **SHA finale**: `309b69deac47dcfac70133ae776c13a6bd0be95d`

## Viewport

- `d_*` — desktop 1440×900
- `m_*` — mobile 390×844

Acquisizioni deterministiche via `?snap=<scene>:<progress>` / scroll offset
equivalente (Puppeteer, Chrome headless).

## Screenshot

| File | Cosa mostra |
|---|---|
| `d_s1_0.7` | Apertura: nucleo-persona come costellazione, traccia orizzontale, grande silenzio |
| `d_sep_0.5` | Separazione: territorio carta col nome vs lato clinico — scena benchmark, invariata |
| `d_relation_0.62` | Relazione attiva: campo di consenso, connessione stabilita, firma CareProgram |
| `d_relation_0.9` | Revoca: la connessione si ritrae, il campo si chiude, il professionista resta attenuato |
| `d_event_0.85` | Evento datato: token fissato sull'asse, "giorno 147 — erogata", niente box fantasma |
| `d_knowledge_0.66` | k≥5: il titolo torna al picco, la banda aggregata condensa sulle 5 tracce separate |
| `d_knowledge_0.95` | Tre autorità: ambiente FarmaCOmm (hero), superficie EventiScientifici, percorso CAMIT |
| `d_research_0.92` | Ciclo Enzima: ritorno al campo, nuova traccia-seme, titolo-tesi che riappare |
| `d_system_0.85` | Sintesi: nodi come echi senza etichette canvas, marchi alla profondità del layer |
| `d_reveal_0.95` | Reveal PB-CARe: convergenza risolta nel marchio reale, payoff "questo è PB-CARe" |
| `m_knowledge_0.95` | Knowledge mobile: tracce leggibili, nessuna collisione con le didascalie |
| `m_reveal_0.9` | Reveal mobile: marchio e payoff centrati, campo convergente pulito |

## Nota

Sono snapshot puntuali di QA, non materiale di design: servono a confrontare
lo stato percettivo del pass con eventuali regressioni future. La raccolta
completa (tutti i progress intermedi) resta locale in `.shots/` (gitignored).
