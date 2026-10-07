# Adelaide Rehearsal Rooms — website

A redesign of [adelaiderehearsalrooms.com](https://adelaiderehearsalrooms.com/), the rehearsal-room business
of Wundenberg's Recording Studios. It shares a design system with the Wundenberg's site in the repo root
(same fonts, dark theme and amber accent), so the two read as sister brands.

It is one page: plain HTML, one stylesheet and one small script, with no build step. Open `index.html` or
serve this folder. The folder is self-contained, so it can be deployed on its own.

| Section | What's there |
|---|---|
| Hero and stats | 9 rooms, 24/7 access, $55–$90 per 4 hours, 20% off off-peak |
| `#rooms` | A card for each room: photo (tap to enlarge), size, air con, drum kit, PA, mics, 4-hour price, Book button. Filter by location. |
| `#locations` | Thebarton (Rooms 1–6) and Windsor Gardens (Rooms 7–9), with addresses and directions |
| `#pricing` | A week chart of off-peak hours, plus the minimum session and peak times |
| `#how` | Book, get your door code, play |
| `#faq` | Availability, cost, access, what's in the rooms, cancellations |

All the content (rooms, prices, gear, addresses, times, policies) comes from the current site.

## Booking

Every Book button has a `data-book` attribute, and `BOOKING_URL` at the top of `assets/js/site.js` sets
where they all go. It defaults to `/book/`, the page made with the
[Booking-System](https://github.com/EFA-ROSTERALLOWANCE/Booking-System) plugin's **Studio booking (full page)**
template. Until that is live, set it to the current booking page,
`https://adelaide-rehearsal-rooms.jammed.app/bookings#/`.

## Before going live: things that don't match the booking system

This site follows what adelaiderehearsalrooms.com says today. The booking system's rules block differs in
places, so check these and line the booking system up with whichever is right:

- **Room 9** is missing from the booking system, which has 8 rooms.
- **Room 6** is $55 per 4 hours on the site ($13.75/hr), but the booking system charges $16.25/hr.
- **Sunday** is off-peak from 5pm on the site. The booking system has Sunday peak all day.
- **Minimum session** is 4 hours on the site, but 2 hours in the booking system (marked as a placeholder there).
- **Opening hours** are 24/7 on the site, but 8am–midnight in the booking system (also a placeholder).
- **Snare and cymbal hire** is an add-on on the site. The booking system has a placeholder "Backline hire" extra.
- **Cancellations**: the site says no cancellations or refunds within 48 hours of a booking. The booking
  system allows a full refund within 24 hours of making the booking, and a free move up to 48 hours before.

## Editing

- The page was written as one file. Room details are in the room cards in `index.html`.
- Colours and type are CSS custom properties at the top of `assets/css/site.css`. That file starts as a copy
  of the Wundenberg's stylesheet, with this site's additions at the end.
- Photos are in `assets/img/` as WebP, each at a full size and a `-sm` (900px) size.
