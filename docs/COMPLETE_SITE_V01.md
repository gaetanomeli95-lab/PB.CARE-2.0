# PB-CARe — Complete site v01

Baseline: `2071fa0110c8883d535d48476e318c02838b755f` (main).
Branch: `work/pbcare-complete-site-v01`.

This pass supersedes the long-film home structure in SCENE_BLUEPRINT and NARRATIVE_PASS_03. The original separation renderer and official PNG assets are preserved. Public claims follow SOURCE_OF_TRUTH and the user-authored product reframe.

## Information architecture

Hero → PB-CARe model → six audience entries → signature identity/clinic separation → continuity and welfare → ecosystem roles → CareProgram / relationship → FarmaCOmm / knowledge → CAMIT → EventiScientifici → Enzima / R&D → Articolo 32 / legal service → Prosperya / autonomous company → PB-CARe principles → contacts.

Navigation: PB-CARe, Per chi, Come funziona, Ecosistema, Ricerca, Contatti. Separate ecosystem anchor navigation supports direct access to all seven worlds.

## Cinematic rhythm

- Hero: one viewport; content and original PB-CARe logo visible before scrolling. Ambient channels converge.
- Separation: original field, Giulia Ferri, boundary, code and token choreography; 480svh desktop / 400svh mobile. Persistent example label and skip link.
- Time: editorial sequence without fictitious dates or counts.
- Relationship: labelled interactive illustration of authorized/revoked states. It changes no real access; does not assume who initiates the relationship.
- FarmaCOmm: 190svh desktop / 160svh mobile; synthetic signals accumulate and condense. Identity/content/CTA remain readable throughout.
- Enzima: 180svh desktop / 160svh mobile; cycle supported by the internal ecosystem documents. No automatic clinical-cohort-to-R&D linkage.
- CAMIT: short editorial world with progressive route.
- EventiScientifici: luminous editorial aperture.
- Articolo 32: editorial legal-service section. Removed the scene that made it the source of access rights/tokens.
- Prosperya: own original multicolor logo, dashed boundary, external relationship, autonomous company. No internal satellite or department depiction.
- Mother-brand institutional principles and contact closing; no long final logo reveal.

## Verified destinations — 2026-10-07

| Destination | Verification | Public action |
|---|---|---|
| https://careprogram.it/ | HTTP 200, correct title; official pages indexed | Scopri CareProgram |
| https://www.farmacomm.com/ | HTTP 200; official home retrieved | Esplora FarmaCOmm |
| https://cannabismedicaitalia.it/ | HTTP 200; official home retrieved | Scopri il percorso CAMIT |
| https://www.prosperya.it/ | HTTP 200, redirect from apex, correct title | Conosci Prosperya |
| https://pbcare.it/articolo-32/ | Official page retrieved through web research; separate HTTP client receives 403 | Scopri il servizio Articolo 32 |
| EventiScientifici | Historical .com returns 502; future subdomain not verified | Internal contact CTA only |
| Enzima | No verified dedicated external URL | Internal research contact CTA |

Audience sources: SOURCE_OF_TRUTH (person control, welfare), ECOSYSTEM_MAP (platform roles), CareProgram official programme/registration pages (nucleus, professionals, operators), FarmaCOmm official home (patients, professionals, centers, pharmacies), CAMIT official home (specific clinical pathway), PB-CARe Articolo 32 page (legal protection). No medical outcomes or quantitative results claimed.

No fictitious dates or event counts remain. Giulia and the code are persistently labelled as example data. The line fields and relationship controls are explicitly illustrations. Group legacy and unresolved shop entities are excluded from shipped ecosystem data; historical references remain only in internal docs.

## Accessibility and performance

One H1, logical section H2s and subsection H3s, semantic landmarks, skip link, native links, visible keyboard focus, mobile menu with expanded state/Escape handling, focus transfer on anchors. All meaningful content lives in HTML. No form or backend is implied.

OS `prefers-reduced-motion` is honored on load and change. A session-only footer preference and `?motion=reduce` QA override use the same reduced presentation: no Lenis, no canvases, no autonomous animations, readable static separation, short normal sections. No-JS fallback keeps the separation readable and navigation usable.

Canvas frame rate capped at ~30fps, max DPR 1.5, only visible canvases rendered; work pauses when the tab is hidden. Fonts use display=swap. Secondary original logos lazy-load with intrinsic dimensions. No new animation library or build dependency.

`npm run check` verifies JavaScript syntax. `npm run dev` runs the dependency-free static development server; production stays static Vercel hosting.

Viewport QA harness: `docs/qa/viewport.html` renders same-origin iframes at the six exact requested sizes. The visible wrapper is scaled to fit; each iframe has its actual chosen layout viewport. Test results and screenshots are added after visual verification.
