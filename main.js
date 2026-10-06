/* ============================================================
   PB-CARe — scrollytelling engine
   Ogni .scene ha un canvas + DOM pilotati dallo stesso p (0..1)
   ============================================================ */

(() => {
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = v => Math.max(0, Math.min(1, v));
const seg = (p, a, b) => clamp((p - a) / (b - a));
const smooth = t => t * t * (3 - 2 * t);
const smoother = t => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = n => { const x = Math.sin(n * 91.73 + 17.11) * 43758.5453; return x - Math.floor(x); };
// mix tra due rgb "r,g,b" — base del sistema cromatico dinamico
const mixRGB = (a, b, t) =>
  a.split(",").map((v, i) => Math.round(lerp(+v, +b.split(",")[i], t))).join(",");

const GOLD = "241,200,71", MINT = "159,216,201", PAPER = "229,226,215";

/* ---------- grain condiviso ---------- */

function makeGrain(ctx) {
  const g = document.createElement("canvas");
  g.width = g.height = 128;
  const gx = g.getContext("2d"), img = gx.createImageData(128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = rnd(i * .37) * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  gx.putImageData(img, 0, 0);
  return ctx.createPattern(g, "repeat");
}

/* ---------- regia condivisa: titolo come momento, didascalie temporali ----------

   Il testo non è un pannello fisso: il titolo entra, cede il campo al
   fenomeno, il sottotesto torna solo alla fine come riflessione. Le
   righe del log restano tutte nel DOM, ma l'occhio ne vede una alla
   volta, vicino a ciò che accade.                                        */

function titleStager(stage, o) {
  const title = [...stage.querySelectorAll(".manifest .eyebrow, .manifest h2")];
  const sub = stage.querySelector(".manifest .sub");
  return p => {
    const tin = smooth(seg(p, o.in[0], o.in[1])), tout = smooth(seg(p, o.out[0], o.out[1]));
    const a = tin * (1 - tout);
    title.forEach(el => {
      el.style.opacity = a;
      el.style.transform = `translateY(${lerp(18, 0, tin) - tout * 14}px)`;
    });
    if (sub && o.sub) {
      const s = smooth(seg(p, o.sub[0], o.sub[1])) * (o.subOut ? 1 - smooth(seg(p, o.subOut[0], o.subOut[1])) : 1);
      sub.style.opacity = s;
      sub.style.transform = `translateY(${lerp(14, 0, s)}px)`;
    }
  };
}

function captionLog(el, LOG, off) {
  const rows = LOG.map(item => {
    const d = document.createElement("div");
    d.className = "tl"; d.textContent = item.t;
    el.appendChild(d);
    return d;
  });
  return p => {
    let cur = -1;
    LOG.forEach((item, i) => { if (p > item.at) cur = i; });
    rows.forEach((r, i) => {
      r.classList.toggle("on", i <= cur);
      r.classList.toggle("cur", i === cur);
    });
    if (off != null) el.classList.toggle("off", p > off);
  };
}

/* ---------- hero · campo ambientale ----------
   La prima viewport è già il sito: nessuna coreografia obbligata.
   Il canvas respira in autonomia — la fenditura dell'identità resta
   accesa dietro il marchio come traccia luminosa del sistema.        */

function initHero(canvas) {
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, grain = null, dust = [];
  const COLD = "168,216,240";

  function resize() {
    W = canvas.clientWidth; H = canvas.clientHeight;
    const DPR = Math.min(1.5, devicePixelRatio || 1);
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    grain = makeGrain(ctx);
    dust = [];
    for (let i = 0; i < 46; i++) dust.push({
      x: rnd(i * 3.7) * W, y: rnd(i * 7.3) * H,
      r: .5 + rnd(i * 2.1) * 1.2, ph: rnd(i) * 6.28, sp: .04 + rnd(i * 5.1) * .09,
    });
  }

  function draw(time) {
    ctx.clearRect(0, 0, W, H);
    const t = reduce ? 0 : time;
    const cx = W * .5, cy = H * .42;

    // fenditura quieta: la firma luminosa dell'identità, sempre accesa
    const breathe = reduce ? .85 : .78 + .07 * Math.sin(t * .0006);
    const hh = H * .30;
    const g = ctx.createLinearGradient(cx, cy - hh, cx, cy + hh);
    g.addColorStop(0, "rgba(168,216,240,0)");
    g.addColorStop(.5, `rgba(${COLD},${.42 * breathe})`);
    g.addColorStop(1, "rgba(168,216,240,0)");
    ctx.strokeStyle = g; ctx.lineWidth = 1.4;
    ctx.shadowColor = "rgba(120,200,240,.55)"; ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.moveTo(cx, cy - hh); ctx.lineTo(cx, cy + hh); ctx.stroke();
    ctx.shadowBlur = 0;
    const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, H * .34);
    rg.addColorStop(0, `rgba(90,160,200,${.08 * breathe})`); rg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);

    // pulviscolo in deriva lenta — il campo è vivo, non fermo
    for (const d of dust) {
      const y = (d.y - (reduce ? 0 : t * d.sp * .01)) % H;
      ctx.fillStyle = `rgba(${COLD},${.05 + .04 * Math.sin(t * .0008 + d.ph)})`;
      ctx.beginPath(); ctx.arc(d.x, y < 0 ? y + H : y, d.r, 0, Math.PI * 2); ctx.fill();
    }

    ctx.globalAlpha = .045; ctx.fillStyle = grain; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  }

  resize();
  addEventListener("resize", resize);
  return { draw, el: canvas.parentElement };
}

/* ---------- atto 01 · la persona — dal caos una traccia ---------- */

function initS1(stage, ctx) {
  let W = 0, H = 0, parts = [], grain = null;
  const intro = stage.querySelector(".intro"), cap = stage.querySelector("[data-cap]");
  const eyebrow = intro.querySelector(".eyebrow"), h1 = intro.querySelector("h2"), sub = intro.querySelector(".sub");
  let geo = null; // geometria della traccia, calcolata al resize

  function resize() {
    W = stage.clientWidth; H = stage.clientHeight;
    const DPR = Math.min(1.5, devicePixelRatio || 1);
    const c = stage.querySelector("canvas");
    c.width = W * DPR; c.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    grain = makeGrain(ctx);

    // dal campo disperso emerge una traccia:
    // 74% particelle → il filo del tempo, 14% → il nucleo (la persona),
    // 12% restano libere nel campo
    parts = [];
    const mob = W < 760;
    const cx = mob ? W * .5 : W * .70, cy = mob ? H * .56 : H * .50;
    const R = Math.min(W, H) * (mob ? .30 : .26);
    const ly = cy + R * .66;                  // la traccia nasce sotto il nucleo
    const lx0 = cx - R * 1.45, lx1 = cx + R * 1.45;
    geo = { cx, cy, R, ly, lx0, lx1 };
    const N = mob ? 90 : 130;
    for (let i = 0; i < N; i++) {
      const kind = i < N * .74 ? 0 : (i < N * .88 ? 1 : 2);
      let tx, ty;
      if (kind === 0) {
        const u = i / (N * .74);
        tx = lerp(lx0, lx1, u);
        // il filo del tempo: un respiro lento, non un tracciato nervoso
        ty = ly - Math.sin(u * 3.6 + .4) * R * .08 + (rnd(i * 3.1) - .5) * R * .025;
      } else if (kind === 1) {
        const a = rnd(i * 4.7) * Math.PI * 2, rr = rnd(i * 6.3) * R * .20;
        tx = cx + Math.cos(a) * rr;
        ty = cy + Math.sin(a) * rr;
      } else {
        tx = cx + (rnd(i * 7.9) - .5) * R * 2.6;
        ty = cy + (rnd(i * 2.4) - .5) * R * 2.6;
      }
      parts.push({
        sx: rnd(i * 11.3) * W, sy: rnd(i * 13.7) * H,
        tx, ty, kind,
        wx: (rnd(i * 5.5) - .5) * 90, wy: (rnd(i * 8.8) - .5) * 90,
        ph: rnd(i * 1.9) * 6.28,
        r: kind === 1 ? 1.6 : .9 + rnd(i * 3.3) * 1.1,
        dly: rnd(i * 6.1) * .25,
      });
    }
  }

  function update(p, time) {
    ctx.clearRect(0, 0, W, H);
    const t = reduce ? 0 : time;
    const { cx, cy, R, ly, lx0, lx1 } = geo;

    // handoff dall'intro: il seme del marchio continua a scendere qui —
    // un filo che arriva dall'alto e si dissolve nel campo disperso
    const incoming = 1 - smooth(seg(p, .02, .18));
    if (incoming > 0) {
      const hy = lerp(-H * .05, cy - R * .55, 1 - incoming);
      ctx.strokeStyle = `rgba(${MINT},${.4 * incoming})`;
      ctx.lineWidth = 1.1;
      ctx.setLineDash([1, 6]);
      ctx.beginPath(); ctx.moveTo(cx, -H * .05); ctx.lineTo(cx, hy); ctx.stroke();
      ctx.setLineDash([]);
      const rg = ctx.createRadialGradient(cx, hy, 0, cx, hy, 18);
      rg.addColorStop(0, `rgba(${MINT},${.6 * incoming})`); rg.addColorStop(1, `rgba(${MINT},0)`);
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(cx, hy, 18, 0, Math.PI * 2); ctx.fill();
    }

    // posizioni attuali — emersione lenta: il campo resta disperso a lungo
    const pos = [];
    for (const pt of parts) {
      const m = smoother(seg(p, .22 + pt.dly * .5, .62 + pt.dly * .5));
      pos.push({
        x: lerp(pt.sx + pt.wx * Math.sin(t * .0005 + pt.ph), pt.tx, m),
        y: lerp(pt.sy + pt.wy * Math.cos(t * .0004 + pt.ph), pt.ty, m),
        m, pt,
      });
    }

    // la traccia: i vicini del filo si collegano quando il filo si forma —
    // è l'asse del tempo che continuerà nella scena successiva
    const thread = pos.filter(q => q.pt.kind === 0);
    const linkA = smooth(seg(p, .52, .74));
    if (linkA > 0) {
      ctx.lineWidth = 1.2;
      ctx.lineCap = "round";
      for (let i = 0; i < thread.length - 1; i++) {
        const a = thread[i], b = thread[i + 1];
        ctx.strokeStyle = `rgba(${MINT},${.42 * linkA * a.m})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      ctx.lineCap = "butt";
    }

    // particelle — il campo libero resta tenue: silenzio visivo
    for (const q of pos) {
      const col = q.pt.kind === 1 ? GOLD : MINT;
      const a = q.pt.kind === 2 ? .12 : lerp(.22, .80, q.m);
      ctx.fillStyle = `rgba(${col},${a})`;
      ctx.beginPath(); ctx.arc(q.x, q.y, q.pt.r, 0, Math.PI * 2); ctx.fill();
    }

    // il nucleo: la persona — presenza, prima del sistema
    const core = smooth(seg(p, .50, .70));
    if (core > 0) {
      const pulse = 1 + .05 * Math.sin(t * .0012);
      const rr = R * .42 * pulse;
      const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
      rg.addColorStop(0, `rgba(${GOLD},${.34 * core})`);
      rg.addColorStop(.4, `rgba(${GOLD},${.10 * core})`);
      rg.addColorStop(1, `rgba(${GOLD},0)`);
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,249,220,${.95 * core})`;
      ctx.beginPath(); ctx.arc(cx, cy, 3.2 * core, 0, Math.PI * 2); ctx.fill();
      // ponte nucleo → traccia: la vita incontra il tempo
      const drop = smooth(seg(p, .62, .78));
      if (drop > 0) {
        ctx.strokeStyle = `rgba(${GOLD},${.35 * drop})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx, cy + R * .1); ctx.lineTo(cx, lerp(cy + R * .1, ly, drop)); ctx.stroke();
      }
    }

    // impulso vitale: percorre la traccia, non orbita — il tempo scorre
    const life = smooth(seg(p, .72, .84));
    if (life > 0 && !reduce) {
      const u = (t * .00012) % 1;
      const lx = lerp(lx0, lx1, u);
      const rg = ctx.createRadialGradient(lx, ly, 0, lx, ly, 26);
      rg.addColorStop(0, `rgba(${GOLD},${.8 * life})`); rg.addColorStop(1, `rgba(${GOLD},0)`);
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(lx, ly, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,249,220,${life})`;
      ctx.beginPath(); ctx.arc(lx, ly, 2.6, 0, Math.PI * 2); ctx.fill();
    }

    ctx.globalAlpha = .045; ctx.fillStyle = grain; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;

    // DOM — la tipografia è temporizzata sul campo: prima il silenzio,
    // poi l'eyebrow, poi la frase; tutto cede quando la persona emerge
    const out = smooth(seg(p, .50, .66));
    const e = smooth(seg(p, .02, .10)) * (1 - out);
    const h = smooth(seg(p, .08, .20)) * (1 - out);
    const s = smooth(seg(p, .20, .30)) * (1 - out);
    eyebrow.style.opacity = e;
    h1.style.opacity = h; h1.style.transform = `translateY(${lerp(22, 0, smooth(seg(p, .08, .20))) - out * 18}px)`;
    sub.style.opacity = s; sub.style.transform = `translateY(${lerp(14, 0, smooth(seg(p, .20, .30)))}px)`;
    intro.style.transform = `translateY(calc(-50% - ${26 * out}px))`;
    cap.style.opacity = seg(p, .80, .90);
  }
  return { resize, update };
}

/* ---------- atto 03 · il tempo — la misura al posto della dichiarazione ----------

   Concetto: una dichiarazione è un punto fermo; una misura è una sequenza.
   Canvas: asse temporale che si popola di giorni, una traccia di aderenza
   che scorre, eventi datati, un'interruzione visibile, l'esito finale.
   DOM: il log testuale della traccia (accessibile).                      */

function initTempo(stage, ctx) {
  let W = 0, H = 0, grain = null, bg = null, ticks = [];
  const cap = stage.querySelector("[data-cap]");
  const ECO = window.PBCARE_ECOSYSTEM;
  const FC = ECO ? ECO.byId.farmacomm.palette
                 : { rgbAccent: "79,216,224", rgbAtmosphere: "7,27,43" };
  const TCYAN = FC.rgbAccent; // ambiente clinico

  // il log della traccia — testo reale, si accende in sync col disegno
  const LOG = [
    { t: "giorno 001 — la traccia inizia",      at: .16 },
    { t: "evento — presa in carico",            at: .40 },
    { t: "aderenza — 38 giorni continui",       at: .55 },
    { t: "interruzione — 6 giorni",             at: .70 },
    { t: "esito — osservato nel tempo",         at: .86 },
  ];
  const caps = captionLog(stage.querySelector("#tlog"), LOG, .89);
  const title = titleStager(stage, { in: [.02, .12], out: [.24, .34], sub: [.86, .94] });

  let DPR = 1;
  const mob = () => W <= 800;
  const axisY = () => (mob() ? H * .66 : H * .56);
  const ax0 = () => W * .07, ax1 = () => W * .93;
  const GAP = [.62, .70]; // interruzione: la traccia si ferma, i giorni no

  function off(w, h) {
    const c = document.createElement("canvas");
    c.width = Math.ceil(w * DPR); c.height = Math.ceil(h * DPR);
    const x = c.getContext("2d");
    x.setTransform(DPR, 0, 0, DPR, 0, 0);
    return [c, x];
  }

  // la traccia di aderenza: linea organica sopra l'asse, con gap
  function traceY(u) {
    return axisY() - H * .085 * (.45 + .45 * Math.sin(u * 9.4 + 1.2))
                 - H * .02 * Math.sin(u * 27 + .6);
  }

  function resize() {
    W = stage.clientWidth; H = stage.clientHeight;
    DPR = Math.min(1.5, devicePixelRatio || 1);
    const c = stage.querySelector("canvas");
    c.width = W * DPR; c.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    grain = makeGrain(ctx);

    // fondo: la madre si raffredda verso l'atmosfera FarmaCOmm (palette reale)
    let g;
    [bg, g] = off(W, H);
    let lg = g.createLinearGradient(0, 0, W * .8, H);
    lg.addColorStop(0, "#05110f");
    lg.addColorStop(.5, `rgb(${mixRGB("5,17,15", FC.rgbAtmosphere, .7)})`);
    lg.addColorStop(1, `rgb(${mixRGB("5,17,15", FC.rgbAtmosphere, .95)})`);
    g.fillStyle = lg; g.fillRect(0, 0, W, H);
    lg = g.createRadialGradient(W * .5, axisY(), 0, W * .5, axisY(), W * .55);
    lg.addColorStop(0, `rgba(${TCYAN},.05)`); lg.addColorStop(1, `rgba(${TCYAN},0)`);
    g.fillStyle = lg; g.fillRect(0, 0, W, H);
    g.globalAlpha = .05; g.fillStyle = grain; g.fillRect(0, 0, W, H);

    // giorni: tacche deterministiche lungo l'asse
    ticks = [];
    const n = mob() ? 48 : 96;
    for (let i = 0; i < n; i++) {
      ticks.push({
        u: i / (n - 1),
        h: (.008 + rnd(i * 7.7) * .030 + (i % 8 === 0 ? .016 : 0)) * H,
      });
    }
  }

  const EVENTS = [.18, .40, .58, .82]; // eventi datati sulla traccia

  function update(p, time) {
    ctx.clearRect(0, 0, W, H);
    const t = reduce ? 0 : time;
    ctx.drawImage(bg, 0, 0, W, H);

    const ax = axisY(), x0 = ax0(), x1 = ax1();
    const ux = u => lerp(x0, x1, u);

    // asse temporale
    const base = smooth(seg(p, .02, .12));
    if (base > 0) {
      ctx.strokeStyle = `rgba(${TCYAN},${.28 * base})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, ax); ctx.lineTo(x1, ax); ctx.stroke();
    }

    // i giorni arrivano uno dopo l'altro — il tempo passa davvero
    const dayFlow = smooth(seg(p, .08, .45));
    for (const tk of ticks) {
      const a = smooth(seg(dayFlow, tk.u * .9, tk.u * .9 + .1));
      if (a <= 0) continue;
      const x = ux(tk.u);
      const inGap = tk.u > GAP[0] && tk.u < GAP[1];
      ctx.strokeStyle = `rgba(${TCYAN},${(inGap ? .5 : .30) * a * base})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, ax - tk.h); ctx.lineTo(x, ax + tk.h); ctx.stroke();
    }

    // la traccia di aderenza scorre — con un'interruzione visibile.
    // Nel vuoto il mondo perde un po' di luce: l'assenza si percepisce
    const reveal = smoother(seg(p, .20, .68));
    const inGapNow = reveal > GAP[0] && reveal < GAP[1];
    const dim = inGapNow ? smooth(seg(reveal, GAP[0], GAP[0] + .03)) * (1 - smooth(seg(reveal, GAP[1] - .02, GAP[1]))) : 0;
    if (dim > 0) { ctx.fillStyle = `rgba(3,10,14,${.35 * dim})`; ctx.fillRect(0, 0, W, H); }
    if (reveal > 0) {
      ctx.strokeStyle = `rgba(${TCYAN},${.85 - .3 * dim})`;
      ctx.lineWidth = 1.6;
      ctx.shadowColor = `rgba(${TCYAN},.3)`; ctx.shadowBlur = 6;
      ctx.beginPath();
      let pen = false;
      const STEPS = 90;
      for (let k = 0; k <= STEPS; k++) {
        const u = (k / STEPS);
        if (u > reveal) break;
        if (u > GAP[0] && u < GAP[1]) { pen = false; continue; }
        const x = ux(u), y = traceY(u);
        pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        pen = true;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // testa della traccia
      const hu = Math.min(reveal, 1);
      if (!(hu > GAP[0] && hu < GAP[1])) {
        const hx = ux(hu), hy = traceY(hu);
        const rg = ctx.createRadialGradient(hx, hy, 0, hx, hy, 18);
        rg.addColorStop(0, `rgba(${TCYAN},.7)`); rg.addColorStop(1, `rgba(${TCYAN},0)`);
        ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(hx, hy, 18, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#eafcff";
        ctx.beginPath(); ctx.arc(hx, hy, 2.4, 0, Math.PI * 2); ctx.fill();
      }

      // marker dell'interruzione: due tagli verticali nel vuoto
      if (reveal > GAP[0] + .02) {
        const g1 = ux(GAP[0]), g2 = ux(GAP[1]);
        ctx.strokeStyle = `rgba(${TCYAN},.55)`;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.moveTo(g1, ax - H * .14); ctx.lineTo(g1, ax + H * .05);
        ctx.moveTo(g2, ax - H * .14); ctx.lineTo(g2, ax + H * .05);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // eventi datati: il punto si accende quando la traccia lo raggiunge
    EVENTS.forEach((eu, i) => {
      const on = smooth(seg(p, .20 + eu * .48, .26 + eu * .48));
      if (on <= 0) return;
      const x = ux(eu), y = traceY(eu);
      const pr = 8 + 4 * Math.sin(t * .002 + i);
      const rg = ctx.createRadialGradient(x, y, 0, x, y, pr * 2.4);
      rg.addColorStop(0, `rgba(${TCYAN},${.5 * on})`); rg.addColorStop(1, `rgba(${TCYAN},0)`);
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(x, y, pr * 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(234,252,255,${.95 * on})`;
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
      // aggancio all'asse: l'evento è datato
      ctx.strokeStyle = `rgba(${TCYAN},${.35 * on})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, ax); ctx.stroke();
    });

    // esito: la traccia si chiude su un punto oro — misura, non claim
    const out = smooth(seg(p, .80, .92));
    if (out > 0) {
      const x = ux(1), y = traceY(1);
      const rg = ctx.createRadialGradient(x, y, 0, x, y, 44 * out);
      rg.addColorStop(0, `rgba(${GOLD},${.6 * out})`); rg.addColorStop(1, `rgba(${GOLD},0)`);
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(x, y, 44 * out, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff9dc";
      ctx.beginPath(); ctx.arc(x, y, 3.6 * out, 0, Math.PI * 2); ctx.fill();
    }

    // uscita: la traccia piega verso il basso e a sinistra —
    // nella scena seguente diventa la presenza della persona
    const drop = smooth(seg(p, .88, .99));
    if (drop > 0) {
      const hx = ux(1), hy = traceY(1);
      const ex = lerp(hx, mob() ? W * .5 : W * .30, smooth(drop)); // → persona in #relation
      ctx.strokeStyle = `rgba(${GOLD},${.6 * drop})`;
      ctx.lineWidth = 1.4;
      ctx.shadowColor = `rgba(${GOLD},.3)`; ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.quadraticCurveTo(hx, lerp(hy, H * .92, drop), ex, H * 1.04);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = .045; ctx.fillStyle = grain; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;

    // DOM: titolo come momento, didascalie vicino al fenomeno
    title(p); caps(p);
    cap.style.opacity = seg(p, .92, .98);
  }
  return { resize, update };
}

/* ---------- atto 05 · la relazione — la persona controlla la connessione ----------

   Due presenze, non icone: la persona (calda, con il suo campo di consenso)
   e il professionista (freddo, a distanza). La richiesta si ferma al confine;
   il consenso apre la linea DALLA persona verso il professionista; la revoca
   ritira la connessione — il professionista resta, perde solo l'accesso.    */

function initRelation(stage, ctx) {
  let W = 0, H = 0, grain = null;
  const cap = stage.querySelector("[data-cap]");
  const sig = stage.querySelector("#sigCare");
  const ECO = window.PBCARE_ECOSYSTEM;
  const CP = ECO ? ECO.byId.careprogram.palette
                 : { rgbAccent: "90,191,120", rgbSecondary: "229,138,58", rgbAtmosphere: "10,36,24" };

  const LOG = [
    { t: "proposta — la richiesta attende al confine",    at: .22 },
    { t: "consenso — la persona apre la connessione",     at: .46 },
    { t: "accesso — ciò che serve, per ciò che serve",    at: .62 },
    { t: "revoca — la connessione si ritira",             at: .82 },
  ];
  const caps = captionLog(stage.querySelector("#rlog"), LOG, .90);
  const title = titleStager(stage, { in: [.02, .12], out: [.16, .26], sub: [.88, .95] });

  const mob = () => W <= 800;
  const px = () => mob() ? W * .50 : W * .30, py = () => mob() ? H * .40 : H * .52;
  const qx = () => mob() ? W * .50 : W * .72, qy = () => mob() ? H * .78 : H * .50;
  const fieldR = () => Math.min(W, H) * (mob() ? .14 : .18);

  // la connessione: curva appena arcuata dal bordo del campo al professionista
  function connPoint(t) {
    const ax = px(), ay = py(), bx = qx(), by = qy();
    const dx = bx - ax, dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    const ex = ax + dx / len * fieldR(), ey = ay + dy / len * fieldR();
    const mx = (ex + bx) / 2 - dy / len * len * .10;
    const my = (ey + by) / 2 + dx / len * len * .10;
    const m = 1 - t;
    return { x: m * m * ex + 2 * m * t * mx + t * t * bx,
             y: m * m * ey + 2 * m * t * my + t * t * by };
  }

  function resize() {
    W = stage.clientWidth; H = stage.clientHeight;
    const DPR = Math.min(1.5, devicePixelRatio || 1);
    const c = stage.querySelector("canvas");
    c.width = W * DPR; c.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    grain = makeGrain(ctx);
  }

  function update(p, time) {
    ctx.clearRect(0, 0, W, H);
    const t = reduce ? 0 : time;
    const ax = px(), ay = py(), bx = qx(), by = qy(), R = fieldR();

    const in_ = smooth(seg(p, .04, .16));
    const req = smooth(seg(p, .18, .34));      // richiesta al confine
    const con = smooth(seg(p, .38, .52));      // consenso → connessione
    const acc = smooth(seg(p, .56, .68));      // accesso appropriato
    const rev = smooth(seg(p, .76, .88));      // revoca → ritiro
    const live = con * (1 - rev);              // connessione attiva

    // territorio CareProgram: il campo si scalda PRIMA del marchio —
    // verde dal respiro del campo, arancio quando l'accesso è concesso.
    // Il colore anticipa l'identità; la firma sarà una conseguenza.
    const warm = (in_ * .4 + req * .3 + acc * .6) * (1 - rev * .55);
    if (warm > 0) {
      let g = ctx.createRadialGradient(ax, ay, 0, ax, ay, R * 4.2);
      g.addColorStop(0, `rgba(${CP.rgbAccent},${.085 * warm})`); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      g = ctx.createRadialGradient(ax, ay - R, 0, ax, ay - R, R * 2.2);
      g.addColorStop(0, `rgba(${CP.rgbSecondary},${.05 * acc * (1 - rev)})`); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // calore anche dalla parte del professionista durante l'accesso
      g = ctx.createRadialGradient(bx, by, 0, bx, by, R * 3);
      g.addColorStop(0, `rgba(${CP.rgbAccent},${.05 * acc * (1 - rev)})`); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }

    // campo di consenso della persona — confine tratteggiato che respira
    if (in_ > 0) {
      const breathe = 1 + .04 * Math.sin(t * .0012);
      ctx.setLineDash([2, 6]);
      ctx.lineDashOffset = -t * .008;
      ctx.strokeStyle = `rgba(${GOLD},${.30 * in_})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(ax, ay, R * breathe, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]); ctx.lineDashOffset = 0;
    }

    // la persona — presenza calda
    if (in_ > 0) {
      const rg = ctx.createRadialGradient(ax, ay, 0, ax, ay, R * .55);
      rg.addColorStop(0, `rgba(${GOLD},${.35 * in_})`); rg.addColorStop(1, `rgba(${GOLD},0)`);
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(ax, ay, R * .55, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff9dc";
      ctx.beginPath(); ctx.arc(ax, ay, 3.4, 0, Math.PI * 2); ctx.fill();
    }

    // il professionista — presenza fredda, si spegne (non muore) alla revoca
    const qDim = lerp(1, .35, rev);
    if (in_ > 0) {
      const rg = ctx.createRadialGradient(bx, by, 0, bx, by, R * .45);
      rg.addColorStop(0, `rgba(${MINT},${.30 * in_ * qDim})`); rg.addColorStop(1, `rgba(${MINT},0)`);
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(bx, by, R * .45, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(214,244,236,${.95 * in_ * qDim})`;
      ctx.beginPath(); ctx.arc(bx, by, 3, 0, Math.PI * 2); ctx.fill();
    }

    // la richiesta: si ferma al confine del campo — attende, non entra
    if (req > 0 && con < 1) {
      const a = lerp(0, 1, req);
      const tip = connPoint(0); // bordo del campo
      const from = { x: bx, y: by };
      const ix = lerp(from.x, tip.x, a), iy = lerp(from.y, tip.y, a);
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = `rgba(${MINT},${.4 * req * (1 - con)})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(ix, iy); ctx.stroke();
      ctx.setLineDash([]);
      // "knock": piccolo impulso dove la richiesta tocca il campo
      if (req > .95) {
        const k = (t * .001) % 1;
        ctx.strokeStyle = `rgba(${MINT},${.5 * (1 - k) * (1 - con)})`;
        ctx.beginPath(); ctx.arc(tip.x, tip.y, 4 + k * 16, 0, Math.PI * 2); ctx.stroke();
      }
    }

    // il consenso: la connessione nasce DALLA persona e resta — una linea
    // di luce intera, viva, finché la persona lo vuole
    if (live > 0) {
      const draw = rev > 0 ? 1 - smooth(rev) : smooth(seg(con, .3, 1));
      ctx.lineCap = "round";
      // la linea intera (dal campo alla testa che avanza / arretra)
      ctx.strokeStyle = `rgba(${GOLD},${.55 * live})`;
      ctx.lineWidth = 1.4;
      ctx.shadowColor = `rgba(${GOLD},.35)`; ctx.shadowBlur = 10;
      ctx.beginPath();
      for (let k = 0; k <= 40; k++) {
        const u = (k / 40) * draw;
        const q = connPoint(u);
        k === 0 ? ctx.moveTo(q.x, q.y) : ctx.lineTo(q.x, q.y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      // testa luminosa dove la linea arriva
      const head = connPoint(draw);
      const rg = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 22);
      rg.addColorStop(0, `rgba(${GOLD},${.6 * live})`); rg.addColorStop(1, `rgba(${GOLD},0)`);
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(head.x, head.y, 22, 0, Math.PI * 2); ctx.fill();
      // impulsi che viaggiano in entrambe le direzioni — la relazione è viva
      if (draw >= .98 && !reduce) {
        for (const u of [(t * .00018) % 1, 1 - (t * .00018) % 1]) {
          const q = connPoint(u);
          ctx.fillStyle = `rgba(255,249,220,${.9 * live})`;
          ctx.beginPath(); ctx.arc(q.x, q.y, 2.2, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.lineCap = "butt";
    }

    // l'accesso: presso il professionista si accendono frammenti appropriati
    if (acc > 0) {
      const fade = 1 - smooth(rev);
      for (let i = 0; i < 4; i++) {
        const yy = by + (i - 1.5) * 16;
        const ww = (14 + rnd(i * 3.3) * 26) * acc;
        ctx.fillStyle = `rgba(${MINT},${.5 * acc * fade})`;
        ctx.fillRect(bx - ww / 2, yy, ww, 1.6);
      }
    }

    // la revoca: il campo si chiude — da confine tratteggiato a confine
    // pieno. La linea è rientrata; il professionista è ancora lì, a distanza
    if (rev > 0) {
      const k = smooth(rev);
      ctx.strokeStyle = `rgba(${GOLD},${.30 * (1 - k)})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(ax, ay, R * (1 + k * .4), 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = `rgba(${GOLD},${.55 * k})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(ax, ay, R, 0, Math.PI * 2); ctx.stroke();
      // la distanza fra i due resta visibile: lo spazio senza accesso
      ctx.setLineDash([1, 9]);
      ctx.strokeStyle = `rgba(${MINT},${.14 * k})`;
      ctx.beginPath(); ctx.moveTo(connPoint(0).x, connPoint(0).y); ctx.lineTo(bx, by); ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.globalAlpha = .045; ctx.fillStyle = grain; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;

    // DOM — durante il brand beat il marchio è il messaggio dominante:
    // le didascalie cedono leggermente e un alone caldo lo accoglie
    title(p); caps(p);
    const so = seg(p, .56, .64) * (1 - seg(p, .80, .88));
    sig.style.opacity = so;
    sig.style.transform = `translate(-50%,0) scale(${lerp(.92, 1, so)})`;
    if (so > .3) {
      const lx = mob() ? W * .5 : W * .30, ly = mob() ? H * .56 : H * .70;
      const g = ctx.createRadialGradient(lx, ly + 20, 0, lx, ly + 20, W * .16);
      g.addColorStop(0, `rgba(${CP.rgbAccent},${.10 * so})`); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    cap.style.opacity = seg(p, .92, .97);
  }
  return { resize, update };
}

/* ---------- atto 06 · il diritto diventa evento ----------

   Continuità col token della scena separazione: il DIRITTO (anello oro)
   si assegna, viene preso in carico, viene erogato — e quando accade
   diventa un EVENTO DATATO sull'asse del tempo. Articolo 32 resta come
   fonte della tutela, non più come macro-scena.                         */

function initEvent(stage, ctx) {
  let W = 0, H = 0, grain = null, ticks = [];
  const cap = stage.querySelector("[data-cap]");
  const services = [...stage.querySelectorAll("#eservices li")];
  const ECO = window.PBCARE_ECOSYSTEM;
  const FC = ECO ? ECO.byId.farmacomm.palette : { rgbAccent: "79,216,224" };

  const LOG = [
    { t: "la prestazione è riconosciuta — ancora promessa", at: .12 },
    { t: "assegnazione — la prestazione è affidata",        at: .34 },
    { t: "presa in carico — entra nel percorso",            at: .52 },
    { t: "erogazione — accade davvero",                     at: .72 },
    { t: "evento datato — osservabile nel tempo",           at: .86 },
  ];
  const caps = captionLog(stage.querySelector("#elog"), LOG, .91);
  const title = titleStager(stage, { in: [.02, .12], out: [.22, .32], sub: [.40, .50], subOut: [.70, .78] });

  const mob = () => W <= 800;
  const ox = () => mob() ? W * .50 : W * .30, oy = () => mob() ? H * .34 : H * .30;
  const cx2 = () => mob() ? W * .50 : W * .60, cy2 = () => mob() ? H * .52 : H * .40;
  const axisY = () => mob() ? H * .86 : H * .80;
  const ax0 = () => W * .14, ax1 = () => W * .86;
  const landX = () => ax0() + (ax1() - ax0()) * .62;

  function resize() {
    W = stage.clientWidth; H = stage.clientHeight;
    const DPR = Math.min(1.5, devicePixelRatio || 1);
    const c = stage.querySelector("canvas");
    c.width = W * DPR; c.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    grain = makeGrain(ctx);
    ticks = [];
    for (let i = 0; i < 42; i++) {
      ticks.push({ u: .45 + rnd(i * 7.1) * .34, h: (.006 + rnd(i * 4.7) * .018) * H });
    }
  }

  // traiettoria del token: origine → presa in carico → asse del tempo
  function tokenAt(u) {
    // u 0..1 = viaggio completo (due gambe)
    const a = { x: ox(), y: oy() }, b = { x: cx2(), y: cy2() }, c = { x: landX(), y: axisY() };
    if (u < .5) {
      const q = u * 2, m = 1 - q;
      const mx = (a.x + b.x) / 2 - (b.y - a.y) * .18, my = (a.y + b.y) / 2 + (b.x - a.x) * .18;
      return { x: m * m * a.x + 2 * m * q * mx + q * q * b.x,
               y: m * m * a.y + 2 * m * q * my + q * q * b.y };
    }
    const q = (u - .5) * 2, m = 1 - q;
    const mx = (b.x + c.x) / 2 + (c.y - b.y) * .14, my = (b.y + c.y) / 2 - (c.x - b.x) * .14;
    return { x: m * m * b.x + 2 * m * q * mx + q * q * c.x,
             y: m * m * b.y + 2 * m * q * my + q * q * c.y };
  }

  function update(p, time) {
    ctx.clearRect(0, 0, W, H);
    const t = reduce ? 0 : time;

    const seed = smooth(seg(p, .04, .14));     // l'anello del diritto
    const ride = smooth(seg(p, .14, .38));     // assegnazione
    const care = smooth(seg(p, .38, .56));     // presa in carico
    const drop = smooth(seg(p, .56, .74));     // erogazione
    const dated = smooth(seg(p, .76, .90));    // evento datato

    // energia semantica: ambra mentre il diritto viaggia, poi il campo
    // si RAFFREDDA verso il ciano clinico — il colore passa il testimone
    const amber = smooth(seg(p, .10, .55)) * (1 - smooth(seg(p, .82, .97)));
    const cool = smooth(seg(p, .82, .97));
    if (amber > 0) {
      const g = ctx.createRadialGradient(W * .55, H * .5, 0, W * .55, H * .5, W * .5);
      g.addColorStop(0, `rgba(212,169,79,${.055 * amber})`); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    if (cool > 0) {
      const g = ctx.createRadialGradient(W * .5, H * .85, 0, W * .5, H * .85, W * .6);
      g.addColorStop(0, `rgba(${FC.rgbAccent},${.05 * cool})`); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }

    // il diritto: lo stesso anello del confine della scena separazione
    if (seed > 0) {
      const sx0 = ox(), sy0 = oy();
      ctx.globalAlpha = seed;
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${GOLD},.6)`;
      ctx.shadowColor = `rgba(${GOLD},.25)`; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(sx0, sy0, 30, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = `rgba(${GOLD},.28)`;
      ctx.beginPath(); ctx.arc(sx0, sy0, 19, 0, Math.PI * 2); ctx.stroke();
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    }

    // l'asse del tempo appare quando serve — stessa grammatica di #tempo
    const axIn = smooth(seg(p, .50, .64));
    if (axIn > 0) {
      ctx.strokeStyle = `rgba(${FC.rgbAccent},${.26 * axIn})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(ax0(), axisY()); ctx.lineTo(ax1(), axisY()); ctx.stroke();
      for (const tk of ticks) {
        const x = ax0() + (ax1() - ax0()) * tk.u;
        ctx.strokeStyle = `rgba(${FC.rgbAccent},${.28 * axIn})`;
        ctx.beginPath(); ctx.moveTo(x, axisY() - tk.h); ctx.lineTo(x, axisY() + tk.h); ctx.stroke();
      }
    }

    // la presa in carico: un punto clinico che accoglie il token
    if (care > 0) {
      const rg = ctx.createRadialGradient(cx2(), cy2(), 0, cx2(), cy2(), 30);
      rg.addColorStop(0, `rgba(${FC.rgbAccent},${.5 * care})`); rg.addColorStop(1, `rgba(${FC.rgbAccent},0)`);
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(cx2(), cy2(), 30, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(234,252,255,${.9 * care})`;
      ctx.beginPath(); ctx.arc(cx2(), cy2(), 2.6, 0, Math.PI * 2); ctx.fill();
    }

    // il token in viaggio — promessa finché non atterra
    const journey = clamp((ride * .5 + drop * .5) / .999);
    const u = ride < 1 ? ride * .5 : .5 + drop * .5;
    if ((ride > 0 && ride < 1) || (drop > 0 && drop < 1)) {
      const pt = tokenAt(u);
      ctx.lineCap = "round";
      for (let i = 22; i >= 0; i--) {
        const pu = Math.max(0, u - i * .008), pu2 = Math.max(0, pu - .008);
        const a0 = tokenAt(pu), a1 = tokenAt(pu2);
        const f = 1 - i / 23;
        ctx.strokeStyle = `rgba(244,203,106,${.75 * f})`;
        ctx.lineWidth = .5 + 3 * f;
        ctx.beginPath(); ctx.moveTo(a0.x, a0.y); ctx.lineTo(a1.x, a1.y); ctx.stroke();
      }
      ctx.lineCap = "butt";
      const rg = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 34);
      rg.addColorStop(0, "rgba(255,238,187,.85)"); rg.addColorStop(1, "rgba(242,205,121,0)");
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(pt.x, pt.y, 34, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff3cf";
      ctx.beginPath(); ctx.arc(pt.x, pt.y, 3.8, 0, Math.PI * 2); ctx.fill();
      // durante la presa in carico il token respira attorno al punto clinico
      if (care > .6 && drop < .05) {
        const a2 = t * .003;
        ctx.strokeStyle = `rgba(${FC.rgbAccent},.4)`;
        ctx.beginPath(); ctx.arc(cx2(), cy2(), 12 + 3 * Math.sin(a2), 0, Math.PI * 2); ctx.stroke();
      }
    }

    // l'evento datato: il token si fissa sull'asse — da promessa a fatto
    if (dated > 0) {
      const ex = landX(), ey = axisY();
      ctx.strokeStyle = `rgba(${GOLD},${.8 * dated})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(ex, ey - H * .10); ctx.lineTo(ex, ey + H * .03); ctx.stroke();
      const rg = ctx.createRadialGradient(ex, ey - H * .10, 0, ex, ey - H * .10, 26 * dated);
      rg.addColorStop(0, `rgba(${GOLD},${.7 * dated})`); rg.addColorStop(1, `rgba(${GOLD},0)`);
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(ex, ey - H * .10, 26 * dated, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff9dc";
      ctx.beginPath(); ctx.arc(ex, ey - H * .10, 3, 0, Math.PI * 2); ctx.fill();
      if (W >= 760) {
        ctx.font = "10px 'DM Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = `rgba(241,200,71,${.85 * dated})`;
        ctx.fillText("giorno 147 — erogata · esempio", ex, ey + H * .07);
      }
    }

    ctx.globalAlpha = .045; ctx.fillStyle = grain; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;

    // DOM — gli ambiti di tutela vivono ora nella sezione Articolo 32;
    // qui resta solo la prestazione che diventa evento
    title(p); caps(p);
    if (services.length) {
      const sOut = 1 - smooth(seg(p, .70, .78));
      let sMax = 0;
      services.forEach((el, i) => {
        const v = smooth(seg(p, .42 + i * .02, .50 + i * .02)) * sOut;
        sMax = Math.max(sMax, v);
        el.style.opacity = v;
        el.style.transform = `translateY(${10 * (1 - v)}px)`;
      });
      services[0].parentElement.style.opacity = Math.min(1, sMax * 3);
    }
    cap.style.opacity = seg(p, .92, .97);
  }
  return { resize, update };
}

/* ---------- atto 07 · dall'individuo alla conoscenza ----------

   UNA traccia → altre entrano e RESTANO SEPARATE → sotto soglia il campo
   non produce nulla → alla quinta (k≥5) condensa una banda aggregata.
   Da qui emergono: l'ambiente FarmaCOmm, un percorso clinico (CAMIT),
   la superficie che condivide (Eventi Scientifici).                   */

function initKnowledge(stage, ctx) {
  let W = 0, H = 0, grain = null;
  const cap = stage.querySelector("[data-cap]");
  const sigFC = stage.querySelector("#sigFC");
  const sigES = stage.querySelector("#sigES");
  const sigCAM = stage.querySelector("#sigCAM");
  const ECO = window.PBCARE_ECOSYSTEM;
  const FC = ECO ? ECO.byId.farmacomm.palette
                 : { rgbAccent: "79,216,224", rgbAtmosphere: "7,27,43" };
  const CAM = ECO ? ECO.byId.camit.palette : { rgbAccent: "95,212,180" };

  const LOG = [
    { t: "una traccia — il percorso di una persona",              at: .10 },
    { t: "una seconda. Separate.",                                 at: .26 },
    { t: "tre, quattro — nessun pattern, non ancora",             at: .40 },
    { t: "la quinta. Il campo mostra ciò che hanno in comune.",    at: .60 },
    { t: "l'ambiente che custodisce questa conoscenza ha un nome", at: .80 },
    { t: "dentro l'ambiente, un percorso clinico concreto",        at: .87 },
    { t: "ciò che si sa, si condivide",                            at: .93 },
  ];
  const caps = captionLog(stage.querySelector("#klog"), LOG, .955);
  const title = titleStager(stage, { in: [.02, .12], out: [.16, .26], sub: [.10, .18], subOut: [.20, .28] });
  const kpeak = stage.querySelector("#kpeak");

  const mob = () => W <= 800;
  const x0 = () => W * .06, x1 = () => W * .94;
  // 5 tracce organiche: stesse regole di #tempo, semi diversi.
  // Sotto soglia ognuna ha una deriva propria (incertezza individuale);
  // alla soglia la deriva si quieta — non si fondono: si lasciano leggere.
  const TRACES = [
    { base: .32, amp: .055, f: 7.1,  ph: 1.2, at: .06, wob: 1.0 },
    { base: .41, amp: .070, f: 9.3,  ph: 4.4, at: .22, wob: 1.6 },
    { base: .50, amp: .048, f: 6.2,  ph: 2.8, at: .34, wob: 1.2 },
    { base: .59, amp: .062, f: 10.4, ph: 5.7, at: .44, wob: 1.8 },
    { base: .68, amp: .052, f: 8.1,  ph: 3.3, at: .54, wob: 1.4 }, // la quinta: soglia
  ];
  let calm = 0; // 0 = deriva individuale, 1 = campo quieto (k≥5)
  // ciò che le tracce hanno in comune: un'onda lenta condivisa, nascosta
  // dalle differenze individuali finché il campo non si quieta
  const common = u => H * .055 * Math.sin(u * 5.2 + .8) + H * .02 * Math.sin(u * 11 + 2.1);
  const ty = (tr, u, t) => {
    const b = mob() ? H * (.40 + TRACES.indexOf(tr) * .085) : H * tr.base;
    const drift = (1 - calm) * tr.wob;
    return b - common(u)
             - H * tr.amp * (.5 + .5 * Math.sin(u * tr.f + tr.ph)) * lerp(1, .55, calm)
             - H * .012 * Math.sin(u * tr.f * 3.1 + tr.ph + t * .0003)
             - H * .018 * drift * Math.sin(u * 4.2 + tr.ph * 2 + t * .0005);
  };

  function resize() {
    W = stage.clientWidth; H = stage.clientHeight;
    const DPR = Math.min(1.5, devicePixelRatio || 1);
    const c = stage.querySelector("canvas");
    c.width = W * DPR; c.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    grain = makeGrain(ctx);
  }

  function update(p, time) {
    ctx.clearRect(0, 0, W, H);
    const t = reduce ? 0 : time;
    const agg = smoother(seg(p, .58, .72));      // condensazione k≥5
    const camIn = smooth(seg(p, .86, .92));      // percorso CAMIT
    const esIn = smooth(seg(p, .93, .99));       // superficie EventiScientifici
    calm = agg;
    const ind = lerp(1, .55, agg);               // le tracce restano, si lasciano leggere

    // l'atmosfera si raffredda verso FarmaCOmm — PRIMA che il nome appaia
    const atmo = smooth(seg(p, .62, .80));
    if (atmo > 0) {
      const g = ctx.createRadialGradient(W * .5, H * .5, 0, W * .5, H * .5, Math.max(W, H) * .75);
      g.addColorStop(0, `rgba(${FC.rgbAtmosphere},${.55 * atmo})`);
      g.addColorStop(1, `rgba(${FC.rgbAtmosphere},0)`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }

    // il respiro della soglia: una luce che cresce dal centro del campo,
    // lenta, al momento della quinta traccia — condensazione, non esplosione
    const breath = smooth(seg(p, .56, .66)) * (1 - smooth(seg(p, .80, .90)) * .6);
    if (breath > 0) {
      const g = ctx.createRadialGradient(W * .5, H * .50, 0, W * .5, H * .50, Math.min(W, H) * .55);
      g.addColorStop(0, `rgba(${FC.rgbAccent},${.11 * breath})`);
      g.addColorStop(1, `rgba(${FC.rgbAccent},0)`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }

    // EventiScientifici: la parte alta del campo SI APRE — più luce,
    // più aria, meno densità: la conoscenza diventa una superficie
    // pubblica. È il momento più luminoso del viaggio.
    if (esIn > 0) {
      const ey0 = mob() ? H * .06 : H * .07, ey1 = mob() ? H * .24 : H * .30;
      const g = ctx.createLinearGradient(0, ey0, 0, ey1);
      g.addColorStop(0, `rgba(210,244,255,${.22 * esIn})`);
      g.addColorStop(.6, `rgba(168,228,255,${.11 * esIn})`);
      g.addColorStop(1, "rgba(168,228,255,0)");
      ctx.fillStyle = g; ctx.fillRect(0, ey0, W, ey1 - ey0);
      // l'apertura respira: un alone chiaro sopra la superficie
      const hg = ctx.createRadialGradient(W * .5, ey0, 0, W * .5, ey0, W * .6);
      hg.addColorStop(0, `rgba(225,248,255,${.15 * esIn})`); hg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = hg; ctx.fillRect(0, 0, W, ey1 * 1.4);
      ctx.strokeStyle = `rgba(190,236,255,${.55 * esIn})`;
      ctx.lineWidth = 1;
      const ew = (x1() - x0()) * smooth(esIn);
      ctx.beginPath(); ctx.moveTo(x0(), ey1); ctx.lineTo(x0() + ew, ey1); ctx.stroke();
      // righe editoriali: la conoscenza diventa leggibile, pubblica
      for (let r = 0; r < 5; r++) {
        const yy = ey0 + (r + 1) * (ey1 - ey0) / 6.5;
        const a = smooth(seg(esIn, r * .12, r * .12 + .4));
        const ww = (x1() - x0()) * (.18 + rnd(r * 7.7) * .14) * a;
        const xx = x0() + (r % 2 ? (x1() - x0()) * .62 : (x1() - x0()) * .10);
        ctx.fillStyle = `rgba(200,240,255,${.34 * a})`;
        ctx.fillRect(xx, yy, ww, 1);
      }
    }

    // le tracce entrano una alla volta — la quinta scatta la soglia
    TRACES.forEach((tr, i) => {
      const enter = smooth(seg(p, tr.at, tr.at + .10));
      if (enter <= 0) return;
      const isCam = i === 4; // l'ultima traccia diventa il percorso CAMIT
      const col = isCam ? mixRGB(FC.rgbAccent, CAM.rgbAccent, camIn) : FC.rgbAccent;
      const slide = (1 - enter) * W * .18;
      ctx.strokeStyle = `rgba(${col},${(.58 + (isCam ? .25 * camIn : 0)) * ind * enter})`;
      ctx.lineWidth = isCam && camIn > 0 ? 1.4 + .6 * camIn : 1.3;
      ctx.beginPath();
      for (let k = 0; k <= 80; k++) {
        const u = k / 80;
        const x = lerp(x0(), x1(), u) - slide;
        let y = ty(tr, u, t);
        // CAMIT: la traccia si struttura in percorso — solo nella metà
        // destra, dove incontra l'ambiente (a sinistra resta organica)
        if (isCam && camIn > 0) {
          const su = smooth(seg(u, .42, .55));
          const seg3 = Math.floor(clamp((u - .42) / .58) * 3.999);
          const wy = H * (mob() ? .72 : .66) + seg3 * H * .045;
          y = lerp(y, wy, camIn * su);
        }
        k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      // testa che entra
      if (enter < 1) {
        const u = enter;
        const hx = lerp(x0(), x1(), u) - slide, hy = ty(tr, u, t);
        ctx.fillStyle = `rgba(234,252,255,${.9 * ind})`;
        ctx.beginPath(); ctx.arc(hx, hy, 2.2, 0, Math.PI * 2); ctx.fill();
      }
      // waypoint del percorso CAMIT
      if (isCam && camIn > 0) {
        for (let s = 0; s < 4; s++) {
          const u = .42 + (s / 3.999 + .001) * .58, x = lerp(x0(), x1(), u);
          const wy = H * (mob() ? .72 : .66) + s * H * .045;
          ctx.fillStyle = `rgba(${CAM.rgbAccent},${.85 * camIn})`;
          ctx.beginPath(); ctx.arc(x, wy, 2.6 * camIn, 0, Math.PI * 2); ctx.fill();
        }
      }
    });

    // conteggio discreto sotto soglia — un numero, non un pannello
    const cnt = smooth(seg(p, .08, .14)) * (1 - smooth(seg(p, .56, .62)));
    if (cnt > 0) {
      let n = 0;
      TRACES.forEach(tr => { if (p > tr.at + .04) n++; });
      const by = H * (mob() ? .34 : .88);
      ctx.font = `300 ${mob() ? 54 : 88}px 'Newsreader', serif`;
      ctx.textAlign = "right";
      ctx.fillStyle = `rgba(${FC.rgbAccent},${.22 * cnt})`;
      ctx.fillText(String(n), x1(), by);
      ctx.font = "10px 'DM Mono', monospace";
      ctx.fillStyle = `rgba(${FC.rgbAccent},${.5 * cnt})`;
      ctx.fillText("SOTTO SOGLIA", x1(), by + 16);
      ctx.textAlign = "left";
    }

    // la condensazione: inviluppo vero (min/max delle tracce, non una banda
    // piatta) — ciò che le tracce hanno in comune, non la loro fusione
    if (agg > 0) {
      const mean = [], lo = [], hi = [];
      for (let k = 0; k <= 60; k++) {
        const u = k / 60;
        let m = 0, mn = 1e9, mx = -1e9;
        for (const tr of TRACES) { const y = ty(tr, u, t); m += y; mn = Math.min(mn, y); mx = Math.max(mx, y); }
        const mu = m / TRACES.length;
        const sp = (mx - mn) * .5 * lerp(.42, .20, agg); // la banda si stringe: condensa
        mean.push(mu); lo.push(mu - sp); hi.push(mu + sp);
      }
      ctx.beginPath();
      lo.forEach((y, k) => { const x = lerp(x0(), x1(), k / 60); k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
      for (let k = 60; k >= 0; k--) ctx.lineTo(lerp(x0(), x1(), k / 60), hi[k]);
      ctx.closePath();
      ctx.fillStyle = `rgba(${FC.rgbAccent},${.07 * agg})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${FC.rgbAccent},${.18 * agg})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); lo.forEach((y, k) => { const x = lerp(x0(), x1(), k / 60); k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }); ctx.stroke();
      ctx.beginPath(); hi.forEach((y, k) => { const x = lerp(x0(), x1(), k / 60); k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }); ctx.stroke();
      // la linea del pattern — nasce dal centro e si estende ai lati,
      // dopo che il titolo ha ceduto: prima la frase, poi la forma
      const ext = smooth(seg(p, .72, .84));
      ctx.strokeStyle = `rgba(234,252,255,${.85 * agg})`;
      ctx.lineWidth = 1.8;
      ctx.shadowColor = `rgba(${FC.rgbAccent},.45)`; ctx.shadowBlur = 12;
      ctx.beginPath();
      const k0 = Math.round(30 - 30 * ext), k1 = Math.round(30 + 30 * ext);
      for (let k = k0; k <= k1; k++) { const x = lerp(x0(), x1(), k / 60); k === k0 ? ctx.moveTo(x, mean[k]) : ctx.lineTo(x, mean[k]); }
      ctx.stroke();
      ctx.shadowBlur = 0; ctx.lineWidth = 1;
    }

    // il nome dell'ambiente: una luce chiara si raccoglie dove apparirà,
    // e il resto del campo arretra — il marchio è il messaggio dominante
    const fc = smooth(seg(p, .82, .90));
    if (fc > 0) {
      const lx = W * .5, ly = H * .44;
      const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, Math.min(W, H) * .26);
      g.addColorStop(0, `rgba(234,252,255,${.22 * fc})`);
      g.addColorStop(1, "rgba(234,252,255,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const v = ctx.createRadialGradient(lx, ly, Math.min(W, H) * .18, lx, ly, Math.max(W, H) * .72);
      v.addColorStop(0, "rgba(0,0,0,0)");
      v.addColorStop(1, `rgba(3,10,18,${.30 * fc})`);
      ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    }

    ctx.globalAlpha = .045; ctx.fillStyle = grain; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;

    // DOM — titolo d'ingresso, didascalie, il titolo che TORNA al picco
    title(p); caps(p);
    const pk = smooth(seg(p, .62, .70)) * (1 - smooth(seg(p, .72, .78)));
    kpeak.style.opacity = pk;
    kpeak.style.transform = `translate(-50%,-50%) translateY(${lerp(14, 0, smooth(seg(p, .62, .70)))}px)`;
    // le firme: tre autorità diverse — ambiente, percorso, superficie
    sigFC.style.opacity = fc * lerp(1, .07, esIn);
    sigFC.style.transform = `translate(-50%,-50%) scale(${lerp(.92, 1, fc)})`;
    const cm = seg(p, .88, .93);
    sigCAM.style.opacity = cm * .9;
    sigCAM.style.transform = `translateY(-50%) scale(${lerp(.92, 1, cm)})`;
    const es = seg(p, .945, .985);
    sigES.style.opacity = es;
    sigES.style.transform = `translate(-50%,-50%) scale(${lerp(.92, 1, es)})`;
    cap.style.opacity = seg(p, .96, .99);
  }
  return { resize, update };
}

/* ---------- atto 08 · Enzima — un ciclo, non una pipeline ----------

   Il pattern osservato viene isolato, diventa domanda, attraversa un
   ciclo chiuso (ricerca → progetto → applicazione), rientra nel campo e
   perturba il sistema: nasce una nuova osservazione. Catalizza, non
   conclude. Comportamento: circolare + ritorno perturbante.             */

function initResearch(stage, ctx) {
  let W = 0, H = 0, grain = null, dust = [], cluster = [];
  const cap = stage.querySelector("[data-cap]");
  const specs = [...stage.querySelectorAll(".spec")];
  const sig = stage.querySelector("#sigENZ");
  const ECO = window.PBCARE_ECOSYSTEM;
  const ENZ = ECO ? ECO.byId.enzima.palette
                  : { rgbAccent: "127,232,224", rgbSecondary: "79,216,176", rgbAtmosphere: "6,34,42" };
  const TEAL = ENZ.rgbAccent, TEAL2 = ENZ.rgbSecondary;

  const mob = () => W <= 800;
  const cx = () => mob() ? W * .5 : W * .60, cy = () => mob() ? H * .60 : H * .52;
  const rx = () => Math.min(W, H) * (mob() ? .20 : .23);
  const ry = () => rx() * .74;
  // punto sul ciclo — wobble organico, non ellisse perfetta
  function loopPt(a, t) {
    const w = 1 + .07 * Math.sin(3 * a + t * .0008);
    return { x: cx() + Math.cos(a) * rx() * w, y: cy() + Math.sin(a) * ry() * w };
  }
  const STATIONS = [-.5, .7, 1.9, 3.1, 4.3]; // osservazione→…→impatto sul ciclo

  function resize() {
    W = stage.clientWidth; H = stage.clientHeight;
    const DPR = Math.min(1.5, devicePixelRatio || 1);
    const c = stage.querySelector("canvas");
    c.width = W * DPR; c.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    grain = makeGrain(ctx);
    dust = [];
    for (let i = 0; i < 50; i++) dust.push({ x: rnd(i * 3.1) * W, y: rnd(i * 7.9) * H, r: .6 + rnd(i * 2.2) * 1.1, ph: rnd(i) * 6.28 });
    cluster = [];
    for (let i = 0; i < 14; i++) {
      const a = rnd(i * 5.3) * 6.28, r = rnd(i * 8.7) * 26;
      cluster.push({ x: Math.cos(a) * r, y: Math.sin(a) * r * .7, ph: rnd(i) * 6.28 });
    }
  }

  function update(p, time) {
    ctx.clearRect(0, 0, W, H);
    const t = reduce ? 0 : time;

    const obs = smooth(seg(p, .05, .18));      // osservazione isolata
    const ask = smooth(seg(p, .20, .34));      // diventa domanda → entra nel ciclo
    const spin = smooth(seg(p, .34, .78));     // circola: ricerca/progetto
    const back = smooth(seg(p, .70, .84));     // ritorno al campo
    const wake = smooth(seg(p, .80, .94));     // perturbazione → nuova osservazione

    // campo di fondo — il pulviscolo che la perturbazione attraversa.
    // Dopo il ritorno il campo RESTA cambiato: le particelle vicine al
    // punto di rientro si tingono di teal e si orientano — memoria del ciclo
    const to0 = { x: mob() ? W * .5 : W * .30, y: mob() ? H * .82 : H * .78 };
    for (const d of dust) {
      const dist = Math.hypot(d.x - to0.x, d.y - to0.y);
      const touched = wake * smooth(1 - clamp(dist / (W * .32)));
      const rip = wake > 0 ? .5 + .5 * Math.sin(t * .002 + d.ph + wake * 9) : 0;
      const col = mixRGB(MINT, TEAL2, touched);
      ctx.fillStyle = `rgba(${col},${.07 + .08 * rip + .35 * touched})`;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r * (1 + touched * .6), 0, Math.PI * 2); ctx.fill();
    }

    // il cluster dell'osservazione: il pattern della scena precedente
    const hx = mob() ? W * .5 : W * .30, hy = mob() ? H * .76 : H * .70;
    if (obs > 0) {
      for (const d of cluster) {
        const wob = Math.sin(t * .001 + d.ph) * 3;
        ctx.fillStyle = `rgba(${TEAL},${.55 * obs})`;
        ctx.beginPath(); ctx.arc(hx + d.x + wob, hy + d.y + wob * .6, 1.7, 0, Math.PI * 2); ctx.fill();
      }
      // "domanda": anello che oscilla — interrogativo senza simbolo
      const q = ask * (1 - smooth(seg(p, .30, .36)));
      if (q > 0) {
        const rr = 34 + 4 * Math.sin(t * .002);
        ctx.setLineDash([3, 5]);
        ctx.strokeStyle = `rgba(${TEAL},${.5 * q})`;
        ctx.beginPath(); ctx.arc(hx, hy, rr, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // il ciclo: si disegna quando la domanda entra — e non si chiude mai del tutto
    if (ask > 0) {
      const draw = smooth(seg(ask, .2, 1)) * Math.PI * 2 * .96;
      ctx.strokeStyle = `rgba(${TEAL},${.22 * ask})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let k = 0; k <= 90; k++) {
        const a = -Math.PI / 2 + (k / 90) * draw;
        const q = loopPt(a, t);
        k === 0 ? ctx.moveTo(q.x, q.y) : ctx.lineTo(q.x, q.y);
      }
      ctx.stroke();
      // stazioni del ciclo — le fasi, sospese
      STATIONS.forEach((a, i) => {
        const q = loopPt(a, t);
        const on = smooth(seg(p, .30 + i * .11, .38 + i * .11));
        if (on <= 0) return;
        ctx.strokeStyle = `rgba(${TEAL2},${.5 * on})`;
        ctx.beginPath(); ctx.arc(q.x, q.y, 7, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = `rgba(${TEAL2},${.25 * on})`;
        ctx.beginPath(); ctx.arc(q.x, q.y, 3, 0, Math.PI * 2); ctx.fill();
      });
    }

    // la domanda circola nel ciclo — catalisi
    if (spin > 0) {
      const rev = spin * Math.PI * 2 * 1.4; // ~1.4 giri, poi esce
      const a = -Math.PI / 2 + rev;
      const q = loopPt(a, t);
      // scia lungo il ciclo
      ctx.lineCap = "round";
      for (let i = 26; i >= 0; i--) {
        const a0 = a - i * .03, a1 = a - (i + 1) * .03;
        const q0 = loopPt(a0, t), q1 = loopPt(a1, t);
        const f = 1 - i / 27;
        ctx.strokeStyle = `rgba(${TEAL},${.75 * f * spin})`;
        ctx.lineWidth = .5 + 2.4 * f;
        ctx.beginPath(); ctx.moveTo(q0.x, q0.y); ctx.lineTo(q1.x, q1.y); ctx.stroke();
      }
      ctx.lineCap = "butt";
      const rg = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, 26);
      rg.addColorStop(0, `rgba(${TEAL},.8)`); rg.addColorStop(1, `rgba(${TEAL},0)`);
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(q.x, q.y, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#eafdff";
      ctx.beginPath(); ctx.arc(q.x, q.y, 2.8, 0, Math.PI * 2); ctx.fill();
    }

    // il ritorno: una parte rientra nel campo — la trasformazione applicata
    if (back > 0) {
      const a = -Math.PI / 2 + 1.4 * Math.PI * 2; // punto di uscita del ciclo
      const from = loopPt(a, t);
      const to = { x: mob() ? W * .5 : W * .30, y: mob() ? H * .82 : H * .78 };
      const bx2 = lerp(from.x, to.x, smooth(back)), by2 = lerp(from.y, to.y, smooth(back));
      ctx.strokeStyle = `rgba(${TEAL2},${.6 * back})`;
      ctx.setLineDash([2, 4]);
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(bx2, by2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `rgba(${TEAL2},.95)`;
      ctx.beginPath(); ctx.arc(bx2, by2, 2.6, 0, Math.PI * 2); ctx.fill();
    }

    // la perturbazione: onda che attraversa il campo + nuova osservazione
    if (wake > 0) {
      const to = { x: mob() ? W * .5 : W * .30, y: mob() ? H * .82 : H * .78 };
      const k = smooth(wake);
      ctx.strokeStyle = `rgba(${TEAL2},${.35 * (1 - k)})`;
      ctx.beginPath(); ctx.arc(to.x, to.y, 10 + k * W * .25, 0, Math.PI * 2); ctx.stroke();
      // nuova piccola traccia — il ciclo riapre l'osservazione
      const draw = k * 30;
      ctx.strokeStyle = `rgba(${GOLD},${.75 * k})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i <= draw; i++) {
        const u = i / 30;
        const x = to.x + u * 90;
        const y = to.y - Math.sin(u * 6) * 8 - u * 10;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.lineWidth = 1;
    }

    ctx.globalAlpha = .045; ctx.fillStyle = grain; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;

    // DOM — il titolo cede al ciclo e TORNA quando il ciclo riapre
    // l'osservazione: la frase è la tesi della scena, non un'etichetta.
    // La firma arriva con la trasformazione compiuta e resta.
    const tin = smooth(seg(p, .02, .14)), tout = smooth(seg(p, .26, .38));
    const back2 = smooth(seg(p, .86, .94));
    const ta = clamp(tin * (1 - tout) + back2);
    const ty = lerp(18, 0, tin) - tout * 12 - back2 * 6;
    stage.querySelectorAll(".enz .eyebrow, .enz h2").forEach(el => {
      el.style.opacity = ta; el.style.transform = `translateY(${ty}px)`;
    });
    const so = seg(p, .74, .82);
    // durante il beat la lista delle fasi arretra: Enzima è il messaggio
    const beat = smooth(so) * (1 - smooth(seg(p, .86, .92)));
    specs.forEach((el, i) => {
      el.classList.toggle("done", p > .16 + i * .15);
      el.style.opacity = lerp(1, .30, beat);
    });
    sig.style.opacity = so;
    sig.style.transform = `scale(${lerp(.92, 1, so)})`;
    cap.style.opacity = seg(p, .90, .97);
  }
  return { resize, update };
}

/* ---------- atto 09 · il sistema — sintesi, non inventario ----------

   La scena a layer resta, ma cambia peso: arriva DOPO aver vissuto
   relazione, evento, conoscenza e ricerca. Quando un layer è dominante
   il suo marchio emerge per pochi istanti — firma, non parete.          */

function initSystem(stage, ctx) {
  let W = 0, H = 0, dust = [], grain = null;
  const cap = stage.querySelector("[data-cap]");
  const sigsEl = stage.querySelector("#layerSigs");

  /* manifest e nodi nascono dalla source of truth — mai duplicati qui */
  const ECO = window.PBCARE_ECOSYSTEM || { NARRATIVE: [], FOOTER_LINKS: [] };
  const layersEl = stage.querySelector("#layers");
  const rows = [], NODES = [], layerBoxes = [], layerSigs = [];
  ECO.NARRATIVE.forEach((layer, li) => {
    const box = document.createElement("div");
    box.className = "layer";
    const lab = document.createElement("span");
    lab.className = "lname";
    lab.textContent = `${layer.label} · ${layer.hint}`;
    box.appendChild(lab);
    layer.entities.forEach(e => {
      const a = document.createElement("a");
      a.className = "sat";
      a.dataset.entity = e.id;
      a.dataset.status = e.status;
      const href = e.layerAnchor || (e.urlStatus === "da verificare" ? null : e.currentUrl);
      if (href) {
        a.href = href;
        if (!href.startsWith("#")) { a.target = "_blank"; a.rel = "noopener"; }
      }
      a.style.setProperty("--sat-accent", e.palette.accent);
      a.style.setProperty("--sat-accent-rgb", e.palette.rgbAccent);
      const dot = document.createElement("span"); dot.className = "sdot";
      const nm = document.createElement("span"); nm.className = "sname"; nm.textContent = e.name;
      const mt = document.createElement("span"); mt.className = "smeta"; mt.textContent = e.layerMeta || "";
      a.append(dot, nm, mt);
      box.appendChild(a);
      const idx = rows.length;
      rows.push(a);
      NODES.push({ e, li, idx });
    });
    layersEl.appendChild(box);
    layerBoxes.push(box);
    // loghi del layer: il marchio riemerge come eco alla profondità
    // del proprio livello — firma, non parete di brand
    const logos = layer.entities.filter(e => e.logo);
    const holder = [];
    logos.forEach((e, i) => {
      const img = document.createElement("img");
      img.className = "lsig e-" + e.id + (i > 0 ? " minor" : "");
      img.src = e.logo; img.alt = e.name;
      img.dataset.li = li; img.dataset.n = i;
      sigsEl.appendChild(img);
      holder.push(img);
    });
    layerSigs.push(holder);
  });
  const startOf = i => .12 + i * .075; // soglia di attivazione

  const mob = () => W <= 800;
  // i livelli vivono in profondità: identità in superficie, ricerca sul fondo
  const layerY = li => mob() ? H * (.50 + li * .092) : H * (.20 + li * .155);
  // la spina entra dall'alto a destra — la traccia della persona ritorna
  const spineX = () => mob() ? W * .80 : W * .72;

  function resize() {
    W = stage.clientWidth; H = stage.clientHeight;
    const DPR = Math.min(1.5, devicePixelRatio || 1);
    const c = stage.querySelector("canvas");
    c.width = W * DPR; c.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    grain = makeGrain(ctx);
    dust = [];
    for (let i = 0; i < 60; i++) {
      dust.push({ x: rnd(i * 3.1) * W, y: rnd(i * 7.9) * H, r: .6 + rnd(i * 2.2) * 1.2, ph: rnd(i) * 6.28 });
    }
    // ogni marchio-eco si ancora alla profondità del suo livello
    sigsEl.querySelectorAll(".lsig").forEach(img => {
      const li = +img.dataset.li, i = +img.dataset.n;
      img.style.top = (layerY(li) + (i ? H * .045 : -H * .052)) + "px";
    });
  }

  function update(p, time) {
    ctx.clearRect(0, 0, W, H);
    const t = reduce ? 0 : time;
    const sx = spineX();
    const nLayers = ECO.NARRATIVE.length || 1;

    // pulviscolo — più rado in profondità
    for (let i = 0; i < dust.length; i++) {
      const d = dust[i];
      const tw = .4 + .3 * Math.sin(t * .0009 + d.ph);
      ctx.fillStyle = `rgba(${MINT},${.08 + .10 * tw})`;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
    }

    // la spina: la traccia della persona SCENDE dall'alto attraversando
    // i livelli — la stessa traccia che ha percorso tutta l'esperienza
    const spineIn = smooth(seg(p, .02, .16));
    if (spineIn > 0) {
      const yBot = layerY(nLayers - 1) + H * .05;
      const yDraw = lerp(-H * .12, yBot, spineIn);
      const lg = ctx.createLinearGradient(0, 0, 0, yBot);
      lg.addColorStop(0, `rgba(${GOLD},${.55 * spineIn})`);
      lg.addColorStop(.35, `rgba(${PAPER},${.5 * spineIn})`);
      lg.addColorStop(1, `rgba(${MINT},${.28 * spineIn})`);
      ctx.strokeStyle = lg;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([1, 7]);
      ctx.beginPath(); ctx.moveTo(sx, -H * .12); ctx.lineTo(sx, yDraw); ctx.stroke();
      ctx.setLineDash([]);
      const hy = Math.min(yDraw, yBot);
      const rg = ctx.createRadialGradient(sx, hy, 0, sx, hy, 22);
      rg.addColorStop(0, `rgba(${GOLD},${.7 * spineIn})`); rg.addColorStop(1, `rgba(${GOLD},0)`);
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(sx, hy, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,249,220,${.95 * spineIn})`;
      ctx.beginPath(); ctx.arc(sx, hy, 2.8, 0, Math.PI * 2); ctx.fill();
    }

    // piani di profondità: ogni layer è una lamina orizzontale
    ECO.NARRATIVE.forEach((layer, li) => {
      const firstIdx = NODES.find(n => n.li === li).idx;
      const on = smooth(seg(p, startOf(firstIdx) - .06, startOf(firstIdx) + .02));
      if (on <= 0) return;
      const y = layerY(li);
      const ac = layer.entities[0].palette.rgbAccent;
      const lg = ctx.createLinearGradient(0, y, W, y);
      lg.addColorStop(0, `rgba(${ac},0)`);
      lg.addColorStop(.55, `rgba(${ac},${.16 * on})`);
      lg.addColorStop(1, `rgba(${ac},${.05 * on})`);
      ctx.strokeStyle = lg; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      const haze = ctx.createLinearGradient(0, y, 0, y + H * .10);
      haze.addColorStop(0, `rgba(${ac},${.045 * on})`); haze.addColorStop(1, `rgba(${ac},0)`);
      ctx.fillStyle = haze; ctx.fillRect(0, y, W, H * .10);
      if (W >= 760) {
        ctx.font = "9px 'DM Mono', monospace";
        ctx.textAlign = "right";
        ctx.fillStyle = `rgba(${ac},${.55 * on})`;
        ctx.fillText(layer.label.toUpperCase(), W * .985, y - 7);
      }
    });

    // nodi entità: agganci al proprio layer, connessione alla spina
    ctx.textAlign = "left";
    for (const n of NODES) {
      const { e, li, idx } = n;
      const on = smoother(seg(p, startOf(idx), startOf(idx) + .09));
      if (on <= 0) continue;
      const y = layerY(li);
      const within = layerIndexWithin(NODES, li, idx);
      const dir = within % 2 ? -1 : 1;
      const off = W * (mob() ? .055 : .075) + within * (mob() ? W * .05 : W * .07);
      const nx = sx + dir * off;
      const c = e.palette.rgbAccent;

      const ext = !!e.external;
      ctx.strokeStyle = `rgba(${c},${(ext ? .30 : .5) * on})`;
      ctx.lineWidth = 1;
      if (ext) ctx.setLineDash([2, 5]);
      ctx.beginPath(); ctx.moveTo(sx, y); ctx.lineTo(nx, y); ctx.stroke();
      ctx.setLineDash([]);

      const pop = on * (1.18 - .18 * on);
      const rg = ctx.createRadialGradient(nx, y, 0, nx, y, 22);
      rg.addColorStop(0, `rgba(${c},${.5 * on})`); rg.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(nx, y, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(${c},${.95 * on})`;
      ctx.beginPath(); ctx.arc(nx, y, 3.2 * pop, 0, Math.PI * 2); ctx.fill();
      // i nomi vivono nell'indice DOM: qui il nodo è un'eco luminosa,
      // non un'etichetta — la scena è riconoscimento, non inventario

      // Prosperya: il suo multicolore vive SOLO intorno alla sua presenza
      // autonoma — tre archi cromatici locali, non un ambiente arcobaleno
      if (ext) {
        const pr = smooth(seg(p, startOf(idx) + .04, startOf(idx) + .16));
        if (pr > 0) {
          const cols = ["229,138,58", "79,216,224", "241,200,71"];
          cols.forEach((col, ci) => {
            const a0 = ci * 2.1 + t * .0007, a1 = a0 + 1.5;
            ctx.strokeStyle = `rgba(${col},${.55 * pr})`;
            ctx.lineWidth = 1.3;
            ctx.beginPath(); ctx.arc(nx, y, 10 + ci * 3.5, a0, a1); ctx.stroke();
          });
        }
      }
    }

    // territorio cromatico localizzato: il layer dominante tinge appena
    // il suo piano — convivenza controllata, non un'unica tinta
    let focusLi = -1;
    for (const n of NODES) if (p > startOf(n.idx) + .02) focusLi = Math.max(focusLi, n.li);
    if (focusLi >= 0) {
      const fl = ECO.NARRATIVE[focusLi];
      const ac = fl.entities[0].palette.rgbAccent;
      const fy = layerY(focusLi) + H * .05;
      const fg = ctx.createRadialGradient(W * .62, fy, 0, W * .62, fy, W * .42);
      fg.addColorStop(0, `rgba(${ac},.07)`); fg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = fg; ctx.fillRect(0, 0, W, H);
    }

    ctx.globalAlpha = .045; ctx.fillStyle = grain; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;

    // DOM: un layer dominante alla volta — gli altri contesto;
    // quando un livello è dominante il suo marchio emerge e torna indietro
    layerBoxes.forEach((b, li) => b.classList.toggle("dim", focusLi >= 0 && li !== focusLi));
    layerSigs.forEach((holder, li) => holder.forEach(img => img.classList.toggle("on", li === focusLi)));
    rows.forEach((r, i) => r.classList.toggle("lit", p > startOf(i) + .04));
    cap.style.opacity = seg(p, .86, .95);
  }
  return { resize, update };
}

// posizione di un nodo dentro il suo layer (0,1,2…)
function layerIndexWithin(nodes, li, idx) {
  let k = 0;
  for (const n of nodes) { if (n.li !== li) continue; if (n.idx === idx) return k; k++; }
  return k;
}

/* ---------- atto 10 · reveal — questo è PB-CARe ----------

   Il mondo si ricompone nella palette madre: fili di grammatica già vista
   (tracce, confini, connessioni, eventi, pattern, cicli) convergono al
   centro e perdono le loro separazioni. Poi il marchio reale — asset,
   non ricostruzione.                                                      */

function initReveal(stage, ctx) {
  let W = 0, H = 0, grain = null, streams = [], dust = [];
  const cap = stage.querySelector("[data-cap]");
  const logo = stage.querySelector("#pbcLogo");
  const line = stage.querySelector("#revealLine");
  const eyebrow = stage.querySelector("#revealEyebrow");

  // i colori del mondo visto finora — tutti rientrano nell'identità madre
  const STREAM_COLS = ["90,191,120", "79,216,224", "168,228,255", "127,232,224", "95,212,180", "212,169,79"];

  function resize() {
    W = stage.clientWidth; H = stage.clientHeight;
    const DPR = Math.min(1.5, devicePixelRatio || 1);
    const c = stage.querySelector("canvas");
    c.width = W * DPR; c.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    grain = makeGrain(ctx);
    streams = [];
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2 + rnd(i * 3.3) * .4;
      const r0 = Math.max(W, H) * (.55 + rnd(i * 7.7) * .3);
      streams.push({
        a, r0,
        col: STREAM_COLS[i % STREAM_COLS.length],
        wob: 2 + rnd(i * 5.1) * 4,
        dly: rnd(i * 9.9) * .3,
      });
    }
    dust = [];
    for (let i = 0; i < 70; i++) dust.push({ x: rnd(i * 4.1) * W, y: rnd(i * 8.3) * H, r: .6 + rnd(i * 2.9) * 1.2, ph: rnd(i) * 6.28 });
  }

  function update(p, time) {
    ctx.clearRect(0, 0, W, H);
    const t = reduce ? 0 : time;
    const cx2 = W * .5, cy2 = H * .5;
    const conv = seg(p, .04, .58);      // convergenza
    const unify = smooth(seg(p, .52, .72)); // un'unica grammatica
    const glow = smooth(seg(p, .50, .78));  // luce dietro il marchio

    // pulviscolo — si raccoglie verso il centro
    for (const d of dust) {
      const dd = lerp(1, .45, unify);
      const x = lerp(d.x, cx2 + (d.x - cx2) * .4, unify);
      const y = lerp(d.y, cy2 + (d.y - cy2) * .4, unify);
      ctx.fillStyle = `rgba(${MINT},${.07 + .06 * Math.sin(t * .0009 + d.ph)})`;
      ctx.beginPath(); ctx.arc(x, y, d.r * dd, 0, Math.PI * 2); ctx.fill();
    }

    // i fili: ogni grammatica attraversata rientra verso il centro
    for (const s of streams) {
      const u = clamp((conv - s.dly) / (1 - s.dly));
      if (u <= 0) continue;
      const fade = 1 - unify * .85;
      const rr = s.r0 * (1 - smooth(u) * .82);
      // i fili non sono linee rette: ricordano tracce, confini, cicli
      ctx.strokeStyle = `rgba(${mixRGB(s.col, MINT, unify)},${.34 * u * fade})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let k = 0; k <= 40; k++) {
        const v = k / 40;
        const ang = s.a + v * s.wob * .06 * (1 - u);
        const rad = lerp(s.r0, rr * .35, v * smooth(u));
        const x = cx2 + Math.cos(ang) * rad;
        const y = cy2 + Math.sin(ang) * rad * .86;
        k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // il nucleo di luce sotto il marchio — la madre che accoglie
    if (glow > 0) {
      const rg = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, Math.min(W, H) * .42);
      rg.addColorStop(0, `rgba(79,180,220,${.16 * glow})`);
      rg.addColorStop(.5, `rgba(${MINT},${.06 * glow})`);
      rg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    }

    // l'orizzonte: quando i fili si sono unificati, il campo si calma in
    // una linea di luce orizzontale — la superficie madre ritrovata
    const calm = smooth(seg(p, .62, .82));
    if (calm > 0) {
      const hy = cy2 + H * .10;
      const g = ctx.createLinearGradient(W * .1, 0, W * .9, 0);
      g.addColorStop(0, "rgba(159,216,201,0)");
      g.addColorStop(.5, `rgba(${MINT},${.38 * calm})`);
      g.addColorStop(1, "rgba(159,216,201,0)");
      ctx.strokeStyle = g; ctx.lineWidth = 1;
      ctx.shadowColor = "rgba(159,216,201,.35)"; ctx.shadowBlur = 10;
      ctx.beginPath();
      const ext2 = smooth(calm) * W * .4;
      ctx.moveTo(cx2 - ext2, hy); ctx.lineTo(cx2 + ext2, hy); ctx.stroke();
      ctx.shadowBlur = 0;
      // respiro appena accennato sotto l'orizzonte — il campo vive
      ctx.strokeStyle = `rgba(${MINT},${.07 * calm})`;
      ctx.beginPath();
      for (let x = cx2 - ext2; x <= cx2 + ext2; x += 8) {
        const u = (x - (cx2 - ext2)) / (ext2 * 2 || 1);
        const yy = hy + Math.sin(u * 5 + t * .0009) * 3;
        x === cx2 - ext2 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }

    ctx.globalAlpha = .045; ctx.fillStyle = grain; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;

    // DOM — dichiarazione → silenzio → risoluzione.
    // Il marchio non viene svelato: il mondo si risolve in esso.
    eyebrow.style.opacity = seg(p, .04, .12) * (1 - seg(p, .40, .48));
    const ln = smooth(seg(p, .14, .26)) * (1 - smooth(seg(p, .42, .52)));
    line.style.opacity = ln;
    line.style.transform = `translateY(${lerp(14, 0, smooth(seg(p, .14, .26))) - smooth(seg(p, .42, .52)) * 12}px)`;
    const res = smooth(seg(p, .56, .74));
    logo.style.opacity = res;
    logo.style.transform = `scale(${lerp(.92, 1, res)}) translateY(${lerp(12, 0, res)}px)`;
    cap.style.opacity = seg(p, .84, .92);
  }
  return { resize, update };
}

/* ---------- scena 02 · separazione — canvas come le altre ---------- */
/* i visual pesanti (piano carta, seam, apertura, token) sono disegnati:
   un solo blit GPU per frame. Il DOM tiene solo il testo. */

function initSep(stage, ctx) {
  const $ = s => stage.querySelector(s);
  // palette reali delle identità (source of truth): il mondo si contamina
  const ECO = window.PBCARE_ECOSYSTEM;
  const CP = ECO ? ECO.byId.careprogram.palette : { rgbAccent: "90,191,120", rgbSecondary: "229,138,58" };
  const FC = ECO ? ECO.byId.farmacomm.palette : { rgbAccent: "79,216,224" };
  const intro = $("#sepIntro"), persona = $("#persona"), prole = stage.querySelector(".prole");
  const identityFacts = $("#identityFacts");
  const clinical = $("#clinical"), code = $("#pcode"), statement = $("#statement");
  const label = $("#tokenLabel"), cue = $("#sepCue");
  const caps = ["#scap1", "#scap2", "#scap3"].map($);
  const FINAL = "7K4M9QX2R";
  let W = 0, H = 0, DPR = 1, bg = null, tickH = [];
  const mob = () => W <= 800;
  const seamX = () => W * .36, seamY = () => H * .52;
  const sx = () => mob() ? W * .5 : W * .36;
  const sy = () => mob() ? H * .52 : H * .5;

  function off(w, h) {
    const c = document.createElement("canvas");
    c.width = Math.ceil(w * DPR); c.height = Math.ceil(h * DPR);
    const x = c.getContext("2d");
    x.setTransform(DPR, 0, 0, DPR, 0, 0);
    return [c, x];
  }

  function resize() {
    W = stage.clientWidth; H = stage.clientHeight;
    DPR = Math.min(1.5, devicePixelRatio || 1);
    const c = stage.querySelector("canvas");
    c.width = W * DPR; c.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const grain = makeGrain(ctx);

    // sfondo statico: base + vignetta + grain, un solo blit per frame
    let g;
    [bg, g] = off(W, H);
    let lg = g.createLinearGradient(0, 0, W, H);
    lg.addColorStop(0, "#03120f"); lg.addColorStop(.55, "#092722"); lg.addColorStop(1, "#103c33");
    g.fillStyle = lg; g.fillRect(0, 0, W, H);
    lg = g.createRadialGradient(W * .15, H * .80, 0, W * .15, H * .80, W * .34);
    lg.addColorStop(0, `rgba(${GOLD},.05)`); lg.addColorStop(.7, `rgba(${GOLD},0)`);
    g.fillStyle = lg; g.fillRect(0, 0, W, H);
    lg = g.createRadialGradient(W * .5, H * .48, Math.min(W, H) * .20, W * .5, H * .48, Math.max(W, H) * .80);
    lg.addColorStop(0, "rgba(0,0,0,0)"); lg.addColorStop(1, "rgba(0,0,0,.40)");
    g.fillStyle = lg; g.fillRect(0, 0, W, H);
    g.globalAlpha = .05; g.fillStyle = grain; g.fillRect(0, 0, W, H);

    // altezze precomputate del righello temporale
    tickH = [];
    const n = mob() ? 49 : 111;
    for (let i = 0; i < n; i++) {
      const near = i === Math.round(n * .16) || i === Math.round(n * .48) || i === Math.round(n * .8);
      tickH.push({ h: (.012 + rnd(i * 7.7) * .048 + (near ? .027 : 0)) * H, near });
    }
  }

  function codeAt(p) {
    const q = smoother(seg(p, .56, .72)); let out = "";
    for (let i = 0; i < FINAL.length; i++)
      out += q >= (i + 1) / FINAL.length ? FINAL[i] : "·";
    return out;
  }

  // traiettoria del token: parametrica su t per poter disegnare la scia
  function tokenPoint(t) {
    const q = smoother(t);
    const a = mob() ? { x: W * .32, y: H * .38 } : { x: W * .30, y: H * .69 };
    const b = mob() ? { x: W * .50, y: H * .52 } : { x: W * .36, y: H * .50 };
    const c = mob() ? { x: W * .58, y: H * .76 } : { x: W * .665, y: H * .655 };
    const m = 1 - q;
    return {
      x: m * m * a.x + 2 * m * q * b.x + q * q * c.x,
      y: m * m * a.y + 2 * m * q * b.y + q * q * c.y,
    };
  }

  function update(p) {
    ctx.clearRect(0, 0, W, H);
    const mobile = mob();
    const split = smoother(seg(p, .24, .48));   // il campo carta cresce dal confine
    const edge = mobile ? seamY() : seamX();    // posizione fissa del confine
    const ax = sx(), ay = sy();
    let g;

    ctx.drawImage(bg, 0, 0, W, H);

    // la luce si sposta con l'atto del separarsi — sempre a destra,
    // fuori dal corridoio dove transita il nome (difference + oro = blu).
    // Contaminazione cromatica: verde clinico-neutro → ciano FarmaCOmm
    // man mano che il territorio clinico emerge (mixRGB dalla palette reale).
    const contam = smooth(seg(p, .42, .78));
    const lc = mixRGB("73,123,93", FC.rgbAccent, contam);
    const lc2 = mixRGB("41,84,61", FC.rgbAccent, contam);
    const lx = W * lerp(.74, .80, split), ly = H * lerp(.50, .58, split);
    const la = .35 + .65 * split;
    g = ctx.createRadialGradient(lx, ly, 0, lx, ly, Math.max(W, H) * .62);
    g.addColorStop(0, `rgba(${lc},${.24 * la})`); g.addColorStop(.45, `rgba(${lc2},${.12 * la})`); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // lato identità: micro-contaminazione CareProgram (verde + arancio)
    // — sottile, la carta resta carta, il mondo assorbe non si tinge
    const idw = smooth(seg(p, .55, .80)) * (mobile ? .8 : 1);
    if (idw > 0) {
      g = ctx.createRadialGradient(W * .12, H * .72, 0, W * .12, H * .72, W * .30);
      g.addColorStop(0, `rgba(${CP.rgbAccent},${.07 * idw})`); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      g = ctx.createRadialGradient(W * .30, H * .16, 0, W * .30, H * .16, W * .22);
      g.addColorStop(0, `rgba(${CP.rgbSecondary},${.05 * idw})`); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }

    // righello del tempo: tacche che il confine poi taglia
    const emerge = smooth(seg(p, .005, .13));
    const fadeEvents = 1 - smooth(seg(p, .72, .80));
    const n = tickH.length;
    for (let i = 0; i < n; i++) {
      const u = .055 + .89 * i / (n - 1);
      const x = u * W;
      const left = !mobile && x < seamX();
      // su mobile le tacche svaniscono quando arriva il testo clinico
      const fade = (left ? 1 - split : fadeEvents)
        * (mobile ? 1 - smooth(seg(p, .50, .62)) : 1);
      if (fade < .01) continue;
      const yc = mobile ? lerp(H * .57, H * .66, split)
                        : left ? H * .51 : lerp(H * .51, H * .62, split);
      const appear = smooth(seg(emerge, i / n * .55, Math.min(1, i / n * .55 + .3)));
      const tk = tickH[i];
      ctx.strokeStyle = `rgba(183,220,201,${(tk.near ? .66 : .34) * appear * fade})`;
      ctx.lineWidth = tk.near ? 1.6 : 1;
      ctx.beginPath(); ctx.moveTo(x, yc - tk.h); ctx.lineTo(x, yc + tk.h); ctx.stroke();
    }

    // il campo carta cresce dal confine verso sinistra (bordo sfumato)
    if (split > .001) {
      const size = edge * split, start = edge - size;
      g = mobile
        ? ctx.createLinearGradient(0, start, 0, edge)
        : ctx.createLinearGradient(start, 0, edge, 0);
      g.addColorStop(0, "#c1c9b8"); g.addColorStop(.4, "#d8dcc9"); g.addColorStop(1, "#e7e5d9");
      ctx.fillStyle = g;
      mobile ? ctx.fillRect(0, start, W, size) : ctx.fillRect(start, 0, size, H);
      // bordo ottico sfumato dove il campo sta crescendo
      const f = mobile ? 65 : 95;
      g = mobile
        ? ctx.createLinearGradient(0, start - f, 0, start)
        : ctx.createLinearGradient(start - f, 0, start, 0);
      g.addColorStop(0, "rgba(193,201,184,0)"); g.addColorStop(1, "rgba(193,201,184,1)");
      ctx.fillStyle = g;
      mobile ? ctx.fillRect(0, start - f, W, f) : ctx.fillRect(start - f, 0, f, H);
      // respiro scuro oltre il confine
      g = mobile
        ? ctx.createLinearGradient(0, edge, 0, edge + 56)
        : ctx.createLinearGradient(edge, 0, edge + 56, 0);
      g.addColorStop(0, `rgba(0,0,0,${.12 * split})`); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      mobile ? ctx.fillRect(0, edge, W, 56) : ctx.fillRect(edge, 0, 56, H);
    }

    // confine oro + apertura: appare solo dopo l'atterraggio del nome
    // (il difference blend inverte l'oro in blu se coincide col testo)
    const boundary = smooth(seg(p, .50, .60));
    if (boundary > 0) {
      ctx.globalAlpha = boundary;
      ctx.lineWidth = 1;
      g = mobile
        ? ctx.createLinearGradient(0, ay, W, ay)
        : ctx.createLinearGradient(ax, 0, ax, H);
      g.addColorStop(0, `rgba(${GOLD},.15)`); g.addColorStop(.5, "#e6bd52"); g.addColorStop(1, `rgba(${GOLD},.15)`);
      ctx.strokeStyle = g;
      ctx.shadowColor = `rgba(${GOLD},.22)`; ctx.shadowBlur = 18;
      ctx.beginPath();
      if (mobile) { ctx.moveTo(0, ay); ctx.lineTo(W * .5 - 38, ay); ctx.moveTo(W * .5 + 38, ay); ctx.lineTo(W, ay); }
      else { ctx.moveTo(ax, 0); ctx.lineTo(ax, H * .5 - 38); ctx.moveTo(ax, H * .5 + 38); ctx.lineTo(ax, H); }
      ctx.stroke();
      ctx.shadowBlur = 0;
      const sc = lerp(.72, 1, boundary);
      ctx.globalAlpha = .9 * boundary;
      ctx.strokeStyle = `rgba(${GOLD},.58)`;
      ctx.beginPath(); ctx.arc(ax, ay, 38 * sc, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = `rgba(${GOLD},.32)`;
      ctx.beginPath(); ctx.arc(ax, ay, 24 * sc, 0, Math.PI * 2); ctx.stroke();
      g = ctx.createRadialGradient(ax, ay, 0, ax, ay, 20);
      g.addColorStop(0, "rgba(242,212,124,.9)"); g.addColorStop(1, "rgba(242,212,124,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ax, ay, 20, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#f2d47c";
      ctx.beginPath(); ctx.arc(ax, ay, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    // il diritto attraversa: punto luminoso con scia, non una scatola
    const tv = seg(p, .66, .84);
    if (tv > 0 && tv < 1) {
      const strength = smooth(seg(tv, 0, .08)) * (1 - smooth(seg(tv, .90, 1)));
      const pt = tokenPoint(tv);
      ctx.globalAlpha = strength;
      ctx.lineCap = "round";
      for (let i = 24; i >= 0; i--) {
        const prev = Math.max(0, tv - i * .012), next = Math.max(0, prev - .012);
        const a = tokenPoint(prev), b = tokenPoint(next);
        const f = 1 - i / 25;
        ctx.strokeStyle = `rgba(244,203,106,${.75 * f})`;
        ctx.lineWidth = .5 + 3 * f;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 38);
      g.addColorStop(0, "rgba(255,238,187,.9)"); g.addColorStop(.2, "rgba(242,205,121,.28)"); g.addColorStop(1, "rgba(242,205,121,0)");
      ctx.fillStyle = g; ctx.fillRect(pt.x - 38, pt.y - 38, 76, 76);
      ctx.fillStyle = "#fff3cf";
      ctx.beginPath(); ctx.arc(pt.x, pt.y, 4.2, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      const open = 1 - Math.abs(tv - .5) * 2;
      g = ctx.createRadialGradient(ax, ay, 0, ax, ay, 42 + open * 42);
      g.addColorStop(0, `rgba(${GOLD},${.10 + open * .16})`); g.addColorStop(1, `rgba(${GOLD},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ax, ay, 42 + open * 42, 0, Math.PI * 2); ctx.fill();
      label.style.left = pt.x + "px"; label.style.top = (pt.y + 24) + "px";
      label.style.opacity = strength;
    } else label.style.opacity = 0;

    /* ---------- DOM: testo ---------- */
    const introOut = smooth(seg(p, .06, .13));
    intro.style.opacity = 1 - introOut;
    intro.style.transform = `translateY(calc(-52% - ${introOut * 24}px))`;

    // la persona: nasce al centro in difference, il campo cresce, il nome si adagia
    const enter = smooth(seg(p, .12, .20));
    persona.style.opacity = enter * (1 - .30 * smooth(seg(p, .90, .97)));
    persona.style.left = lerp(50, mobile ? 50 : 18, split) + "%";
    persona.style.top = lerp(44, mobile ? 27 : 33, split) + "%";
    persona.style.transform = `translate(-50%,-50%) scale(${lerp(1, .92, split)})`;
    persona.classList.toggle("on", split > .97);
    prole.style.opacity = smooth(seg(p, .50, .58));

    const facts = smooth(seg(p, .50, .58));
    identityFacts.style.opacity = facts * (1 - .45 * smooth(seg(p, .90, .97)));
    identityFacts.style.transform = `translateY(${lerp(20, 0, facts)}px)`;

    const cl = smooth(seg(p, .54, .66));
    clinical.style.opacity = cl * (1 - .20 * smooth(seg(p, .90, .97)));
    clinical.style.transform = `translateY(${lerp(18, 0, cl)}px)`;
    const cs = codeAt(p);
    if (cs !== code._s) { code.textContent = cs; code._s = cs; }

    // caption bicolore sul confine: scure sulla carta, chiare sul petrolio
    const capW = Math.min(760, W * .70), capL = (W - capW) / 2;
    const rel = clamp((seamX() - capL) / capW) * 100;
    const capGrad = mobile ? null
      : `linear-gradient(90deg,#23382e ${rel}%,#f6f4ec ${rel}%)`;
    const cap1 = smooth(seg(p, .38, .44)) * (1 - smooth(seg(p, .50, .55)));
    const cap2 = smooth(seg(p, .56, .62)) * (1 - smooth(seg(p, .72, .77)));
    const cap3 = smooth(seg(p, .78, .84)) * (1 - smooth(seg(p, .88, .92)));
    [cap1, cap2, cap3].forEach((v, i) => {
      caps[i].style.opacity = v;
      caps[i].style.transform = `translateX(-50%) translateY(${lerp(10, 0, v)}px)`;
      caps[i].style.background = capGrad || "none";
      caps[i].style.webkitBackgroundClip = caps[i].style.backgroundClip = capGrad ? "text" : "";
      caps[i].style.color = capGrad ? "transparent" : "";
    });

    // cue di fase
    const cueText = p < .15 ? "scorri per entrare"
      : p < .50 ? "l'identità prende il suo spazio"
      : p < .70 ? "attraversa il diritto"
      : "il nome è rimasto fuori";
    if (cue._t !== cueText) { cue.textContent = cueText; cue._t = cueText; }
    cue.style.color = !mobile && split > .97 ? "#4c5d57" : "#8faea4";
    cue.style.opacity = 1 - smooth(seg(p, .90, .97));

    const st = smooth(seg(p, .90, .97));
    statement.style.opacity = st;
    statement.style.transform = `translateY(${lerp(24, 0, st)}px)`;
  }
  return { resize, update };
}

/* ---------- mondi dell'ecosistema — si compongono scrollando ----------
   Un init condiviso: il territorio cromatico arriva dalle CSS custom
   property della scena, gli elementi [data-beat] entrano in sequenza,
   il canvas aggiunge atmosfera viva nel colore del brand.            */

function initWorld(stage, ctx) {
  let W = 0, H = 0, grain = null, dust = [];
  const beats = [...stage.querySelectorAll("[data-beat]")];
  const route = stage.querySelector(".camit-route");
  const css = getComputedStyle(stage.closest(".scene") || stage);
  // --scene-accent è hex in CSS → serve "r,g,b" per rgba() nel canvas
  const hexAcc = (css.getPropertyValue("--scene-accent") || "#9fd8c9").trim();
  const hn = parseInt(hexAcc.slice(1), 16);
  const ACC = `${(hn >> 16) & 255},${(hn >> 8) & 255},${hn & 255}`;

  function resize() {
    W = stage.clientWidth; H = stage.clientHeight;
    const DPR = Math.min(1.5, devicePixelRatio || 1);
    const c = stage.querySelector("canvas");
    c.width = W * DPR; c.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    grain = makeGrain(ctx);
    dust = [];
    for (let i = 0; i < 38; i++) dust.push({
      x: rnd(i * 3.1) * W, y: rnd(i * 6.7) * H,
      r: .5 + rnd(i * 2.3) * 1.3, ph: rnd(i) * 6.28,
    });
  }

  function update(p, time) {
    ctx.clearRect(0, 0, W, H);
    const t = reduce ? 0 : time;

    // respiro del territorio: bloom che cresce mentre il mondo si compone
    const bloom = smooth(seg(p, .05, .55));
    if (bloom > 0) {
      const rg = ctx.createRadialGradient(W * .5, H * .55, 0, W * .5, H * .55, Math.max(W, H) * .55);
      rg.addColorStop(0, `rgba(${ACC},${.06 * bloom})`);
      rg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    }
    // pulviscolo nell'accento del brand
    for (const d of dust) {
      const a = (.04 + .04 * Math.sin(t * .0009 + d.ph)) * (.35 + .65 * bloom);
      ctx.fillStyle = `rgba(${ACC},${Math.max(0, a)})`;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = .045; ctx.fillStyle = grain; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;

    // gli elementi entrano in sequenza — il mondo si compone leggendo
    const n = beats.length;
    beats.forEach((el, i) => {
      const a = .06 + i * (.68 / Math.max(1, n)), b = a + .09;
      const v = smooth(seg(p, a, b));
      el.style.opacity = v;
      el.style.transform = `translateY(${lerp(30, 0, v)}px)`;
    });

    // CAMIT: il tracciato si disegna mentre il mondo si compone
    if (route) route.style.setProperty("--route-progress", smooth(seg(p, .3, .75)).toFixed(3));
  }
  return { resize, update };
}

/* ---------- engine ---------- */

const INITS = {
  s1: initS1, sep: initSep, tempo: initTempo,
  relation: initRelation, event: initEvent, knowledge: initKnowledge,
  research: initResearch, system: initSystem, reveal: initReveal,
  world: initWorld,
};
// scena senza init = stage statica, non rompe l'esperienza
const NOOP_INIT = () => ({ resize() {}, update() {} });
const nav = document.getElementById("topnav");
const gp = document.getElementById("gp");

// smooth scroll alla sorgente: la rotellina diventa flusso continuo,
// le scene seguono 1:1 — niente più "inseguimento" a scatti
let lenis = null;
if (typeof Lenis !== "undefined") {
  // anche in reduced-motion lo scroll resta fluido: le animazioni autonome
  // si fermano, ma la navigazione a rotellina non deve andare a scatti.
  // lerp più deciso = meno coda percettibile.
  lenis = new Lenis({
    lerp: reduce ? .42 : .085,
    anchors: { offset: 0 },
    smoothWheel: true,
    stopInertiaOnNavigate: true,
  });
}

// link di rete nel finale: generati dalla source of truth, non duplicati
{
  const ECO = window.PBCARE_ECOSYSTEM;
  const nl = document.querySelector(".netlinks");
  if (ECO && nl) ECO.FOOTER_LINKS.forEach(e => {
    const a = document.createElement("a");
    a.href = e.currentUrl; a.target = "_blank"; a.rel = "noopener";
    a.textContent = e.short || e.name;
    a.dataset.status = e.status;
    nl.appendChild(a);
  });
}

/* hero ambientale: la prima viewport respira da sola — il contenuto
   non dipende dallo scroll, il campo vive di tempo, non di p         */
const heroCv = document.getElementById("heroField");
const heroFx = heroCv ? initHero(heroCv) : null;

/* reveal editoriale guidato dalla posizione: gli elementi entrano quando
   il lettore li raggiunge. In reduced-motion sono subito completi.     */
const riseEls = [...document.querySelectorAll("[data-rise]")];
if (reduce || !("IntersectionObserver" in window)) {
  riseEls.forEach(el => el.classList.add("in"));
} else {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -10% 0px", threshold: .1 });
  riseEls.forEach(el => io.observe(el));
}

/* demo connessione CareProgram: autorizzata / revocata — principio
   illustrato, non una simulazione di dati reali                      */
{
  const demo = document.getElementById("connDemo");
  if (demo) {
    const status = document.getElementById("connection-status");
    const TXT = {
      granted: "La connessione è autorizzata dalla persona.",
      revoked: "Connessione revocata: il professionista non vede più nulla. Una segreteria non può riaprirla.",
    };
    demo.querySelectorAll("[data-connection]").forEach(b =>
      b.addEventListener("click", () => {
        const s = b.dataset.connection;
        demo.dataset.state = s;
        demo.querySelectorAll("[data-connection]")
          .forEach(x => x.setAttribute("aria-pressed", String(x === b)));
        status.textContent = TXT[s] || "";
      }));
  }
}

const controllers = [...document.querySelectorAll(".scene")].map(el => {
  const stage = el.querySelector(".stage");
  const canvas = stage.querySelector("canvas");
  const ctx = canvas ? canvas.getContext("2d") : null;
  const tag = stage.querySelector(".tag .pb");
  const { resize, update } = (INITS[el.dataset.scene] || NOOP_INIT)(stage, ctx);
  // le scene a canvas hanno animazioni legate al tempo: vanno sempre ridisegnate.
  // le scene DOM reagiscono solo a p: se p non cambia, non si ridisegnano affatto.
  const c = { el, stage, ctx, tag, cur: 0, last: -1, state: "", err: false,
              resize, update,
              ease: el.dataset.scene === "sep" ? .09 : .115,
              timeDriven: !!canvas };
  c.resize();
  return c;
});

addEventListener("resize", () => controllers.forEach(c => { c.resize(); c.last = -1; }));

/* ---------- debug mode: ?debugScroll=1 — mai visibile di default ---------- */
const DBG = new URLSearchParams(location.search).has("debugScroll");
let dbgEl = null;
if (DBG) {
  dbgEl = document.createElement("pre");
  dbgEl.style.cssText = "position:fixed;right:8px;bottom:8px;z-index:9999;margin:0;" +
    "padding:10px 12px;font:10px/1.5 monospace;color:#8ff0c8;" +
    "background:rgba(0,0,0,.78);border:1px solid rgba(143,240,200,.3);" +
    "border-radius:6px;pointer-events:none;white-space:pre";
  document.body.appendChild(dbgEl);
}

/* ---------- ?debugLayout=1 — bounding box e collisioni, solo sviluppo ----------
   Disegna i rettangoli degli elementi DOM visibili della scena attiva;
   le intersezioni tra box con opacità significativa sono evidenziate
   in rosso. Mai visibile in modalità normale.                        */
const DBL = new URLSearchParams(location.search).has("debugLayout");
let dblCtx = null, dblCanvas = null;
if (DBL) {
  dblCanvas = document.createElement("canvas");
  dblCanvas.style.cssText = "position:fixed;inset:0;z-index:9998;pointer-events:none";
  document.body.appendChild(dblCanvas);
  dblCtx = dblCanvas.getContext("2d");
  const fit = () => { dblCanvas.width = innerWidth; dblCanvas.height = innerHeight; };
  fit(); addEventListener("resize", fit);
}
const DBL_SEL = ".manifest .eyebrow,.manifest h2,.manifest .sub," +
  ".tlog .tl.cur,.bsig,.kpeak,.services,.specs,.cap,.tag,.imark,.iline," +
  ".pbc-logo,.reveal-line,#revealEyebrow,.sigs .lsig,.intro";
function debugLayout() {
  dblCtx.clearRect(0, 0, dblCanvas.width, dblCanvas.height);
  const boxes = [];
  for (const c of controllers) {
    if (c.state !== "active") continue;
    c.stage.querySelectorAll(DBL_SEL).forEach(el => {
      const r = el.getBoundingClientRect();
      const o = parseFloat(getComputedStyle(el).opacity) || 0;
      if (o < .06 || r.width < 3 || r.height < 3) return;
      if (r.bottom < 0 || r.top > innerHeight) return;
      boxes.push({ r, name: (el.id || el.className || el.tagName).toString().split(" ")[0] });
    });
  }
  dblCtx.font = "9px monospace";
  for (const b of boxes) {
    dblCtx.strokeStyle = "rgba(80,220,160,.85)"; dblCtx.lineWidth = 1;
    dblCtx.strokeRect(b.r.x, b.r.y, b.r.width, b.r.height);
    dblCtx.fillStyle = "rgba(80,220,160,.85)";
    dblCtx.fillText(b.name, b.r.x, b.r.y - 3);
  }
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i].r, b = boxes[j].r;
    const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    const iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    if (ix > 4 && iy > 4) {
      dblCtx.strokeStyle = "rgba(255,80,80,.95)"; dblCtx.lineWidth = 2;
      dblCtx.strokeRect(Math.max(a.left, b.left), Math.max(a.top, b.top), ix, iy);
    }
  }
}

/* ---------- ?snap=<sceneId>:<p> — salto deterministico per test/screenshot ---------- */
const snapM = location.search.match(/snap=([\w-]+):([\d.]+)/);
function doSnap() {
  if (!snapM) return;
  const target = document.getElementById(snapM[1]);
  if (!target) return;
  const y = target.getBoundingClientRect().top + scrollY +
            (target.offsetHeight - innerHeight) * parseFloat(snapM[2]);
  lenis ? lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y);
}
doSnap(); // immediato: lo script è a fine body, il layout esiste già

function loop(time) {
  // il frame successivo è schedulato PRIMA del lavoro: un'eccezione
  // in una scena non può mai congelare il resto dell'esperienza
  requestAnimationFrame(loop);
  if (lenis) lenis.raf(time);

  // hero ambientale: disegna solo quando la prima viewport è in vista
  if (heroFx) {
    const hr = heroFx.el.getBoundingClientRect();
    if (hr.bottom > -40 && hr.top < innerHeight + 40) heroFx.draw(time);
  }

  // progress globale + nav
  const max = document.documentElement.scrollHeight - innerHeight;
  const gp_ = max > 0 ? clamp(scrollY / max) : 0;
  gp.style.setProperty("--gp", gp_);
  nav.classList.toggle("scrolled", scrollY > 30);
  // durante l'intro la nav è quasi assente: il testo PB-CARe non compete
  // col marchio reale (resta raggiungibile con hover/focus)
  const introEl = document.getElementById("intro");
  nav.classList.toggle("nav-ghost",
    !!introEl && introEl.getBoundingClientRect().bottom > innerHeight * .45);
  // la struttura si rivela dopo l'intro + la persona — non prima
  const navAt = (introEl ? introEl.offsetHeight : 0) + innerHeight * .5;
  nav.classList.toggle("nav-open", scrollY > navAt);

  const dbg = [];
  for (const c of controllers) {
    const rect = c.el.getBoundingClientRect();
    const span = rect.height - innerHeight;
    const p = clamp(-rect.top / span);

    /* LIFECYCLE — handoff deterministico tra scene:
       before  = la scena non è ancora entrata
       active  = possiede (o sta cedendo) la viewport
       after   = ha ceduto definitivamente il controllo                */
    const state = p <= 0 ? "before" : p >= 1 ? "after" : "active";
    if (state !== c.state) {
      c.el.classList.remove("is-before", "is-active", "is-after");
      c.el.classList.add("is-" + state);
      c.state = state;
    }

    const visible = rect.bottom > -60 && rect.top < innerHeight + 60;
    if (DBG) dbg.push(`${c.el.id.padEnd(6)} p=${p.toFixed(2)} top=${Math.round(rect.top)} ${state}${visible ? "" : " [culled]"}${c.err ? " [ERR: " + c.errMsg + "]" : ""}`);
    if (!visible) continue;

    // con Lenis lo scroll è già smorzato: la scena segue 1:1.
    // senza Lenis, fallback al lerp per-scena.
    c.cur = (lenis || reduce) ? p : c.cur + (p - c.cur) * c.ease;
    c.tag.style.setProperty("--p", c.cur);

    /* EXIT ENVELOPE — la scena cede intenzionalmente la viewport:
       ultima parte del progresso → lieve uscita in luminosità/quota.
       Non è un fade-to-black: è la cessione del piano alla scena
       successiva che sta entrando dal basso.                          */
    const exit = smooth(seg(c.cur, .94, 1));
    c.stage.style.opacity = 1 - exit * .5;
    c.stage.style.transform = exit > 0 ? `translateY(${-exit * 26}px)` : "";

    if (c.timeDriven || c.cur !== c.last) {
      // stato grafico deterministico a ogni frame + update protetto:
      // una scena in errore non ferma le altre
      if (c.ctx) {
        c.ctx.globalAlpha = 1;
        c.ctx.globalCompositeOperation = "source-over";
        c.ctx.setLineDash([]);
        c.ctx.shadowBlur = 0;
        c.ctx.textAlign = "left";
      }
      try {
        c.update(c.cur, time);
      } catch (e) {
        if (!c.err) { console.error(`[scene #${c.el.id}]`, e); c.err = true; }
        c.errMsg = e && e.message;
      }
      c.last = c.cur;
    }
  }
  if (dbgEl) dbgEl.textContent = dbg.join("\n");
  if (dblCtx) try { debugLayout(); } catch (e) { /* diagnostica, mai fatale */ }
}
requestAnimationFrame(loop);
})();
