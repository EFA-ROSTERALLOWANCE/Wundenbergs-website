# Wundenberg's Recording Studios — website

A redesign of [wundenbergs.com](https://wundenbergs.com): Wundenberg's Recording Studios in Thebarton, Adelaide.

The site is plain HTML, one stylesheet and one small script, with no framework and no build step. To run it,
open `index.html` or serve the folder (`python3 -m http.server`).

| Page | File |
|---|---|
| Home | `index.html` (includes the Spotify portfolio, at `#work`) |
| Studio 1 | `studio-1.html` |
| Studio 2 | `studio-2.html` |
| Rehearsal Rooms | `rehearsal-rooms.html` |
| Gear List | `gear.html` (searchable) |
| Contact | `contact.html` (enquiry form) |

All the copy, photos, gear and contact details come from the current site. Rehearsal room details, prices and
peak and off-peak times come from [adelaiderehearsalrooms.com](https://adelaiderehearsalrooms.com/).

The rehearsal rooms' own site, Adelaide Rehearsal Rooms, is in [`adelaide-rehearsal-rooms/`](adelaide-rehearsal-rooms/).
It uses the same design and has its own README.

## How it fits with the booking system

The site has two kinds of booking, and every "Book" button sends people to the right one:

- **Rehearsal rooms** are booked online through the
  [Booking-System](https://github.com/EFA-ROSTERALLOWANCE/Booking-System) WordPress plugin, which runs as a
  full-page WordPress page. Every link to it has a `data-book` attribute, and `BOOKING_URL` at the top of
  `assets/js/site.js` sets where they all point. It defaults to `/book/`, the page you create with the
  plugin's **Studio booking (full page)** template. The booking page's logo already links back to
  `https://wundenbergs.com/`.
- **Recording, mixing and production** start with an enquiry on `contact.html`. Studio pages link to
  `contact.html?for=studio-1` or `?for=studio-2` to pre-select the room. Choosing "Rehearsal room" on the
  form points the visitor to online booking instead.

The amber accent (`--accent: #f0b429`) is the booking page's dark-theme accent, so going from the site to
the booking page looks like one product.

## Things to set or check before going live

- **`BOOKING_URL`** in `assets/js/site.js`: set it to the published booking page's address.
- **Enquiry form**: with `FORM_ENDPOINT` empty, Send opens the visitor's email app with the enquiry filled
  in, addressed to `info@wundenbergs.com`. To send from the page itself, set `FORM_ENDPOINT` to a form
  handler (a WordPress form plugin endpoint, Formspree, etc.) that accepts a POST of the form fields.
- **Rehearsal rates table** (`rehearsal-rooms.html`) is static and follows adelaiderehearsalrooms.com. The
  booking system disagrees with it in places (Room 9, Room 6's price, Sunday peak); see
  `adelaide-rehearsal-rooms/README.md`.
- **Store**: the old Ecwid store page is in maintenance mode, so it isn't in the new navigation.
- **Old URLs**: if this replaces the WordPress pages, redirect `/studio1/` → `studio-1.html`,
  `/studio2/` → `studio-2.html`, `/gearlist/` → `gear.html`, `/contactus/` → `contact.html`,
  `/rehearsalrooms/` → `rehearsal-rooms.html` and `/portfolio/` → `index.html#work`.

## Editing

- Colours, type and spacing are CSS custom properties at the top of `assets/css/site.css`.
- The header, mobile menu and footer are repeated in each page. Change all six files when you edit them.
- Photos are in `assets/img/` as WebP, each at a full size and a `-sm` (900px) size for phones.
