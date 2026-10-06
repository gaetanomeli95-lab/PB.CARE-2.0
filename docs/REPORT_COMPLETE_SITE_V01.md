# PB-CARe — sito completo v01

[Preview del branch](https://pbcare-20-git-work-pbcare-c-dce70f-gaetanomeli95-9984s-projects.vercel.app/) · [PR in bozza #1](https://github.com/gaetanomeli95-lab/PB.CARE-2.0/pull/1)

- Branch: `work/pbcare-complete-site-v01`.
- Baseline `main`: `2071fa0110c8883d535d48476e318c02838b755f`.
- Revisione del codice verificata nel browser: `de0b7135408a59921b3b5dc33f622e578f7783fd`.
- Il commit conclusivo aggiunge soltanto questo report, misure e screenshot. Il suo SHA è riportato nella consegna e nella PR.
- `main` è ancora sulla baseline. Nessun merge o deploy in produzione.

## Home e navigazione

Hero → modello PB-CARe → ingressi per pubblico → separazione → tempo e welfare → ruoli dell'ecosistema → CareProgram e relazione → FarmaCOmm → CAMIT → EventiScientifici → Enzima → Articolo 32 → Prosperya → principi PB-CARe → contatti.

Nav: **PB-CARe / Per chi / Come funziona / Ecosistema / Ricerca / Contatti**. Nel blocco ecosistema ci sono anche sette ingressi diretti. Gli anchor trasferiscono il focus e raggiungono subito il contenuto, senza attese cinematografiche.

| Contenuto | Intervento |
|---|---|
| Hero | Una viewport, logo e identità immediati, CTA visibili senza scroll; convergenza ambientale |
| Il nome resta fuori | Conservato il renderer originale: persona, campo carta, confine, codice, token; 480svh desktop / 400svh mobile |
| Tempo | Editoriale: diario, eventi, aderenza, interruzioni, esiti; nessuna data o quantità inventata |
| Relazione | Esempio interattivo autorizzata/revocata, dentro CareProgram; non presume chi avvii la connessione |
| Conoscenza / FarmaCOmm | Scena da 190svh / 160svh mobile; segnali sintetici, interpretazione umana, contenuto e CTA sempre leggibili |
| Ricerca / Enzima | Scena da 180svh / 160svh mobile; ciclo documentato di R&S, senza collegamento automatico a una coorte |
| CAMIT e EventiScientifici | Mondi editoriali brevi: percorso clinico e apertura della conoscenza |
| Sistema e chiusura | Sostituiti i lunghi reveal con contenuti istituzionali, principi e contatti PB-CARe |

Articolo 32 è ora un servizio specifico di tutela legale: rimosso il collegamento che lo presentava come origine del token. Prosperya ha il proprio logo originale, un confine distinto e una relazione esterna; è una società autonoma. Gruppo Trua e Integralinea sono esclusi dall'esperienza e dai dati pubblici caricati dal sito.

Tutti i PNG ufficiali sono invariati. I marchi con parti scure hanno una superficie chiara per conservarne la leggibilità.

## CTA e fonti

| Destinazione | Verifica e azione |
|---|---|
| CareProgram | `https://careprogram.it/`, HTTP 200 — Scopri CareProgram |
| FarmaCOmm | `https://www.farmacomm.com/`, HTTP 200 e home ufficiale — Esplora FarmaCOmm |
| CAMIT | `https://cannabismedicaitalia.it/`, HTTP 200 e home ufficiale — Scopri il percorso CAMIT |
| Prosperya | `https://www.prosperya.it/`, HTTP 200 dopo redirect — Conosci Prosperya |
| Articolo 32 | `https://pbcare.it/articolo-32/`, pagina ufficiale recuperata tramite ricerca web; altro client HTTP riceve 403 — Scopri il servizio |
| EventiScientifici | Il dominio storico .com restituisce 502 nella verifica; nessun link esterno attivato — CTA ai contatti PB-CARe |
| Enzima | Nessun URL esterno verificato — CTA di confronto sulla ricerca ai contatti PB-CARe |

Ingressi per persone/nuclei, professionisti/centri, welfare, farmacie/operatori, ricerca e tutela fondati sui documenti della repo e sulle pagine ufficiali di CareProgram, FarmaCOmm, CAMIT e Articolo 32. Nessun team, risultato o numero commerciale inventato.

Giulia Ferri e il codice sono marcati come **dati di esempio**, anche nella presentazione statica. Tracce e relazione sono schemi illustrativi. Le quantità e le date inventate delle scene precedenti sono state rimosse.

## QA e lunghezza

Confronto alla stessa viewport nativa 1363×936: **49.422 → 17.064 px**, riduzione di circa **65%**; da 52,8 a 18,2 viewport.

| Viewport di layout | Altezza totale | Viewport totali | Hero / CTA / overflow |
|---|---:|---:|---|
| 1920×1080 | 18.841 px | 17,4 | OK |
| 1536×864 | 16.690 px | 19,3 | OK |
| 1440×900 | 16.898 px | 18,8 | OK |
| 1366×768 | 15.475 px | 20,1 | OK |
| 430×932 | 15.983 px | 17,1 | OK |
| 390×844 | 15.628 px | 18,5 | OK |

Le sei dimensioni sono verificate con iframe dello stesso sito alle dimensioni esatte, scalati soltanto nel contenitore di verifica. Non è un'emulazione hardware di un telefono. Misure raccolte dopo il caricamento dei font; i loghi secondari restano lazy. [Dati DOM](qa/complete-site-v01/viewport-results.json).

Verificati: scroll reale a rotellina nelle sezioni editoriali e nella separazione, ingressi diretti, menu mobile, Escape, azioni tramite tastiera, stati della relazione, anchor validi, H1 unico, landmark nominati, testi DOM, file/alt dei loghi. Nessun errore JavaScript del sito osservato. Corretta la sovrapposizione tra metadati e conclusione della separazione mobile.

Movimento ridotto: toggle reale verificato da tastiera; tutti i Canvas nascosti, Lenis disattivato, tre scene rese statiche e testi leggibili. Controllati desktop e mobile senza collisioni: separazione statica 1002 / 1166 px. Il codice gestisce `prefers-reduced-motion` all'avvio e al cambio; la preferenza OS non è stata emulata nel browser. Fallback HTML/CSS presente per JavaScript disabilitato; non testato tramite disabilitazione del browser.

Performance: Canvas limitati a circa 30fps, DPR massimo 1,5, rendering dei soli campi visibili, sospensione a scheda nascosta, ripresa dello scroll anche quando la regia è a riposo, loghi secondari lazy, dimensioni intrinseche, nessuna nuova libreria o dipendenza di build. Non sono dichiarati punteggi Lighthouse o Core Web Vitals non misurati.

## Screenshot

- [Hero desktop](qa/complete-site-v01/hero-desktop.jpg)
- [Hero mobile](qa/complete-site-v01/hero-390x844.jpg)
- [Separazione desktop](qa/complete-site-v01/separation-desktop.jpg)
- [Separazione mobile, conclusione corretta](qa/complete-site-v01/separation-mobile.jpg)
- [FarmaCOmm mobile](qa/complete-site-v01/farmacomm-mobile.jpg)
- [CareProgram e relazione](qa/complete-site-v01/careprogram-1366x768.jpg)
- [CAMIT](qa/complete-site-v01/camit-1366x768.jpg)
