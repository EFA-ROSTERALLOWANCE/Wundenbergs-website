/* Adelaide Rehearsal Rooms — site behaviour. No dependencies. */
"use strict";

/* Where every "Book" button goes: the booking page (the wrs-booking
   WordPress plugin's "Studio booking (full page)" page). Change it here and
   every booking link follows. Until the new booking page is live, point it
   at the current one: "https://adelaide-rehearsal-rooms.jammed.app/bookings#/" */
const BOOKING_URL = "/book/";

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

const gallery = $(".rooms");
if (gallery){
  let items = [];
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

  $$(".room-media", gallery).forEach(b => b.addEventListener("click", () => {
    items = $$(".room-card:not([hidden]) .room-media", gallery);
    open(items.indexOf(b));
  }));
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

/* ---------- room filter: by location ---------- */

const filterBtns = $$(".filters button");
filterBtns.forEach(btn => btn.addEventListener("click", () => {
  const f = btn.dataset.filter;
  filterBtns.forEach(b => b.setAttribute("aria-pressed", String(b === btn)));
  $$(".room-card").forEach(card => { card.hidden = f !== "all" && card.dataset.site !== f; });
}));

/* Location cards' "See rooms" buttons filter the list to that site. */
$$("[data-show-site]").forEach(a => a.addEventListener("click", () => {
  const btn = filterBtns.find(b => b.dataset.filter === a.dataset.showSite);
  if (btn) btn.click();
}));

/* ---------- footer year ---------- */

$$("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });
