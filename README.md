# Green Standard Lawn Co. — site redesign

A hand-built redesign of [greenstandardlawn.co](https://www.greenstandardlawn.co/), hosted as a preview on GitHub Pages.

**Preview:** https://august1905.github.io/greenstandardlawn/

The preview is marked `noindex`, so it won't show up in search results or compete with the live Wix site.

## What's on the page

| Section | What it does |
|---|---|
| **Hero plot** | An interactive lawn. Move the cursor (or swipe sideways on a phone) to mow it. Stripes follow real lawn physics: mowing up or right paints the light stripe, down or left paints the dark one. A counter tracks the square feet mowed, and finishing the lawn links to the quote form. |
| **Services** | The four services, each with a small landscape-plan swatch (stripes, leaves, hedge and tree symbols, snow). |
| **The year in a yard** | A 12-month chart showing when each service usually runs. A "Today" marker and the note above the chart update automatically from the visitor's date. |
| **Proof** | The real striped-lawn photo from the current site, plus the testimonial. |
| **The Standard** | The four values from the current site, next to a ruler animation where the grass gets cut to one even height. |
| **Quote form** | Service chips, frequency, and contact fields. Submitting opens the visitor's email app with everything filled in, addressed to greenstandard.team@gmail.com. |

## Brand

Colors are taken from the current site: forest `#2B3C2C`, moss `#3B4D3C`, bone `#EDECEC`, white, and plum `#6D274F`. The lawn greens are tints of the moss green.
Type is Fraunces (headings, same as the current site), Hanken Grotesk (body) and DM Mono (labels), all from Google Fonts.

## Files

```
index.html        all page content
css/styles.css    all styling
js/lawn.js        the mowable lawn and the striped footer
js/main.js        menu, scroll reveals, the season chart, the ruler animation, the quote form
assets/favicon.svg
```

No build step and no dependencies. Edit a file, commit, push to `main`, and GitHub Pages republishes in about a minute.

## Before this goes live

- **Confirm the season months** in the "year in a yard" chart with Preston (they're typical, not taken from the current site).
- **The quote form** opens the visitor's email app. For submissions that land in an inbox or CRM without that step, connect a form service (Formspree, Zoho Forms, etc.).
- **The lawn photo** is loaded from the current Wix site's image server. Copy it into `assets/` before cancelling Wix.
- **Remove the `noindex` meta tag** in `index.html` when this replaces the live site.
