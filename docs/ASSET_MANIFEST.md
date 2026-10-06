# PB-CARe 2.0 — ASSET MANIFEST

Sorgente originale (intoccabile): `C:\Users\utente\Desktop\PBCARE_ASSET_INBOX`
Copie di lavoro: `public/assets/brand/<id>/logo.png`

## Asset integrati

| Brand | File sorgente INBOX | Destinazione repo | Stato |
|---|---|---|---|
| PB-CARe | Logo PBCARe con globo digitale blu.png | public/assets/brand/pbcare/logo.png | ✓ integrato |
| CareProgram | Logo minimalista careprogram verde e arancione.png | public/assets/brand/careprogram/logo.png | ✓ integrato |
| FarmaCOmm | Logo sanitario FarmaCOmm in stile tech.png | public/assets/brand/farmacomm/logo.png | ✓ integrato |
| CAMIT | Logo CAMIT con Emblema Caduceo Moderno.png | public/assets/brand/camit/logo.png | ✓ integrato |
| EventiScientifici | Logo fluido EventiScientifici.png | public/assets/brand/eventi-scientifici/logo.png | ✓ integrato (versione corretta) |
| Enzima | Logo Enzima con icona molecolare.png | public/assets/brand/enzima/logo.png | ✓ integrato |
| Prosperya | Logo Prosperya_ Anello Multicolore e Crescita.png | public/assets/brand/prosperya/logo.png | ✓ integrato |

## Asset mancanti

| Brand | Stato |
|---|---|
| Integralinea | NESSUN asset fornito — directory `public/assets/brand/integralinea/` vuota in attesa |

Per completare: caricare il file del logo Integralinea come
`public/assets/brand/integralinea/logo.png`.

## Convenzioni

- File di lavoro sempre rinominato `logo.png` dentro la directory del
  brand (niente spazi nel nome).
- Gli originali nell'INBOX non vengono mai spostati né modificati.
- Varianti future (simbolo solo, mono, reversed) andranno nella stessa
  directory con nome descrittivo (es. `mark.png`, `mono.png`).
- `public/assets/shared/` = elementi trasversali; `textures/` =
  texture procedurali; `editorial/` = immagini editoriali (usare con
  parsimonia: codice prima delle immagini, vedi SOURCE_OF_TRUTH §7).
