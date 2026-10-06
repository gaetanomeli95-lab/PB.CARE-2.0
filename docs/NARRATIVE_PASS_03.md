> Complete-site v01 update: see [COMPLETE_SITE_V01.md](COMPLETE_SITE_V01.md). The product reframe supersedes the long-film scene durations. Articolo 32 is a legal protection service, not the technical origin of CareProgram/FarmaCOmm tokens; Prosperya is autonomous.

# PB-CARe 2.0 — NARRATIVE PASS 03

Branch: `work/pbcare-narrative-pass03`
Baseline: `ea913ea5b38ba3e64140ddc7109c1dbf336e09db` (fine Pass 02B)

## Sequenza finale

`#s1` persona → `#sep` separazione → `#tempo` tempo/misura →
`#relation` relazione → `#event` diritto→evento → `#knowledge` molte
tracce→conoscenza → `#research` Enzima/ciclo → `#system` sintesi →
`#reveal` PB-CARe → `#end` contatti.

## Significato di ogni passaggio

| Atto | Cosa deve percepire il visitatore |
|---|---|
| relation | le connessioni appartengono alla persona: si propongono, si aprono, si ritirano |
| event | il diritto (Art.32) smette di essere promessa e diventa fatto datato |
| knowledge | esperienze separate → soglia k≥5 → pattern condiviso → ambiente |
| research | ciò che il pattern mostra diventa domanda, ciclo, ritorno, nuova osservazione |
| system | "ah, quello che ho attraversato è un sistema" — riconoscimento |
| reveal | il nome arriva come conseguenza, non come presentazione |

## Decisioni prese

- **Articolo 32**: da macro-scena (520vh, ex #s3) a momento integrato
  in `#event`: citazione costituzionale nel manifest + servizi di tutela
  che appaiono durante la "presa in carico". La meccanica "burocrazia che
  si apre" è stata sostituita dal viaggio del token (già linguaggio di #sep).
- **#s2 → #system**: la scena a layer è spostata dopo ricerca. Titolo e
  copy cambiati da "spiegazione" a "riconoscimento". Aggiunti i loghi
  per-layer (`.lsig`) che emergono col layer dominante.
- **Enzima**: pipeline di corsie sostituita da un ciclo chiuso con
  stazioni-fase; una parte del viaggiatore rientra nel campo e genera
  una nuova traccia-seme (osservazione).
- **k≥5**: niente didattica — cinque tracce organiche entrano una alla
  volta; il contatore "tracce N/5 — sotto soglia" segnala l'assenza di
  pattern; alla quinta condensa l'inviluppo aggregato (le tracce restano,
  non si fondono).

## Uso dei brand (asset reali)

| Marchio | Momento | File |
|---|---|---|
| CareProgram | firma dell'accesso nella relazione | brand/careprogram/logo.png |
| FarmaCOmm | condensazione dell'ambiente k≥5 | brand/farmacomm/logo.png |
| CAMIT | percorso clinico dentro l'ambiente | brand/camit/logo.png |
| EventiScientifici | superficie che nasce da FarmaCOmm | brand/eventi-scientifici/logo.png |
| Enzima | firma del ciclo | brand/enzima/logo.png |
| Prosperya | layer esterna in #system (connessione tratteggiata) | brand/prosperya/logo.png |
| PB-CARe | solo reveal finale | brand/pbcare/logo.png |

Tutti RGBA trasparenti, mostrati come DOM `<img>` pilotato da `update()`
— mai ricreati in canvas, mai modificati.

## Handoff

- `#tempo`→`#relation`: la traccia d'esito piega in oro verso sinistra e
  ricompare come presenza-persona (stessa x di destinazione).
- `#relation`→`#event`: la revoca chiude il campo; l'anello del diritto
  riprende la grammatica del confine oro di #sep.
- `#event`→`#knowledge`: l'evento datato sull'asse → le tracce sulla
  stessa grammatica si moltiplicano.
- `#knowledge`→`#research`: il cluster-pattern entra come "osservazione".
- `#research`→`#system`: la perturbazione genera il seme che la spina
  riattraversa nei livelli.
- `#system`→`#reveal`: i livelli cedono, i fili convergono al centro.

## Accessibilità

Ogni scena ha log testuali DOM (`#rlog`, `#elog`, `#klog`, `.specs`,
`.layers`) che rispecchiano il canvas; `prefers-reduced-motion` ferma le
animazioni autonome mantenendo sequenza e messaggio.
