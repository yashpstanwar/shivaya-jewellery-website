(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const inr = (n) => "₹" + n.toLocaleString("en-IN");
  const HEART = '<svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.600 4.300 4.300 0 0 1 19.500 10c0 5.600-7.500 10-7.500 10Z"/></svg>';
  const P = [
    { id: "petal-ring", name: "Petal Mini Ring", cat: "Rings", price: 38900, img: "assets/p-ring.jpg", white: true, note: "18k yellow gold band with a white enamel inlay and five flush-set diamonds.", tag: "Bestseller" },
    { id: "petal-hoops", name: "Petal Mini Hoops", cat: "Earrings", price: 46200, img: "assets/p-hoops.jpg", white: true, note: "Hollow-formed 18k gold tube hoops — bold to look at, weightless to wear.", tag: "Bestseller" },
    { id: "petal-drops", name: "Petal Mini Drops", cat: "Earrings", price: 54500, img: "assets/p-drops.jpg", white: true, note: "Gold huggies with removable emerald-cut diamond charms.", tag: "Bestseller" },
    { id: "petal-pendant", name: "Petal Mini Pendant", cat: "Necklaces", price: 32800, img: "assets/p-pendant.jpg", white: true, note: "A single bezel-set brilliant on a fine 18k cable chain, 40–45 cm.", tag: "Bestseller" },
    { id: "flora-ring", name: "Flora Halo Ring", cat: "Engagement", price: 285e3, img: "assets/ring.webp", contain: true, note: "A 1.2 ct brilliant in a ten-stone petal halo, on a pavé band of recycled 18k gold. The ring from the film.", tag: "New" },
    { id: "aeon-band", name: "Aeon Eternity Band", cat: "Rings", price: 145e3, img: "assets/c-rings.jpg", note: "Round brilliants in shared claws, all the way around." },
    { id: "dew-drops", name: "Dew Diamond Drops", cat: "Earrings", price: 124e3, img: "assets/c-earrings.jpg", note: "Brilliant studs with pear-cut diamond drops in white gold." },
    { id: "sol-necklace", name: "Sol Solitaire Necklace", cat: "Necklaces", price: 89e3, img: "assets/c-necklaces.jpg", note: "A four-claw solitaire on a whisper-fine white gold chain." },
    { id: "orbit-bracelet", name: "Orbit Satellite Bracelet", cat: "Bracelets", price: 27400, img: "assets/c-bracelets.jpg", note: "White gold satellite chain with hand-polished beads." },
    { id: "vow-bands", name: "Vow Wedding Bands", cat: "Engagement", price: 64e3, img: "assets/c-engagement.jpg", note: "A pair of slim court-profile bands in 18k yellow gold." }
  ];
  const byId = (id) => P.find((p) => p.id === id);
  const METALS = [["Yellow gold", "#d9b56a"], ["White gold", "#dcdcdc"], ["Rose gold", "#dfa992"]];
  const store = { get(k, d) {
    try {
      return JSON.parse(localStorage.getItem("calla:" + k)) ?? d;
    } catch {
      return d;
    }
  }, set(k, v) {
    try {
      localStorage.setItem("calla:" + k, JSON.stringify(v));
    } catch {
    }
  } };
  let bag = store.get("bag", []);
  let wish = store.get("wish", []);
  gsap.registerPlugin(ScrollTrigger);
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1e3));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToEl = (el, o = {}) => lenis ? lenis.scrollTo(el, { duration: 1.4, ...o }) : typeof el === "number" ? window.scrollTo({ top: el, behavior: "smooth" }) : el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  const stage = $(".stage"), hdr = $("#hdr");
  let lastY = 0;
  addEventListener("scroll", () => {
    const y = scrollY, past = y > stage.offsetTop + stage.offsetHeight - 80;
    hdr.classList.toggle("is-solid", past);
    hdr.classList.toggle("is-away", past && y > lastY + 4 && !document.documentElement.classList.contains("lock"));
    if (y < lastY - 4) hdr.classList.remove("is-away");
    lastY = y;
  }, { passive: true });
  const card = (p, i = 0) => `
    <article class="card reveal" data-id="${p.id}" style="--i:${i};--d:${i * 45}ms">
      <div class="card__img" data-quick="${p.id}" tabindex="0" role="button" aria-label="${p.name} — quick view">
        ${p.tag ? `<span class="card__tag">${p.tag}</span>` : ""}
        <img class="rise${p.white ? " mul" : ""}" src="${p.img}" alt="${p.name}" loading="lazy" ${p.contain ? 'style="object-fit:contain;padding:14%"' : ""}>
        <button type="button" class="card__add" data-add="${p.id}">Add to bag</button>
      </div>
      <button type="button" class="heart" data-wish="${p.id}" aria-label="Save ${p.name} to wishlist" aria-pressed="${wish.includes(p.id)}">${HEART}</button>
      <div class="card__cap"><div><b>${p.name}</b><span>${p.cat}</span></div><span class="price">${inr(p.price)}</span></div>
    </article>`;
  const bests = $(".bests__grid");
  if (bests) bests.innerHTML = bests.dataset.products.split(",").map((id, i) => card(byId(id), i)).join("");
  $$("[data-price]").forEach((el) => el.textContent = inr(byId(el.dataset.price).price));
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("in");
      io.unobserve(e.target);
    }
  }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  const watch = (root = document) => $$(".reveal:not(.in)", root).forEach((el) => io.observe(el));
  $$(".cats .tile").forEach((t, i) => t.style.setProperty("--d", i % 3 * 70 + "ms"));
  $$(".menu a").forEach((a, i) => a.style.setProperty("--i", i));
  watch();
  const toastEl = $(".toast");
  let toastT;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add("on");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("on"), 2400);
  };
  const scrim = $(".scrim");
  let openEl = null, lastFocus = null;
  function open(id, opts = {}) {
    const el = document.getElementById(id);
    if (!el) return;
    if (openEl && openEl !== el) close(true);
    lastFocus = lastFocus || document.activeElement;
    el.hidden = false;
    scrim.hidden = false;
    openEl = el;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.classList.add("on");
      scrim.classList.add("on");
    }));
    document.documentElement.classList.add("lock");
    lenis && lenis.stop();
    if (id === "bag") setTab(opts.tab || "bag");
    if (id === "catalogue") {
      if (opts.cat !== void 0) setCat(opts.cat);
      renderSheet();
      if (opts.focus) setTimeout(() => $(".sheet__search input").focus(), 350);
    }
    if (!opts.focus) setTimeout(() => (el.querySelector("[data-close]") || el).focus({ preventScroll: true }), 60);
  }
  function close(swap) {
    if (!openEl) return;
    const el = openEl;
    openEl = null;
    el.classList.remove("on");
    setTimeout(() => {
      if (openEl !== el) el.hidden = true;
    }, 700);
    if (swap === true) return;
    scrim.classList.remove("on");
    setTimeout(() => {
      if (!openEl) scrim.hidden = true;
    }, 500);
    document.documentElement.classList.remove("lock");
    lenis && lenis.start();
    lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
    lastFocus = null;
  }
  scrim.addEventListener("click", () => close());
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
    if (e.key === "Tab" && openEl) {
      const f = $$('a[href],button:not([disabled]),input,[tabindex="0"]', openEl).filter((n) => n.offsetParent !== null);
      if (!f.length) return;
      const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      }
    }
    if ((e.key === "Enter" || e.key === " ") && e.target.matches(".card__img")) {
      e.preventDefault();
      quick(e.target.dataset.quick);
    }
  });
  let tab = "bag";
  const counts = () => {
    const n = { bag: bag.reduce((s, i) => s + i.qty, 0), wish: wish.length };
    $$("[data-count]").forEach((el) => {
      const v = n[el.dataset.count];
      if (el.textContent !== String(v)) {
        el.textContent = v;
        el.classList.remove("pop");
        void el.offsetWidth;
        el.classList.add("pop");
      }
      if (el.classList.contains("ico__n")) el.hidden = !v;
    });
    $$("[data-wish]").forEach((b) => b.setAttribute("aria-pressed", wish.includes(b.dataset.wish)));
  };
  function setTab(t) {
    tab = t;
    $$("[data-tabbtn]").forEach((b) => b.setAttribute("aria-selected", b.dataset.tabbtn === t));
    renderBag();
  }
  function renderBag() {
    const list = $("[data-list]"), sum = $("[data-sum]");
    const empty = (msg) => `<div class="empty"><p>${msg}</p><button type="button" class="btn btn--dark" data-open="catalogue">Browse the catalogue</button></div>`;
    if (tab === "bag") {
      list.innerHTML = bag.length ? bag.map((it, i) => {
        const p = byId(it.id);
        return `
        <div class="row"><img src="${p.img}" alt="" ${p.contain ? 'style="object-fit:contain;padding:8px"' : ""}>
          <div><b>${p.name}</b><small>${it.metal}${it.size ? " · size " + it.size : ""}</small>
            <span class="qty"><button type="button" data-qty="${i},-1" aria-label="Decrease quantity">−</button><span>${it.qty}</span><button type="button" data-qty="${i},1" aria-label="Increase quantity">+</button></span></div>
          <div class="row__r"><span>${inr(p.price * it.qty)}</span><button type="button" class="row__x" data-rm="${i}">Remove</button></div></div>`;
      }).join("") : empty("Your bag is empty.");
      sum.hidden = !bag.length;
      $("[data-subtotal]").textContent = inr(bag.reduce((s, i) => s + byId(i.id).price * i.qty, 0));
    } else {
      list.innerHTML = wish.length ? wish.map((id) => {
        const p = byId(id);
        return `
        <div class="row"><img src="${p.img}" alt="" ${p.contain ? 'style="object-fit:contain;padding:8px"' : ""}>
          <div><b>${p.name}</b><small>${p.cat}</small><button type="button" class="row__x" data-add="${p.id}">Move to bag</button></div>
          <div class="row__r"><span>${inr(p.price)}</span><button type="button" class="row__x" data-wish="${p.id}">Remove</button></div></div>`;
      }).join("") : empty("Nothing saved yet — tap a heart to keep a piece here.");
      sum.hidden = true;
    }
  }
  function addToBag(id, metal = METALS[0][0], size = null) {
    const hit = bag.find((i) => i.id === id && i.metal === metal && i.size === size);
    hit ? hit.qty++ : bag.push({ id, qty: 1, metal, size });
    store.set("bag", bag);
    counts();
    toast(byId(id).name + " added to your bag");
  }
  function toggleWish(id) {
    wish = wish.includes(id) ? wish.filter((w) => w !== id) : [...wish, id];
    store.set("wish", wish);
    counts();
    toast(wish.includes(id) ? "Saved to your wishlist" : "Removed from your wishlist");
  }
  const CATS = ["All", "Rings", "Earrings", "Necklaces", "Bracelets", "Engagement"];
  let cat = "All", q = "";
  const chips = $(".chips"), grid = $(".sheet__grid"), search = $(".sheet__search input");
  chips.innerHTML = CATS.map((c) => `<button type="button" data-chip="${c}" aria-pressed="${c === cat}">${c}</button>`).join("");
  function setCat(c) {
    cat = CATS.includes(c) ? c : "All";
    $$("[data-chip]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.chip === cat));
  }
  function renderSheet() {
    const t = q.trim().toLowerCase();
    const items = P.filter((p) => (cat === "All" || p.cat === cat) && (!t || (p.name + " " + p.cat + " " + p.note).toLowerCase().includes(t)));
    grid.innerHTML = items.map((p, i) => card(p, i)).join("");
    $$(".reveal", grid).forEach((el) => el.classList.add("in"));
    $(".sheet__empty").hidden = !!items.length;
  }
  search.addEventListener("input", () => {
    q = search.value;
    renderSheet();
  });
  const modal = $("#quick");
  let qv = { id: null, metal: METALS[0][0], size: null };
  const qs = (k) => $(`[data-q="${k}"]`, modal);
  function quick(id) {
    const p = byId(id);
    if (!p) return;
    const sized = p.cat === "Rings" || p.cat === "Engagement";
    qv = { id, metal: METALS[0][0], size: sized ? "12" : null };
    const img = $(".modal__img img", modal);
    img.src = p.img;
    img.alt = p.name;
    $(".modal__img", modal).classList.toggle("contain", !!p.contain);
    qs("cat").textContent = p.cat;
    qs("name").textContent = p.name;
    qs("price").textContent = inr(p.price);
    qs("note").textContent = p.note;
    qs("metals").innerHTML = METALS.map(([m, c]) => `<button type="button" data-metal="${m}" aria-pressed="${m === qv.metal}"><i style="background:${c}"></i>${m}</button>`).join("");
    qs("sizewrap").hidden = !sized;
    qs("sizes").innerHTML = sized ? ["8", "10", "12", "14", "16", "18"].map((s) => `<button type="button" data-size="${s}" aria-pressed="${s === qv.size}">${s}</button>`).join("") : "";
    qs("wish").dataset.wish = id;
    qs("wish").setAttribute("aria-pressed", wish.includes(id));
    open("quick");
  }
  $(".modal__img", modal).addEventListener("pointermove", (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--zx", (e.clientX - r.left) / r.width * 100 + "%");
    e.currentTarget.style.setProperty("--zy", (e.clientY - r.top) / r.height * 100 + "%");
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });
  document.addEventListener("click", (e) => {
    const t = e.target.closest('[data-add],[data-wish],[data-quick],[data-open],[data-close],[data-cat],[data-qty],[data-rm],[data-tabbtn],[data-chip],[data-metal],[data-size],[data-q="add"],[data-checkout],[data-reset],[data-toast]');
    if (!t) return;
    const d = t.dataset;
    if (d.add) {
      e.stopPropagation();
      addToBag(d.add);
      if (openEl && openEl.id === "bag") {
        wish = wish.filter((w) => w !== d.add);
        store.set("wish", wish);
        counts();
        setTab("bag");
      }
      return;
    }
    if (d.wish) {
      toggleWish(d.wish);
      if (openEl && openEl.id === "bag") renderBag();
      return;
    }
    if (d.q === "add") {
      addToBag(qv.id, qv.metal, qv.size);
      open("bag", { tab: "bag" });
      return;
    }
    if (d.metal) {
      qv.metal = d.metal;
      $$("[data-metal]", modal).forEach((b) => b.setAttribute("aria-pressed", b === t));
      return;
    }
    if (d.size) {
      qv.size = d.size;
      $$("[data-size]", modal).forEach((b) => b.setAttribute("aria-pressed", b === t));
      return;
    }
    if (d.quick) {
      quick(d.quick);
      return;
    }
    if (d.cat) {
      e.preventDefault();
      q = "";
      search.value = "";
      open("catalogue", { cat: d.cat });
      return;
    }
    if (d.chip) {
      setCat(d.chip);
      renderSheet();
      return;
    }
    if (d.reset !== void 0) {
      q = "";
      search.value = "";
      setCat("All");
      renderSheet();
      search.focus();
      return;
    }
    if (d.tabbtn) {
      setTab(d.tabbtn);
      return;
    }
    if (d.qty) {
      const [i, n] = d.qty.split(",").map(Number);
      bag[i].qty += n;
      if (bag[i].qty < 1) bag.splice(i, 1);
      store.set("bag", bag);
      counts();
      renderBag();
      return;
    }
    if (d.rm) {
      bag.splice(+d.rm, 1);
      store.set("bag", bag);
      counts();
      renderBag();
      return;
    }
    if (d.checkout !== void 0) {
      toast("This is a concept store — checkout is not connected.");
      return;
    }
    if (d.toast) {
      toast(d.toast);
      return;
    }
    if (d.open) {
      open(d.open, { tab: d.tab, focus: d.focusSearch !== void 0, cat: d.open === "catalogue" && !openEl ? "All" : void 0 });
      return;
    }
    if (d.close !== void 0) {
      const href = t.getAttribute("href");
      close();
      if (href && href.startsWith("#")) {
        e.preventDefault();
        setTimeout(() => scrollToEl($(href)), 80);
      }
    }
  });
  $$('a[href^="#"]:not([data-cat]):not([data-close]):not(.scroll-cue)').forEach((a) => a.addEventListener("click", (e) => {
    const el = a.getAttribute("href").length > 1 && $(a.getAttribute("href"));
    if (el) {
      e.preventDefault();
      scrollToEl(el.id === "top" ? 0 : el);
    }
  }));
  const pv = $(".menu__pv img");
  $$(".menu a[data-img]").forEach((a) => {
    const swap = () => {
      if (pv.getAttribute("src") === a.dataset.img) return;
      pv.classList.add("out");
      setTimeout(() => {
        pv.src = a.dataset.img;
        pv.classList.remove("out");
      }, 220);
    };
    a.addEventListener("pointerenter", swap);
    a.addEventListener("focus", swap);
  });
  const news = $(".news");
  news && news.addEventListener("submit", (e) => {
    e.preventDefault();
    const inp = $("input", news), msg = $(".news__msg", news), ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(inp.value.trim());
    news.classList.toggle("err", !ok);
    msg.textContent = ok ? "Thank you — you are on the list." : "Please enter a valid email address.";
    if (ok) inp.value = "";
    else inp.focus();
  });
  if (fine && !reduce) {
    const cur = $(".cursor");
    document.addEventListener("pointermove", (e) => {
      cur.style.setProperty("--cx", e.clientX + "px");
      cur.style.setProperty("--cy", e.clientY + "px");
      const tile = e.target.closest(".tile"), ci = e.target.closest(".card__img");
      cur.classList.toggle("on", !!tile || !!ci && !e.target.closest(".card__add"));
      if (tile) {
        const r = tile.getBoundingClientRect();
        tile.style.setProperty("--mx", (e.clientX - r.left) / r.width * 100 + "%");
        tile.style.setProperty("--my", (e.clientY - r.top) / r.height * 100 + "%");
      }
      if (ci) {
        const r = ci.getBoundingClientRect(), c = ci.closest(".card");
        c.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5) * -18 + "px");
        c.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5) * -18 + "px");
      }
    }, { passive: true });
    document.addEventListener("pointerleave", () => cur.classList.remove("on"));
  }
  window.CALLA = { lenis, toast, addToBag, scrollToEl, METALS, inr };
  counts();
  renderBag();
})();
