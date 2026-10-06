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

/* ---------- scena 01 · tracce temporali ---------- */

function initS1(stage, ctx) {
  let W = 0, H = 0, parts = [], grain = null;
  const intro = stage.querySelector(".intro"), cap = stage.querySelector("[data-cap]");

  function resize() {
    W = stage.clientWidth; H = stage.clientHeight;
    const DPR = Math.min(1.5, devicePixelRatio || 1);
    const c = stage.querySelector("canvas");
    c.width = W * DPR; c.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    grain = makeGrain(ctx);

    // il sistema che prende forma:
    // 78% particelle → anello (membrana), 12% → nucleo, 10% restano libere
    parts = [];
    const mob = W < 760;
    const cx = mob ? W * .5 : W * .70, cy = mob ? H * .62 : H * .52;
    const R = Math.min(W, H) * (mob ? .30 : .26);
    const N = mob ? 110 : 180;
    for (let i = 0; i < N; i++) {
      const kind = i < N * .78 ? 0 : (i < N * .90 ? 1 : 2);
      let tx, ty;
      if (kind === 0) {
        const a = (i / (N * .78)) * Math.PI * 2;
        const rr = R * (1 + (rnd(i * 3.1) - .5) * .10);
        tx = cx + Math.cos(a) * rr;
        ty = cy + Math.sin(a) * rr * .92;
      } else if (kind === 1) {
        const a = rnd(i * 4.7) * Math.PI * 2, rr = rnd(i * 6.3) * R * .22;
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
    const mob = W < 760;
    const cx = mob ? W * .5 : W * .70, cy = mob ? H * .62 : H * .52;
    const R = Math.min(W, H) * (mob ? .30 : .26);

    // posizioni attuali
    const pos = [];
    for (const pt of parts) {
      const m = smoother(seg(p, .10 + pt.dly * .5, .55 + pt.dly * .5));
      const wob = 1 - m;
      pos.push({
        x: lerp(pt.sx + pt.wx * Math.sin(t * .0005 + pt.ph), pt.tx, m),
        y: lerp(pt.sy + pt.wy * Math.cos(t * .0004 + pt.ph), pt.ty, m),
        m, pt,
      });
    }

    // membrana: linee tra vicini dell'anello, solo una volta formata
    const ring = pos.filter(q => q.pt.kind === 0);
    const linkA = smooth(seg(p, .45, .70));
    if (linkA > 0) {
      ctx.lineWidth = 1;
      for (let i = 0; i < ring.length; i++) {
        const a = ring[i], b = ring[(i + 1) % ring.length];
        ctx.strokeStyle = `rgba(${MINT},${.30 * linkA * a.m})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }

    // particelle
    for (const q of pos) {
      const col = q.pt.kind === 1 ? GOLD : (q.pt.kind === 2 ? `159,216,201` : MINT);
      const a = q.pt.kind === 2 ? .18 : lerp(.35, .85, q.m);
      ctx.fillStyle = `rgba(${col},${a})`;
      ctx.beginPath(); ctx.arc(q.x, q.y, q.pt.r, 0, Math.PI * 2); ctx.fill();
    }

    // nucleo: respiro oro quando il sistema è formato
    const core = smooth(seg(p, .55, .75));
    if (core > 0) {
      const pulse = 1 + .08 * Math.sin(t * .0015);
      const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * .22 * pulse);
      rg.addColorStop(0, `rgba(${GOLD},${.30 * core})`);
      rg.addColorStop(1, `rgba(${GOLD},0)`);
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(cx, cy, R * .22 * pulse, 0, Math.PI * 2); ctx.fill();
    }

    // impulso vitale: orbita la membrana una volta formata
    const life = smooth(seg(p, .68, .80));
    if (life > 0 && !reduce) {
      const a = t * .0009;
      const lx = cx + Math.cos(a) * R, ly = cy + Math.sin(a) * R * .92;
      const rg = ctx.createRadialGradient(lx, ly, 0, lx, ly, 26);
      rg.addColorStop(0, `rgba(${GOLD},${.8 * life})`); rg.addColorStop(1, `rgba(${GOLD},0)`);
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(lx, ly, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,249,220,${life})`;
      ctx.beginPath(); ctx.arc(lx, ly, 2.6, 0, Math.PI * 2); ctx.fill();
    }

    ctx.globalAlpha = .045; ctx.fillStyle = grain; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;

    // DOM
    intro.style.opacity = 1 - seg(p, .60, .82);
    intro.style.transform = `translateY(${-26 * seg(p, .55, .85)}px)`;
    cap.style.opacity = seg(p, .76, .88);
  }
  return { resize, update };
}

/* ---------- scena 02 · costellazione dell'ecosistema ---------- */

function initS2(stage, ctx) {
  let W = 0, H = 0, dust = [], grain = null;
  const cap = stage.querySelector("[data-cap]");

  /* manifest e costellazione nascono dalla source of truth
     (data/ecosystem.js) — mai duplicare entità/colori qui */
  const ECO = window.PBCARE_ECOSYSTEM || { CONSTELLATION: [], FOOTER_LINKS: [] };
  const satsEl = stage.querySelector("#sats");
  const rows = ECO.CONSTELLATION.map(e => {
    const a = document.createElement("a");
    a.className = "sat";
    a.dataset.entity = e.id;
    a.dataset.status = e.status;
    const href = e.constellation.anchor || e.currentUrl || "#";
    a.href = href;
    if (!href.startsWith("#")) { a.target = "_blank"; a.rel = "noopener"; }
    a.style.setProperty("--sat-accent", e.palette.accent);
    a.style.setProperty("--sat-accent-rgb", e.palette.rgbAccent);
    const dot = document.createElement("span"); dot.className = "sdot";
    const nm = document.createElement("span"); nm.className = "sname"; nm.textContent = e.name;
    const mt = document.createElement("span"); mt.className = "smeta"; mt.textContent = e.constellation.meta;
    a.append(dot, nm, mt);
    satsEl.appendChild(a);
    return a;
  });

  // angoli in gradi attorno all'hub, nell'ordine del manifest
  const SATS = ECO.CONSTELLATION.map(e => ({
    a: e.constellation.angle, c: e.palette.rgbAccent, name: e.name,
  }));
  const startOf = i => .12 + i * .085; // soglia di attivazione

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
  }

  function hub() {
    const mob = W < 760;
    return mob
      ? { x: W * .5, y: H * .77, rx: W * .36, ry: H * .14 }
      : { x: W * .71, y: H * .52, rx: W * .245, ry: H * .34 };
  }
  const satPos = (s, h) => {
    const a = s.a * Math.PI / 180;
    return { x: h.x + Math.cos(a) * h.rx, y: h.y + Math.sin(a) * h.ry };
  };

  function update(p, time) {
    ctx.clearRect(0, 0, W, H);
    const h = hub();
    const t = reduce ? 0 : time;

    // pulviscolo
    for (let i = 0; i < dust.length; i++) {
      const d = dust[i];
      const tw = .4 + .3 * Math.sin(t * .0009 + d.ph);
      ctx.fillStyle = `rgba(${MINT},${.10 + .12 * tw})`;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
    }

    // orbita
    ctx.strokeStyle = `rgba(${MINT},.08)`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(h.x, h.y, h.rx, h.ry, 0, 0, Math.PI * 2); ctx.stroke();

    // hub
    const hubIn = smooth(seg(p, .02, .10));
    if (hubIn > 0) {
      const pulse = 1 + .10 * Math.sin(t * .0016);
      const rg = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, 46 * pulse);
      rg.addColorStop(0, `rgba(${GOLD},${.85 * hubIn})`);
      rg.addColorStop(.3, `rgba(${GOLD},${.30 * hubIn})`);
      rg.addColorStop(1, `rgba(${GOLD},0)`);
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(h.x, h.y, 46 * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff9dc";
      ctx.beginPath(); ctx.arc(h.x, h.y, 4.4 * hubIn, 0, Math.PI * 2); ctx.fill();
      ctx.font = "11px 'DM Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = `rgba(236,244,239,${.9 * hubIn})`;
      ctx.fillText("PB-CARe", h.x, h.y + 26);
    }

    // satelliti
    ctx.textAlign = "left";
    for (let i = 0; i < SATS.length; i++) {
      const s = SATS[i], pos = satPos(s, h);
      const on = smoother(seg(p, startOf(i), startOf(i) + .10));
      if (on <= 0) continue;

      // linea hub → satellite, disegnata progressivamente
      const midx = (h.x + pos.x) / 2, midy = (h.y + pos.y) / 2 - H * .04;
      const steps = 26, n = Math.max(2, Math.round(steps * on));
      ctx.strokeStyle = `rgba(${s.c},${.5 * on})`;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (let k = 0; k <= n; k++) {
        const u = k / steps;
        const x = lerp(lerp(h.x, midx, u), lerp(midx, pos.x, u), u);
        const y = lerp(lerp(h.y, midy, u), lerp(midy, pos.y, u), u);
        k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // nodo con overshoot
      const pop = on * (1.18 - .18 * on);
      const rg = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 26);
      rg.addColorStop(0, `rgba(${s.c},${.55 * on})`); rg.addColorStop(1, `rgba(${s.c},0)`);
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(pos.x, pos.y, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(${s.c},${.95 * on})`;
      ctx.beginPath(); ctx.arc(pos.x, pos.y, 3.4 * pop, 0, Math.PI * 2); ctx.fill();

      // label: solo desktop — su mobile i nomi sono nel manifest DOM
      const la = seg(p, startOf(i) + .05, startOf(i) + .16);
      if (la > 0 && W >= 760) {
        ctx.font = "11px 'DM Mono', monospace";
        ctx.fillStyle = `rgba(236,244,239,${.85 * la})`;
        const off = pos.x > h.x ? 14 : -(ctx.measureText(s.name).width + 14);
        ctx.fillText(s.name, pos.x + off, pos.y - 10);
      }
    }

    ctx.globalAlpha = .045; ctx.fillStyle = grain; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;

    // DOM: manifest si accende in sincrono
    rows.forEach((r, i) => r.classList.toggle("lit", p > startOf(i) + .04));
    cap.style.opacity = seg(p, .86, .95);
  }
  return { resize, update };
}

/* ---------- scena 03 · il diritto che apre la burocrazia ---------- */

function initS3(stage, ctx) {
  let W = 0, H = 0, rows = [], grain = null;
  const quote = stage.querySelector("#quote");
  const cite = stage.querySelector(".quote-cite");
  const services = [...stage.querySelectorAll(".services li")];
  const cap = stage.querySelector("[data-cap]");

  // spezza la citazione in parole
  const KEY = new Set(["diritto", "salute"]);
  const words = quote.textContent.trim().split(/\s+/);
  quote.innerHTML = words.map(w => {
    const clean = w.toLowerCase().replace(/[^a-zàèéìòù]/g, "");
    return `<span class="w${KEY.has(clean) ? " key" : ""}">${w}</span>`;
  }).join(" ");
  const wEls = [...quote.querySelectorAll(".w")];

  function resize() {
    W = stage.clientWidth; H = stage.clientHeight;
    const DPR = Math.min(1.5, devicePixelRatio || 1);
    const c = stage.querySelector("canvas");
    c.width = W * DPR; c.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    grain = makeGrain(ctx);
    rows = [];
    const n = Math.round(H / 26);
    for (let i = 0; i < n; i++) {
      rows.push({
        y: (i + .5) / n,
        w: .52 + rnd(i * 4.3) * .3,
        j: (rnd(i * 8.8) - .5) * .05,   // jitter orizzontale
        a: .05 + rnd(i * 3.3) * .10,
      });
    }
  }

  function update(p, time) {
    ctx.clearRect(0, 0, W, H);

    // la "burocrazia": righe di pseudo-testo che si aprono al centro
    const open = smoother(seg(p, .06, .42));
    const gap = open * W * .30;
    const cx = W * .5;
    for (const r of rows) {
      const w = r.w * W, x0 = cx - w / 2 + r.j * W;
      const mid = x0 + w / 2;
      ctx.fillStyle = `rgba(${MINT},${r.a})`;
      const lw = Math.max(0, w / 2 - gap);
      ctx.fillRect(x0, r.y * H, lw, 1.4);
      ctx.fillRect(mid + gap, r.y * H, lw, 1.4);
    }
    // luce oro che filtra dalla fenditura
    if (open > 0) {
      const rg = ctx.createRadialGradient(cx, H * .42, 0, cx, H * .42, gap * 1.6);
      rg.addColorStop(0, `rgba(${GOLD},${.10 * open})`);
      rg.addColorStop(1, `rgba(${GOLD},0)`);
      ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    }

    ctx.globalAlpha = .045; ctx.fillStyle = grain; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;

    // DOM — parola per parola
    const step = .5 / wEls.length;
    wEls.forEach((el, i) => el.classList.toggle("on", p > .08 + i * step));
    cite.style.opacity = seg(p, .56, .64);
    services.forEach((el, i) => {
      const v = smooth(seg(p, .62 + i * .04, .70 + i * .04));
      el.style.opacity = v;
      el.style.transform = `translateY(${10 * (1 - v)}px)`;
    });
    cap.style.opacity = seg(p, .9, .97);
  }
  return { resize, update };
}

/* ---------- scena 04 · dal caos alle traiettorie ---------- */

function initS4(stage, ctx) {
  let W = 0, H = 0, parts = [], grain = null;
  const specs = [...stage.querySelectorAll(".spec")];
  const cta = stage.querySelector("#endcta");
  const cap = stage.querySelector("[data-cap]");

  function resize() {
    W = stage.clientWidth; H = stage.clientHeight;
    const DPR = Math.min(1.5, devicePixelRatio || 1);
    const c = stage.querySelector("canvas");
    c.width = W * DPR; c.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    grain = makeGrain(ctx);
    parts = [];
    const n = W < 760 ? 120 : 200;
    for (let i = 0; i < n; i++) {
      parts.push({
        sx: rnd(i * 3.7) * W,
        sy: rnd(i * 8.1) * H,
        wx: (rnd(i * 5.5) - .5) * 60,
        wy: (rnd(i * 9.9) - .5) * 60,
        lane: i % 5,
        u: rnd(i * 1.3),
        sp: .6 + rnd(i * 4.4) * .5,
        ph: rnd(i * 6.1) * 6.28,
      });
    }
  }

  // 5 corsie bezier che convergono verso un punto a destra
  // (su mobile compresse nella metà bassa, sotto il testo)
  function lanePoint(lane, u) {
    const mob = W < 760;
    const y0 = H * (mob ? .58 + lane * .07 : .18 + lane * .14);
    const p0 = { x: W * .06, y: y0 + (rnd(lane * 7) - .5) * H * (mob ? .05 : .1) };
    const p1 = { x: W * .42, y: y0 };
    const p2 = { x: W * .62, y: H * (mob ? .60 + lane * .045 : .30 + lane * .08) };
    const p3 = { x: W * (mob ? .85 : .88), y: H * (mob ? .82 : .52) };
    const m = 1 - u;
    return {
      x: m * m * m * p0.x + 3 * m * m * u * p1.x + 3 * m * u * u * p2.x + u * u * u * p3.x,
      y: m * m * m * p0.y + 3 * m * m * u * p1.y + 3 * m * u * u * p2.y + u * u * u * p3.y,
    };
  }

  function update(p, time) {
    ctx.clearRect(0, 0, W, H);
    const t = reduce ? 0 : time;
    const morph = smoother(seg(p, .28, .66));

    // corsie (faint) compaiono col morph
    if (morph > 0) {
      for (let l = 0; l < 5; l++) {
        ctx.strokeStyle = `rgba(${MINT},${.10 * morph})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let k = 0; k <= 40; k++) {
          const pt = lanePoint(l, k / 40);
          k === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }
    }

    // particelle: deriva caotica → traiettorie ordinate
    for (const pt of parts) {
      const wob = Math.sin(t * .001 + pt.ph);
      const cx = pt.sx + pt.wx * Math.sin(t * .0006 + pt.ph);
      const cy = pt.sy + pt.wy * wob;
      const u = (pt.u + t * .00006 * pt.sp) % 1;
      const lp = lanePoint(pt.lane, u);
      const x = lerp(cx, lp.x, morph);
      const y = lerp(cy, lp.y, morph);
      const hot = morph > .7 && u > .85; // teste di corsia → oro
      const col = hot ? GOLD : MINT;
      const alpha = lerp(.28, .75, morph) * (hot ? 1 : .8);
      ctx.fillStyle = `rgba(${col},${alpha})`;
      ctx.beginPath(); ctx.arc(x, y, hot ? 2.1 : 1.4, 0, Math.PI * 2); ctx.fill();
    }

    // nodo d'arrivo
    const end = smooth(seg(p, .7, .85));
    if (end > 0) {
      const mob = W < 760;
      const ex = W * (mob ? .85 : .88), ey = H * (mob ? .82 : .52);
      const rg = ctx.createRadialGradient(ex, ey, 0, ex, ey, 40 * end);
      rg.addColorStop(0, `rgba(${GOLD},${.7 * end})`); rg.addColorStop(1, `rgba(${GOLD},0)`);
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(ex, ey, 40 * end, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff9dc";
      ctx.beginPath(); ctx.arc(ex, ey, 3.6 * end, 0, Math.PI * 2); ctx.fill();
      ctx.font = "10px 'DM Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = `rgba(241,200,71,${.9 * end})`;
      ctx.fillText("impresa", ex, ey + 22);
    }

    ctx.globalAlpha = .045; ctx.fillStyle = grain; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;

    // DOM
    specs.forEach((el, i) => el.classList.toggle("done", p > .30 + i * .10));
    cta.classList.toggle("on", p > .82);
    cap.style.opacity = seg(p, .9, .97);
  }
  return { resize, update };
}

/* ---------- scena 02 · separazione — canvas come le altre ---------- */
/* i visual pesanti (piano carta, seam, apertura, token) sono disegnati:
   un solo blit GPU per frame. Il DOM tiene solo il testo. */

function initSep(stage, ctx) {
  const $ = s => stage.querySelector(s);
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
    // fuori dal corridoio dove transita il nome (difference + oro = blu)
    const lx = W * lerp(.74, .80, split), ly = H * lerp(.50, .58, split);
    const la = .35 + .65 * split;
    g = ctx.createRadialGradient(lx, ly, 0, lx, ly, Math.max(W, H) * .62);
    g.addColorStop(0, `rgba(73,123,93,${.24 * la})`); g.addColorStop(.45, `rgba(41,84,61,${.12 * la})`); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

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

/* ---------- engine ---------- */

const INITS = { s1: initS1, sep: initSep, s2: initS2, s3: initS3, s4: initS4 };
const nav = document.getElementById("topnav");
const gp = document.getElementById("gp");

// smooth scroll alla sorgente: la rotellina diventa flusso continuo,
// le scene seguono 1:1 — niente più "inseguimento" a scatti
let lenis = null;
if (!reduce && typeof Lenis !== "undefined") {
  lenis = new Lenis({
    lerp: .085,
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

const controllers = [...document.querySelectorAll(".scene")].map(el => {
  const stage = el.querySelector(".stage");
  const canvas = stage.querySelector("canvas");
  const ctx = canvas ? canvas.getContext("2d") : null;
  const tag = stage.querySelector(".tag .pb");
  const { resize, update } = INITS[el.dataset.scene](stage, ctx);
  // le scene a canvas hanno animazioni legate al tempo: vanno sempre ridisegnate.
  // le scene DOM reagiscono solo a p: se p non cambia, non si ridisegnano affatto.
  const c = { el, tag, cur: 0, last: -1, resize, update,
              ease: el.dataset.scene === "sep" ? .09 : .115,
              timeDriven: !!canvas };
  c.resize();
  return c;
});

addEventListener("resize", () => controllers.forEach(c => { c.resize(); c.last = -1; }));

function loop(time) {
  if (lenis) lenis.raf(time);

  // progress globale + nav
  const max = document.documentElement.scrollHeight - innerHeight;
  const gp_ = max > 0 ? clamp(scrollY / max) : 0;
  gp.style.setProperty("--gp", gp_);
  nav.classList.toggle("scrolled", scrollY > 30);

  for (const c of controllers) {
    const rect = c.el.getBoundingClientRect();
    if (rect.bottom < -60 || rect.top > innerHeight + 60) continue;
    const span = rect.height - innerHeight;
    const p = clamp(-rect.top / span);
    // con Lenis lo scroll è già smorzato: la scena segue 1:1.
    // senza Lenis, fallback al lerp per-scena.
    c.cur = (lenis || reduce) ? p : c.cur + (p - c.cur) * c.ease;
    c.tag.style.setProperty("--p", c.cur);
    if (c.timeDriven || c.cur !== c.last) {
      c.update(c.cur, time);
      c.last = c.cur;
    }
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
})();
