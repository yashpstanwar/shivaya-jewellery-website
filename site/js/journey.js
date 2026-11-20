(() => {
  "use strict";
  const C = window.CALLA || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (v, a, b) => clamp((v - a) / (b - a));
  const io = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const out = (t) => 1 - Math.pow(1 - t, 3);
  const json = (s) => {
    try {
      return JSON.parse(s || "{}");
    } catch {
      return {};
    }
  };
  const hdr = $("#hdr"), stage = $(".stage"), pin = $(".stage__pin"), video = $(".stage__video"), white = $(".stage__white");
  const heroBits = $$(".hero-copy, .scroll-cue, .film-toggle");
  const chaps = $$(".chap"), finale = $(".finale"), fpin = $(".finale__pin"), box = $(".box"), bcv = $(".box__cv"), glint = $(".box__glint"), ftxt = $(".finale__txt");
  const actor = $(".actor"), acv = $(".actor__cv"), apng = $(".actor__png"), ashadow = $(".actor__shadow");
  const actx = acv.getContext("2d"), bctx = bcv.getContext("2d");
  if (video.dataset.hd && innerWidth >= 760 && innerWidth * (window.devicePixelRatio || 1) >= 2200) {
    const t = video.currentTime;
    video.src = video.dataset.hd;
    video.currentTime = t;
    video.play().catch(() => {
    });
  }
  actx.imageSmoothingQuality = bctx.imageSmoothingQuality = "high";
  const AG = Object.assign({ h2v: { d: 0.58, cx: 0.5, cy: 0.5 }, parts: { d: 0.3, cx: 0.5, cy: 0.7, h: 0.4, items: {} } }, json(actor.dataset.geo));
  const BG = Object.assign({ sub: [0.1, 0.24, 0.8], ring: [0.5, 0.18, 0.22], seat: [0.5, 0.66] }, json(finale.dataset.geo));
  const HAND = 0.27;
  class Seq {
    constructor(pattern, n) {
      this.pattern = pattern;
      this.n = n || 0;
      this.imgs = new Array(this.n);
      this.started = false;
    }
    load() {
      if (this.started || !this.n) return;
      this.started = true;
      for (let i = 0; i < this.n; i++) {
        const im = new Image();
        im.onload = () => {
          this.imgs[i] = im;
        };
        im.src = this.pattern.replace("#", String(i).padStart(3, "0"));
      }
    }
    at(t) {
      if (!this.n) return null;
      const i = Math.round(clamp(t) * (this.n - 1));
      for (let d = 0; d < this.n; d++) {
        if (this.imgs[i - d]) return this.imgs[i - d];
        if (this.imgs[i + d]) return this.imgs[i + d];
      }
      return null;
    }
  }
  const S = {
    h2v: new Seq("assets/turn/h2v-#.webp", +actor.dataset.h2v),
    parts: new Seq("assets/turn/parts-#.webp", +actor.dataset.parts),
    open: new Seq("assets/box/open-#.webp", +finale.dataset.open),
    drop: new Seq("assets/box/drop-#.webp", +finale.dataset.drop),
    close: new Seq("assets/box/close-#.webp", +finale.dataset.close)
  };
  let lastA = null, lastB = null;
  function drawActor(name, t) {
    const im = S[name].at(t);
    if (!im || im === lastA) return;
    lastA = im;
    actx.drawImage(im, 0, 0, acv.width, acv.height);
  }
  function drawBox(p) {
    const W = bcv.width;
    let im, sub = null;
    if (p < HAND) {
      im = S.open.at(seg(p, 0.04, 0.22));
      sub = BG.sub;
    } else if (p < 0.53) im = S.drop.at(seg(p, HAND + 0.01, 0.5));
    else im = S.close.at(seg(p, 0.56, 0.8));
    if (!im || im === lastB) return;
    lastB = im;
    if (sub) {
      bctx.fillStyle = "#fff";
      bctx.fillRect(0, 0, W, W);
      bctx.drawImage(im, sub[0] * W, sub[1] * W, sub[2] * W, sub[2] * W);
    } else bctx.drawImage(im, 0, 0, W, W);
  }
  let L = null;
  const leaders = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  leaders.setAttribute("class", "leaders");
  leaders.setAttribute("aria-hidden", "true");
  document.body.appendChild(leaders);
  function layout() {
    const vw = pin.clientWidth, vh = pin.clientHeight, sy = window.scrollY;
    if (!vw || !vh) return;
    const mobile = matchMedia("(max-width:760px)").matches;
    const topOf = (el) => el.getBoundingClientRect().top + sy;
    const rel = (el, host) => {
      const a = el.getBoundingClientRect(), b2 = host.getBoundingClientRect();
      return { l: a.left - b2.left, t: a.top - b2.top, w: a.width, h: a.height };
    };
    const ch = chaps.map((el) => {
      const sl = $(".slot", el), r = rel(sl, $(".chap__pin", el));
      return { el, name: sl.dataset.slot, top: topOf(el), end: topOf(el) + el.offsetHeight - vh, slot: { x: r.l + r.w / 2, y: r.t + r.h / 2, w: r.w } };
    });
    const pc = ch.find((c) => c.name === "parts"), g = AG.parts;
    if (pc) {
      const side2 = Math.min(vh * (mobile ? 0.62 : 0.9), vw * (mobile ? 1.6 : 0.52)), top = mobile ? vh * 0.2 : (vh - side2) / 2 + 26, x0 = pc.slot.x;
      pc.slot = { x: x0, y: top + g.cy * side2, w: side2 * g.d };
      $$(".part", pc.el).forEach((li) => {
        const it = (g.items || {})[li.dataset.part];
        if (!it) return;
        const gap = mobile ? 14 : Math.max(40, vw * 0.035), edge = x0 + it[1] * side2;
        li.style.top = top + it[0] * side2 + "px";
        li.style.left = edge + gap + "px";
        li.style.setProperty("--ln", gap - 22 + "px");
      });
    }
    box.style.transform = "";
    const b = rel(box, fpin);
    const hover = { x: b.l + BG.ring[0] * b.w, y: b.t + BG.ring[1] * b.w, w: BG.ring[2] * b.w * g.d / g.h };
    const seat = { x: b.l + BG.seat[0] * b.w, y: b.t + BG.seat[1] * b.w };
    const big = Math.min(vw * (mobile ? 0.86 : 0.6), vh * 1.05, 980), side = big / AG.h2v.d;
    actor.style.width = actor.style.height = side + "px";
    const F = topOf(finale);
    L = { vw, vh, big, side, mobile, st: stage.offsetTop, sEnd: stage.offsetTop + stage.offsetHeight - vh, ch, F, Fend: F + finale.offsetHeight - vh, hover, seat };
    const m = ch[0].slot, mh = m.w / 1.84;
    let d = "", dots = "";
    $$(".note", chaps[0]).forEach((n) => {
      const h3 = $("h3", n), left = n.classList.contains("note--l"), y0 = n.offsetTop + h3.offsetTop + h3.offsetHeight / 2;
      const x0 = left ? n.offsetLeft + n.offsetWidth + 16 : n.offsetLeft - 16;
      const tx = m.x - m.w / 2 + +n.dataset.tx * m.w, ty = m.y - mh / 2 + +n.dataset.ty * mh, dy = Math.abs(ty - y0);
      const ex = left ? Math.max(x0 + 12, tx - dy) : Math.min(x0 - 12, tx + dy);
      const pd = `M${x0.toFixed(1)} ${y0.toFixed(1)}H${ex.toFixed(1)}L${tx.toFixed(1)} ${ty.toFixed(1)}`;
      d += `<path class="halo" pathLength="1" d="${pd}"/><path pathLength="1" d="${pd}"/>`;
      dots += `<circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="4"/>`;
    });
    leaders.setAttribute("viewBox", `0 0 ${vw} ${vh}`);
    leaders.innerHTML = d + dots;
    lastB = null;
  }
  let userPaused = false;
  function update() {
    if (!L) return;
    const s = window.scrollY, { vw, vh } = L, [c0, c1, c2, c3] = L.ch;
    const P = seg(s, L.st, L.sEnd), hero = 1 - seg(P, 0, 0.1);
    heroBits.forEach((e) => {
      e.style.opacity = hero;
      e.style.visibility = hero > 0 ? "visible" : "hidden";
    });
    heroBits[0].style.transform = `translateY(${-36 * (1 - hero)}px)`;
    video.style.transform = `scale(${1 + 0.14 * seg(P, 0, 0.5)})`;
    white.style.opacity = io(seg(P, 0.08, 0.36));
    hdr.classList.toggle("is-ink", P > 0.2);
    if (P > 0.45 && !video.paused) video.pause();
    else if (P <= 0.45 && video.paused && !userPaused) video.play().catch(() => {
    });
    let x = vw / 2, y = vh * 0.52, w = L.big, q = "h2v", t = 0, a = 0;
    const hold = (c, seq, tt) => {
      ({ x, y, w } = c.slot);
      q = seq;
      t = tt;
      a = 1;
    };
    const travel = (A, B, seq, ta, tb, s0, s1, rise = 0.07, order = 0) => {
      const u = seg(s, s0, s1);
      const e = io(order > 0 ? seg(u, 0, 0.62) : order < 0 ? seg(u, 0.38, 1) : u);
      const f = io(order > 0 ? seg(u, 0.32, 1) : order < 0 ? seg(u, 0, 0.68) : u);
      x = lerp(A.x, B.x, e);
      y = lerp(A.y, B.y, e) - Math.sin(Math.PI * u) * vh * rise;
      w = lerp(A.w, B.w, e);
      q = seq;
      t = lerp(ta, tb, f);
      a = 1;
    };
    const p = seg(s, L.F, L.Fend);
    if (s < L.sEnd) {
      a = seg(P, 0.36, 0.52);
      w = L.big * lerp(1.4, 1, out(seg(P, 0.36, 0.78)));
    } else if (s < c0.top) travel({ x: vw / 2, y: vh * 0.52, w: L.big }, c0.slot, "h2v", 0, 0, L.sEnd, c0.top);
    else if (s < c0.end) hold(c0, "h2v", 0);
    else if (s < c1.top) travel(c0.slot, c1.slot, "h2v", 0, 1, c0.end, c1.top);
    else if (s < c1.end) hold(c1, "h2v", 1);
    else if (s < c2.top) travel(c1.slot, c2.slot, "parts", 0, 1, c1.end, c2.top, 0, 1);
    else if (s < c2.end) hold(c2, "parts", 1);
    else if (s < c3.top) travel(c2.slot, c3.slot, "parts", 1, 0, c2.end, c3.top, 0, -1);
    else if (s < c3.end) hold(c3, "parts", 0);
    else if (s < L.F) travel(c3.slot, L.hover, "parts", 0, 0, c3.end, L.F);
    else if (p < HAND) {
      ({ x, y, w } = L.hover);
      q = "parts";
      a = 1;
      y += Math.sin(performance.now() / 700) * 4 * (1 - seg(p, 0.14, 0.22));
    }
    const vis = a > 1e-3;
    actor.style.visibility = vis ? "visible" : "hidden";
    if (vis) {
      const g = AG[q], side = w / g.d;
      actor.style.transform = `translate3d(${x - g.cx * side}px,${y - g.cy * side}px,0) scale(${side / L.side})`;
      actor.style.opacity = a;
      const flat = q === "h2v" ? 1 - seg(t, 0.02, 0.05) : 0, seqA = q === "h2v" ? seg(t, 4e-3, 0.03) : 1;
      acv.style.opacity = seqA;
      apng.style.opacity = flat;
      ashadow.style.opacity = q === "h2v" ? 1 - seg(t, 0, 0.2) : 0;
      actor.classList.toggle("is-seq", seqA > 0);
      if (seqA > 0) drawActor(q, t);
    }
    L.ch.forEach((c) => {
      const m = c.name === "parts" ? -0.01 : 0.25;
      c.el.classList.toggle("is-on", s > c.top - vh * m && s < c.end + vh * m);
    });
    leaders.classList.toggle("is-on", s >= c0.top - 2 && s <= c0.end + 2);
    if (s > c3.top) {
      drawBox(p);
      const o = io(seg(p, 0.83, 0.96)), gl = Math.sin(Math.PI * seg(p, 0.5, 0.57));
      box.style.transform = L.mobile ? `translate(-50%,-50%) translateY(${-0.05 * vh * o}px)` : `translate(-50%,-50%) translateX(${-0.19 * vw * o}px)`;
      const fa = seg(p, 0.87, 0.97);
      ftxt.style.opacity = fa;
      ftxt.style.visibility = fa > 0 ? "visible" : "hidden";
      glint.style.opacity = gl;
      glint.style.transform = `translate(${L.seat.x}px,${L.seat.y}px) scale(${0.3 + 0.7 * gl}) rotate(${gl * 70}deg)`;
    }
  }
  $(".film-toggle").addEventListener("click", (e) => {
    userPaused = !video.paused;
    userPaused ? video.pause() : video.play().catch(() => {
    });
    e.currentTarget.setAttribute("aria-pressed", userPaused);
    e.currentTarget.setAttribute("aria-label", userPaused ? "Play film" : "Pause film");
  });
  $(".scroll-cue").addEventListener("click", (e) => {
    e.preventDefault();
    if (L && C.scrollToEl) C.scrollToEl(L.ch[0].top, { duration: 3.2, easing: (t) => t });
  });
  const METALS = C.METALS || [["Yellow gold", "#d9b56a"], ["White gold", "#dcdcdc"], ["Rose gold", "#dfa992"]], KEYS = ["yellow", "white", "rose"];
  const cfg = { metal: 0, size: "12" };
  $('[data-flora="metals"]').innerHTML = METALS.map(([m, c], i) => `<button type="button" data-fm="${i}" aria-pressed="${i === 0}"><i style="background:${c}"></i>${m}</button>`).join("");
  $('[data-flora="sizes"]').innerHTML = ["8", "10", "12", "14", "16", "18"].map((z) => `<button type="button" data-fs="${z}" aria-pressed="${z === cfg.size}">${z}</button>`).join("");
  document.addEventListener("click", (e) => {
    const m = e.target.closest("[data-fm]"), z = e.target.closest("[data-fs]");
    if (m) {
      cfg.metal = +m.dataset.fm;
      document.documentElement.dataset.metal = KEYS[cfg.metal];
      $$("[data-fm]").forEach((b) => b.setAttribute("aria-pressed", b === m));
    } else if (z) {
      cfg.size = z.dataset.fs;
      $$("[data-fs]").forEach((b) => b.setAttribute("aria-pressed", b === z));
    } else if (e.target.closest('[data-flora="add"]') && C.addToBag) C.addToBag("flora-ring", METALS[cfg.metal][0], cfg.size);
  });
  let rz;
  addEventListener("resize", () => {
    clearTimeout(rz);
    rz = setTimeout(layout, 120);
  });
  addEventListener("load", () => {
    layout();
    Object.values(S).forEach((q) => q.load());
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  layout();
  S.h2v.load();
  if (window.scrollY > innerHeight * 2) Object.values(S).forEach((q) => q.load());
  window.gsap ? gsap.ticker.add(update) : function loop() {
    update();
    requestAnimationFrame(loop);
  }();
})();
