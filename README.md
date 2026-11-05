# Casa Craft Interiors: website

Storefront for Casa Craft Interiors, handcrafted solid wood furniture from Nowgam, Srinagar.
Built with [Astro](https://astro.build) as a static site, with GSAP for motion.

## Run it

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static site in dist/
npm run preview    # serve the built site
npm run check:dashes   # house style: no em or en dashes anywhere
```

Deploys to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages): build command
`npm run build`, output folder `dist`. Set `site` in `astro.config.mjs` to the real domain first.

## Pages

| Route | What it is |
| --- | --- |
| `/` | Home: two-leather hero, collection, Zabarwan scene, material teaser, ordering steps, visit |
| `/shop`, `/shop/<category>` | Category pages with material filters, sorting and an empty state |
| `/product/<slug>` | Product page: story, tinted stage with Product / Detail / In a room views, configurator, buy bar |
| `/materials` | Material library, photographed on finished pieces, with care notes |
| `/atelier` | The workshop and how pieces are made |

## How ordering works

There is no checkout. "Add to enquiry" builds a list (stored in the visitor's browser). The
enquiry drawer turns it into a message, copies it, and opens a chat with
@casa.craft.interiors on Instagram. Set `whatsapp` or `email` in `src/data/catalog.ts` to
add those as options too.

## Before launch: replace placeholders

Everything below lives in `src/data/catalog.ts` (search for `PLACEHOLDER`):

- **Prices** are invented examples in INR.
- **Dimensions** are approximate guesses.
- **Product names** (Nishat, Zabarwan) and descriptions are proposals, named after places in Srinagar.
- **Domain**: `site` in `astro.config.mjs`.

## Design notes

- Surfaces come from the brand's own photos (the limewash wall, the warm panelled room).
  Product colour lives in the content: each piece's stage takes on its material's tint.
- Signature: on the home page the two leathers each tint half the stage, and the colour
  floods toward the chair you hover. On a product page, switching leather swaps the chair
  in place and re-tints the stage.
- Type: Cormorant italic for display moments (echoing the brand tagline), Instrument Sans
  for everything else. Both are self-hosted.
- Light and dark appearance follow the system. Reduced motion, reduced transparency and
  increased contrast are respected. Text contrast is at least 4.5:1 in both themes.
- Motion: GSAP ScrollTrigger reveals, SplitText line reveals, Flip for filtering, and
  native cross-document view transitions so product images carry across pages.

## Images

Product images were upscaled and cut out from Casa Craft's Instagram posts. See
`scripts/images/README.md`. Swap in original photos when available: drop them into
`src/assets/products` with the same names.
