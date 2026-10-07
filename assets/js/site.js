/* Wundenberg's Recording Studios — site behaviour. No dependencies. */
"use strict";

/* Where "Book a rehearsal room" goes: the WordPress page that uses the
   wrs-booking plugin's "Studio booking (full page)" template. Change it here
   and every booking link on every page follows. */
const BOOKING_URL = "/book/";

/* Where enquiries go. With FORM_ENDPOINT empty the form opens the visitor's
   email app with everything filled in. Set it to a form handler URL (a
   WordPress form plugin's endpoint, Formspree, etc.) to send it from the page. */
const ENQUIRY_EMAIL = "info@wundenbergs.com";
const FORM_ENDPOINT = "";

document.documentElement.classList.add("js");

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ---------- booking links ---------- */

$$("[data-book]").forEach(a => { a.href = BOOKING_URL; });

/* ---------- header: solid once scrolled ---------- */

const header = $(".site-header");
if (header){
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------- mobile menu ---------- */

const toggle = $(".menu-toggle");
if (toggle){
  const setOpen = open => {
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  toggle.addEventListener("click", () => setOpen(!document.body.classList.contains("menu-open")));
  $$(".mobile-nav a").forEach(a => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", e => { if (e.key === "Escape") setOpen(false); });
  window.addEventListener("resize", () => { if (window.innerWidth > 1020) setOpen(false); });
}

/* ---------- "Book" menu: rehearsal online vs recording enquiry ---------- */

const bookBtn = $(".header-cta > button");
const bookMenu = $(".book-menu");
if (bookBtn && bookMenu){
  const setOpen = open => {
    bookMenu.classList.toggle("open", open);
    bookBtn.setAttribute("aria-expanded", String(open));
  };
  bookBtn.addEventListener("click", e => {
    e.stopPropagation();
    const open = !bookMenu.classList.contains("open");
    setOpen(open);
    if (open) bookMenu.querySelector("a").focus();
  });
  document.addEventListener("click", e => { if (!bookMenu.contains(e.target)) setOpen(false); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && bookMenu.classList.contains("open")){ setOpen(false); bookBtn.focus(); }
  });
}

/* ---------- reveal on scroll ---------- */

const reveals = $$(".reveal");
if ("IntersectionObserver" in window && reveals.length){
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  reveals.forEach(el => io.observe(el));
} else {
  reveals.forEach(el => el.classList.add("in"));
}

/* ---------- gallery lightbox ---------- */

const gallery = $(".gallery");
if (gallery){
  const items = $$("button", gallery);
  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-label", "Photo viewer");
  const icon = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  lb.innerHTML = `
    <img alt="">
    <button class="lb-btn lb-close" aria-label="Close">${icon('<path d="M18 6 6 18M6 6l12 12"/>')}</button>
    <button class="lb-btn lb-prev" aria-label="Previous photo">${icon('<path d="m15 18-6-6 6-6"/>')}</button>
    <button class="lb-btn lb-next" aria-label="Next photo">${icon('<path d="m9 18 6-6-6-6"/>')}</button>
    <div class="lb-count" aria-live="polite"></div>`;
  document.body.appendChild(lb);
  const img = $("img", lb), count = $(".lb-count", lb);
  let idx = 0, opener = null;

  const show = i => {
    idx = (i + items.length) % items.length;
    const src = items[idx].querySelector("img");
    img.src = items[idx].dataset.full || src.src;
    img.alt = src.alt;
    count.textContent = `${idx + 1} / ${items.length}`;
  };
  const open = i => { opener = items[i]; show(i); lb.classList.add("open"); document.body.style.overflow = "hidden"; $(".lb-close", lb).focus(); };
  const close = () => { lb.classList.remove("open"); document.body.style.overflow = ""; if (opener) opener.focus(); };

  items.forEach((b, i) => b.addEventListener("click", () => open(i)));
  $(".lb-close", lb).addEventListener("click", close);
  $(".lb-prev", lb).addEventListener("click", () => show(idx - 1));
  $(".lb-next", lb).addEventListener("click", () => show(idx + 1));
  lb.addEventListener("click", e => { if (e.target === lb) close(); });
  document.addEventListener("keydown", e => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
    if (e.key === "Tab"){   // keep focus inside the viewer
      const f = $$(".lb-btn", lb), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });
  let x0 = null;
  lb.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    x0 = null;
  });
}

/* ---------- gear list: search + category tabs ---------- */

const gearSearch = $("#gear-q");
if (gearSearch){
  const cats = $$(".gear-cat");
  const tabs = $$(".gear-tabs a");
  const empty = $(".gear-empty");
  const items = $$(".gear-group li");
  items.forEach(li => { li.dataset.text = li.innerHTML; });

  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const filter = () => {
    const q = gearSearch.value.trim();
    const re = q ? new RegExp(esc(q), "ig") : null;
    let any = false;
    cats.forEach(cat => {
      let catHit = false;
      $$(".gear-group", cat).forEach(g => {
        let groupHit = false;
        $$("li", g).forEach(li => {
          li.innerHTML = li.dataset.text;
          const hit = !re || li.textContent.match(re) || g.querySelector("h3").textContent.match(re);
          li.hidden = !hit;
          if (hit){
            groupHit = true;
            // highlight only inside the item's name, never inside the count
            if (re){
              const name = li.firstChild;
              if (name && name.nodeType === 3){
                const span = document.createElement("span");
                span.innerHTML = name.textContent.replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])).replace(new RegExp(esc(q), "ig"), m => `<mark>${m}</mark>`);
                li.replaceChild(span, name);
              }
            }
          }
        });
        g.hidden = !groupHit;
        catHit = catHit || groupHit;
      });
      cat.hidden = !catHit;
      any = any || catHit;
    });
    empty.classList.toggle("show", !any);
    $(".gear-empty b").textContent = q;
  };
  gearSearch.addEventListener("input", filter);

  // highlight the tab for the category on screen
  if ("IntersectionObserver" in window){
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting){
          tabs.forEach(t => t.classList.toggle("active", t.getAttribute("href") === "#" + en.target.id));
          const active = tabs.find(t => t.classList.contains("active"));
          if (active) active.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    cats.forEach(c => spy.observe(c));
  }
  tabs.forEach(t => t.addEventListener("click", () => {
    if (gearSearch.value){ gearSearch.value = ""; filter(); }
  }));
}

/* ---------- enquiry form ---------- */

const form = $("#enquiry");
if (form){
  const nudge = $(".rehearsal-nudge", form);
  const status = $(".form-status", form);

  // Preselect from ?for=studio-1 / studio-2 / rehearsal (the "Enquire" buttons on each studio page use it)
  const want = new URLSearchParams(location.search).get("for");
  if (want){
    const r = form.querySelector(`input[name="space"][value="${CSS.escape(want)}"]`);
    if (r) r.checked = true;
  }
  const syncNudge = () => {
    const v = (form.querySelector('input[name="space"]:checked') || {}).value;
    nudge.classList.toggle("show", v === "rehearsal");
  };
  form.addEventListener("change", syncNudge);
  syncNudge();

  const say = (cls, html) => {
    status.className = "form-status show " + cls;
    status.innerHTML = html;
    status.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  form.addEventListener("submit", e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const d = new FormData(form);
    const spaceLabel = { "studio-1": "Studio 1", "studio-2": "Studio 2", "mixing": "Mixing / production", "rehearsal": "Rehearsal room", "other": "Something else" };
    const space = spaceLabel[d.get("space")] || "General";
    const lines = [
      `Name: ${d.get("name")}`,
      `Email: ${d.get("email")}`,
      d.get("phone") ? `Phone: ${d.get("phone")}` : "",
      d.get("act") ? `Artist / project: ${d.get("act")}` : "",
      `Interested in: ${space}`,
      d.get("when") ? `Preferred dates: ${d.get("when")}` : "",
      "",
      d.get("message"),
    ].filter(l => l !== "").join("\n");
    const subject = `Enquiry: ${space} — ${d.get("name")}`;

    if (FORM_ENDPOINT){
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      fetch(FORM_ENDPOINT, { method: "POST", headers: { Accept: "application/json" }, body: d })
        .then(r => {
          if (!r.ok) throw new Error();
          form.reset(); syncNudge();
          say("ok", "<b>Thanks — your enquiry is in.</b> We usually reply within a day or two.");
        })
        .catch(() => say("err", `That didn't send. Please email us at <a href="mailto:${ENQUIRY_EMAIL}">${ENQUIRY_EMAIL}</a>.`))
        .finally(() => { btn.disabled = false; });
      return;
    }

    location.href = `mailto:${ENQUIRY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines)}`;
    say("ok", `<b>Your email app should now open with your enquiry ready to send.</b> If it didn't, email us at <a href="mailto:${ENQUIRY_EMAIL}">${ENQUIRY_EMAIL}</a>.`);
  });
}

/* ---------- footer year ---------- */

$$("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });
