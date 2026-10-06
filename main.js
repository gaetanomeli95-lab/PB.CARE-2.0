/* PB-CARe · Selective cinema with real, accessible content. */
(() => {
const media = matchMedia('(prefers-reduced-motion: reduce)');
const query = new URLSearchParams(location.search);
let savedPreference = null;
try { savedPreference = sessionStorage.getItem('pbcare-motion'); } catch (_) {}
let reduce = query.get('motion') === 'reduce' || media.matches || savedPreference === 'reduce';
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
    const capW = Math.min(560, W * .44), capL = W * .74 - capW / 2;
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

    const metadataOpacity = mobile ? 1 - smooth(seg(p, .88, .94)) : 1;
    stage.querySelector(".codeMeta").style.opacity = metadataOpacity;
    stage.querySelector(".noIdentity").style.opacity = metadataOpacity;
    const st = smooth(seg(p, .90, .97));
    statement.style.opacity = st;
    statement.style.transform = `translateY(${lerp(24, 0, st)}px)`;
  }
  return { resize, update };
}


/* Persistent hero: light channels converge; no scroll required for content. */
function initHero(stage, ctx) {
 let W=0,H=0;
 function resize(){W=stage.clientWidth;H=stage.clientHeight;const d=Math.min(1.5,devicePixelRatio||1);ctx.canvas.width=W*d;ctx.canvas.height=H*d;ctx.setTransform(d,0,0,d,0,0);}
 function update(p,time){ctx.clearRect(0,0,W,H);const mobile=W<=800,cx=W*(mobile?.86:.74),cy=H*.55;
  const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,H*.48);glow.addColorStop(0,'#277b8930');glow.addColorStop(1,'#277b8900');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
  for(let i=0;i<4;i++){const y=H*(.3+i*.15);const end=mobile?W*.65:W*.68;const start=W*1.04;ctx.beginPath();ctx.moveTo(start,y);ctx.bezierCurveTo(W*.8,y,W*.85,cy,end,cy);ctx.lineWidth=i===2?1.4:.65;ctx.strokeStyle=i===2?'#8ed2cd80':'#799fba36';ctx.stroke();
   const t=(time*.00006+i*.23)%1;const u=1-t;const x=u*u*u*start+3*u*u*t*W*.8+3*u*t*t*W*.85+t*t*t*end;const yy=u*u*u*y+3*u*u*t*y+3*u*t*t*cy+t*t*t*cy;ctx.fillStyle=i===2?'#e9c77f':'#97d5d1';ctx.beginPath();ctx.arc(x,yy,i===2?2.5:1.3,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle='#e3c1818c';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx,cy-55);ctx.lineTo(cx,cy+55);ctx.stroke();
 }
 return {resize,update};
}
/* FarmaCOmm accumulates lines into an observation field; no cohort linkage. */
function initKnowledge(stage,ctx){let W=0,H=0;function resize(){W=stage.clientWidth;H=stage.clientHeight;const d=Math.min(1.5,devicePixelRatio||1);ctx.canvas.width=W*d;ctx.canvas.height=H*d;ctx.setTransform(d,0,0,d,0,0);}
 function update(p,time){ctx.clearRect(0,0,W,H);const m=W<=800;const x0=W*(m?.08:.57),x1=W*.93,y0=H*(m?.72:.26),hh=H*(m?.12:.4);const fold=smooth(seg(p,.12,.9));
  for(let i=0;i<14;i++){const yy=y0+hh*i/13;const bend=Math.sin(i*.7)*hh*.1*(1-fold);ctx.beginPath();ctx.moveTo(x0,yy);for(let j=0;j<=36;j++){const u=j/36;const signal=Math.sin(u*17+i*2)*Math.cos(u*9-i)*(.9+Math.sin(time*.0002+i)*.1);const y=yy+signal*(m?10:21)*(1-fold*.7)+bend*Math.sin(u*Math.PI);ctx.lineTo(lerp(x0,x1,u),y);}ctx.strokeStyle=`rgba(108,198,221,${.17+i*.013})`;ctx.lineWidth=i%4===0?1.3:.65;ctx.stroke();}
  const tx=lerp(x0,x1,.32+fold*.5);ctx.strokeStyle='#e1c18580';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(tx,y0-22);ctx.lineTo(tx,y0+hh+22);ctx.stroke();for(let i=0;i<6;i++){const yy=y0+hh*(.12+i*.15);ctx.fillStyle=`rgba(174,233,226,${.15+fold*.65})`;ctx.fillRect(tx-2,yy-2,4,4);}
 }
 return {resize,update};}
/* Enzima cycles between R&D phases, independently of the clinical illustration. */
function initResearch(stage,ctx){let W=0,H=0;const names=['Osservazione','Ricerca','Progetto','Applicazione','Impatto / feedback'];const word=stage.querySelector('.research-word'),steps=[...stage.querySelectorAll('.research-cycle li')];
 function resize(){W=stage.clientWidth;H=stage.clientHeight;const d=Math.min(1.5,devicePixelRatio||1);ctx.canvas.width=W*d;ctx.canvas.height=H*d;ctx.setTransform(d,0,0,d,0,0);}
 function update(p,time){ctx.clearRect(0,0,W,H);const m=W<=800,cx=W*(m?.48:.75),cy=H*(m?.81:.46),r=Math.min(W*(m?.2:.18),H*(m?.065:.22));const phase=Math.min(4,Math.floor(p*5));word.textContent=names[phase];steps.forEach((e,i)=>e.classList.toggle('current',i===phase));
  ctx.strokeStyle='#89cec333';ctx.lineWidth=.7;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2-Math.PI/2;const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;ctx.beginPath();ctx.arc(x,y,i===phase?6:3,0,Math.PI*2);ctx.fillStyle=i===phase?'#edc56d':'#83cfc2';ctx.fill();const a2=(i+1)/5*Math.PI*2-Math.PI/2;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(cx+Math.cos(a+.5)*r*1.3,cy+Math.sin(a+.5)*r*1.3,cx+Math.cos(a2)*r,cy+Math.sin(a2)*r);ctx.strokeStyle=i===phase?'#add6cba8':'#6ba99e24';ctx.stroke();}
  const a=(p*Math.PI*2)-Math.PI/2;ctx.beginPath();ctx.arc(cx,cy,r*.72,a-.24,a+.24);ctx.strokeStyle='#c6e4d6';ctx.lineWidth=1.5;ctx.stroke();
 }
 return {resize,update};}

const nav=document.querySelector('.topnav'),menu=document.querySelector('.menu-toggle'),motionButton=document.querySelector('.motion-toggle');
let lenis=null;
function closeMenu(){nav.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');menu.querySelector('span').textContent='+';}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.classList.toggle('menu-open',open);menu.setAttribute('aria-expanded',String(open));menu.querySelector('span').textContent=open?'−':'+';});
addEventListener('keydown',e=>{if(e.key==='Escape' && nav.classList.contains('menu-open')){closeMenu();menu.focus();}});
addEventListener('resize',()=>{if(innerWidth>800)closeMenu();});
function applyMotion(){document.body.classList.toggle('reduced-motion',reduce);motionButton.setAttribute('aria-pressed',String(reduce));motionButton.textContent=reduce?'Movimento ridotto':'Riduci movimento';if(lenis){lenis.destroy();lenis=null;}if(!reduce && typeof Lenis!=='undefined'){lenis=new Lenis({lerp:.12,smoothWheel:true,stopInertiaOnNavigate:true});}controllers.forEach(c=>{c.resize();c.last=-1;});schedule();}
motionButton.addEventListener('click',()=>{reduce=!reduce;try{sessionStorage.setItem('pbcare-motion',reduce?'reduce':'full');}catch(_){}applyMotion();});
media.addEventListener('change',e=>{reduce=e.matches;applyMotion();});
const connection=document.querySelector('.connection-demo'),status=document.querySelector('.connection-status');
document.querySelectorAll('[data-connection]').forEach(b=>b.addEventListener('click',()=>{const state=b.dataset.connection;connection.dataset.state=state;status.textContent=state==='revoked'?'La connessione è revocata. La segreteria non può ripristinarla arbitrariamente.':'La connessione è autorizzata dalla persona.';document.querySelectorAll('[data-connection]').forEach(e=>e.setAttribute('aria-pressed',String(e===b)));}));
/* Links stay native without JS. With JS, anchors also transfer keyboard focus. */
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href');const target=document.querySelector(id);if(!target)return;e.preventDefault();closeMenu();history.pushState(null,'',id);if(!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');target.focus({preventScroll:true});const offset=target.classList.contains('scene')?0:-nav.offsetHeight;const y=target.getBoundingClientRect().top+scrollY+offset;lenis?lenis.scrollTo(y,{immediate:true}):scrollTo({top:y,behavior:'instant'});schedule();}));
const controllers=[{el:document.querySelector('.hero'),stage:document.querySelector('.hero'),init:initHero},...[...document.querySelectorAll('.scene')].map(el=>({el,stage:el.querySelector('.stage'),init:({sep:initSep,knowledge:initKnowledge,research:initResearch})[el.dataset.scene]}))].map(c=>{const ctx=c.stage.querySelector('canvas').getContext('2d');return {...c,ctx,...c.init(c.stage,ctx),visible:false,last:-1};});
const activeSections=[...document.querySelectorAll('#pbcare,#per-chi,#sep,#ecosistema,#research,#end')];
const camit=document.getElementById('camit'),events=document.getElementById('eventi');
let pending=0,lastTime=0;
function schedule(){if(!pending && !document.hidden)pending=requestAnimationFrame(frame);}
function frame(time){pending=0;if(document.hidden)return;if(time-lastTime<32){schedule();return;}lastTime=time;if(lenis)lenis.raf(time);
 const max=document.documentElement.scrollHeight-innerHeight;document.querySelector('#gp').style.setProperty('--gp',max>0?clamp(scrollY/max):0);
 let current=null;for(const s of activeSections)if(s.getBoundingClientRect().top<=innerHeight*.45)current=s.id;
 nav.querySelectorAll('nav a').forEach(a=>{if(a.hash==='#'+current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
 if(!reduce){for(const c of controllers){if(!c.visible)continue;const rect=c.el.getBoundingClientRect(),span=rect.height-innerHeight,p=span>1?clamp(-rect.top/span):0;c.stage.style.setProperty('--progress',p);const tag=c.stage.querySelector('.tag .pb');if(tag)tag.style.setProperty('--p',p);c.ctx.globalAlpha=1;c.ctx.globalCompositeOperation='source-over';c.ctx.setLineDash([]);c.ctx.shadowBlur=0;c.update(p,time);c.last=p;}
 for(const [el,prop] of [[camit,'--route-progress'],[events,'--aperture']]){const r=el.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)el.style.setProperty(prop,clamp((innerHeight-r.top)/(innerHeight+r.height)));}}
 if(!reduce&&(controllers.some(c=>c.visible)||lenis?.isScrolling))schedule();
}
const observer=new IntersectionObserver(entries=>{for(const entry of entries){const c=controllers.find(c=>c.el===entry.target);if(c)c.visible=entry.isIntersecting;}schedule();},{rootMargin:'0px'});controllers.forEach(c=>observer.observe(c.el));
let resizeFrame=0;addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{controllers.forEach(c=>{c.resize();c.last=-1;});schedule();});});
// Lenis intercepts wheel input before native scroll. Wake the renderer even
// in editorial sections, where the animation loop deliberately rests.
addEventListener('wheel',schedule,{passive:true});
addEventListener('scroll',schedule,{passive:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
applyMotion();
/* Reproducible scene QA; never needed by the public user journey. */
const snap=query.get('snap')?.match(/^([\w-]+):([\d.]+)$/);if(snap){const el=document.getElementById(snap[1]);if(el){const jump=()=>{const y=el.getBoundingClientRect().top+scrollY+Math.max(0,el.offsetHeight-innerHeight)*clamp(+snap[2]);lenis?lenis.scrollTo(y,{immediate:true}):scrollTo(0,y);schedule();};jump();document.fonts.ready.then(jump);}}
})();
