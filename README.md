# Green Standard Lawn Co. — site redesign

A hand-built redesign of [greenstandardlawn.co](https://www.greenstandardlawn.co/), hosted as a preview on GitHub Pages.

**Preview:** https://august1905.github.io/greenstandardlawn/

The preview is marked `noindex`, so it won't show up in search results or compete with the live Wix site.

## Pages

| Page | What's on it |
|---|---|
| `index.html` | Full-screen photo hero with the menu over it, four big service tiles that open each service page, the About section (ruler animation and the four values), the season chart, the "our work" photo and testimonial, and the quote form. |
| `services/mowing-trimming.html` | Service page, plus the interactive lawn you can mow with your cursor. |
| `services/seasonal-cleanups.html` | Service page. |
| `services/landscape-detailing.html` | Service page. |
| `services/snow-removal.html` | "Coming soon" page with a waitlist button. |

Every service page has a photo banner, a short intro with key facts, three "what's included" cards, a quote button, and links to the other services.

The **Services** menu in the header is a dropdown on desktop (hover or click) and an expanding list in the mobile menu.
The quote buttons on service pages link to `index.html?service=…#quote`, which pre-selects that service in the form.

## Brand

Colors are taken from the current site: forest `#2B3C2C`, moss `#3B4D3C`, bone `#EDECEC`, white, and plum `#6D274F`. The lawn greens are tints of the moss green.
Type is Fraunces (headings, same as the current site), Hanken Grotesk (body) and DM Mono (labels), all from Google Fonts.

## Files

```
index.html                 home page
services/*.html            one page per service
css/styles.css             all styling
js/main.js                 header, menus, scroll reveals, season chart, ruler animation, quote form
js/lawn.js                 the mowable lawn (mowing page) and the striped footer band
assets/favicon.svg
```

No build step and no dependencies. Edit a file, commit, push to `main`, and GitHub Pages republishes in about a minute.
The header and footer are repeated in each page, so a change to the menu or footer has to be made in all five files.

## Photos

- The "Our work" photo on the home page is Green Standard's own, loaded from the current Wix site.
- The Mowing & Trimming tile and banner use the lawn-and-ivy photo from the current site's About page, also loaded from Wix. It comes from Wix's built-in photo library, and Wix licenses those for use on Wix sites, so replace it before leaving Wix.
- The rest (hero, other tiles and banners) are free [Unsplash](https://unsplash.com/license) photos with no people in them, used as placeholders. Swap them for Green Standard's own photos (their Instagram is a good source) by changing the `images.unsplash.com/...` URLs.

## Before this goes live

- **Replace the stock photos** with real ones of Green Standard's work.
- **Confirm the season months** with Preston (they're typical, not taken from the current site).
- **The quote form** opens the visitor's email app. For submissions that land in an inbox or CRM without that step, connect a form service (Formspree, Zoho Forms, etc.).
- **Copy the "Our work" photo** into `assets/` before cancelling Wix.
- **Remove the `noindex` meta tag** from every page when this replaces the live site.
