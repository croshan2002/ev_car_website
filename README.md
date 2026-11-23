# VOLTA Arc — 3D Electric Car Configurator (Day 4)

Next.js product page for a concept electric grand tourer, set in a dark showroom with a reflective floor.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Production: `npm run build` then `npm start`.

## Stack

- **Next.js 16 (App Router) + React 19**
- **React Three Fiber + drei**: real glTF car model (`public/models/car.glb`, meshopt + WebP, 2.8 MB) with live paint, rim finishes, spinning wheels, drag-to-rotate in any direction with 360° auto spin, opening driver door and switchable lights; `MeshReflectorMaterial` showroom floor
- **Dark / light theme**: toggle in the nav, saved in localStorage, follows the OS until chosen; the 3D showroom switches too
- **Motion**: curtain page transition on nav clicks, 3D letter flip for "ARC", spec counters, blur caption swaps, sliding tab line, paint ring, switches, animated price, reservation tick
- **GSAP ScrollTrigger + Lenis**: smooth scroll and the scroll-driven camera tour

## Sections

| Section | What happens |
| --- | --- |
| Hero | Car drives in from the left with wheels turning; range / 0–100 / charge counters |
| Design | Sticky tour: side profile → light bar → tail light → glass roof as you scroll |
| Performance | Numbers follow the powertrain you pick in the configurator |
| Configure | Paint (6, incl. satin + matte), wheels (Aero / Turbine / Sport), powertrain, door and light switches, live ex-showroom price |
| Reserve | Car drives off; summary + reservation form with success animation |

## SEO, AEO and GEO

- On Vercel the site URL comes from the production domain. Elsewhere, or to override it, set `NEXT_PUBLIC_SITE_URL` (see `.env.example`). Canonical URL, Open Graph, sitemap, robots and JSON-LD all use it.
- `lib/site.js` holds the facts, highlights and FAQ. The visible Specs and FAQ sections, the JSON-LD (Organization, WebPage, Product/Car, FAQPage), `/llms.txt` and the metadata are all built from it, so they stay in sync.
- Generated routes: `/robots.txt` (also allows AI crawlers), `/sitemap.xml`, `/manifest.webmanifest`, `/opengraph-image`, `/llms.txt`.

## Credits

3D model: [“Car Concept”](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept) by Eric Chadwick / Darmstadt Graphics Group, CC BY 4.0. Compressed with glTF-Transform; Khronos logos removed at load time (the licence excludes them). Keep the footer credit.

## Where to change things

- Paints, wheels, trims, prices: `lib/store.js`
- Car model setup, rim finishes, poses and design-tour angles: `components/three/Car.jsx` (`prepare`, `RIMS`, `POSES`, `TOUR`)
- Showroom lighting, floor and per-theme look: `components/three/Scene.jsx` (`LOOK`)
- 360° rotation: speeds and drag feel in `lib/turntable.js` and `components/three/freeRotate.js`
- Theme colours: the `:root` and `[data-theme=light]` tokens in `app/globals.css`

Note: the reflective floor is the heaviest part. On slow laptops lower `resolution` on `MeshReflectorMaterial` in `Scene.jsx`.
