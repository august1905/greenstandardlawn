# Instructions for AI assistants

Read this before changing anything in this repo. It applies to any AI tool (Claude, ChatGPT/Codex, Copilot, Cursor, etc.).

## What this is

The website for **Green Standard Lawn Co. LLC**, a small lawn care company. It's plain HTML, CSS and JavaScript: no framework, no build step, no packages to install. GitHub Pages serves the `main` branch exactly as it is, so **every push to `main` goes live in about a minute**.

The owner is not a developer. Explain what you changed in plain language, and ask before anything that's hard to undo (deleting pages, renaming files, force-pushing).

## Files

| Path | What it is |
|---|---|
| `index.html` | Home page: photo hero, service tiles, About section, season chart, "Our work" + testimonial, quote form |
| `services/*.html` | One page per service |
| `css/styles.css` | All styling. Colors and fonts are defined at the top under `:root` |
| `js/main.js` | Header behavior, menus, scroll fade-ins, season chart "Today" marker, ruler animation, quote form |
| `js/lawn.js` | The mowable lawn on the Mowing page, and the striped band at the bottom of every page |
| `assets/` | Favicon. Put new photos in `assets/photos/` |

## The one thing that trips people up

The **header and footer are copied into every HTML file** (`index.html` plus every page in `services/`). The list of services appears in several places on every page. When you add, remove or rename a service, or change contact info, update **all** of these:

1. The Services dropdown in the header (`<div class="nav-dd-panel">`), every page
2. The Services list in the footer, every page
3. The service tiles on the home page (`<ul class="tiles tiles-home">`). The first tile is the wide one.
4. The "Other services" tiles on every service page (`<ul class="tiles tiles-other">`), excluding that page's own service
5. A checkbox chip in the quote form on `index.html`. Its `data-chip` value must match the `?service=` value in that service page's quote links.
6. Optionally, a row in the season chart on `index.html` (`#seasons`)

The tile numbers (`01`, `02`, ...) follow the order on the home page. Keep them consistent everywhere.

Search the whole repo for the service name before you finish, to catch anything you missed.

**Adding a service page:** copy an existing page in `services/`, then change the `<title>`, meta description, banner photo, breadcrumb, `banner-meta`, `h1`, intro paragraph, the three facts, the `?service=` links, and the three "What's included" cards. Then do steps 1 to 6 above.

## Content rules

- **Only state facts the owner has confirmed.** Never invent prices, years in business, service areas, crew size, certifications, reviews, guarantees or response times.
- **Mowing is weekly only.** Green Standard doesn't offer bi-weekly mowing.
- **Voice:** plain, confident and friendly. Short sentences. No exclamation marks. Avoid filler like "elevate", "seamless", "transform", "unlock", "nestled", "top-notch".
- **Photos:** don't use photos of people unless they're the Green Standard crew. Prefer the owner's own photos. Resize to about 2000px wide and under 500 KB, and write descriptive `alt` text.
- **Brand:** use only the colors defined in `:root` in `css/styles.css` (forest `#2B3C2C`, moss `#3B4D3C`, bone `#EDECEC`, white, plum `#6D274F`, and the lawn tints). Fonts are Fraunces (headings), Hanken Grotesk (body) and DM Mono (small uppercase labels).

## Technical rules

- **Use relative links only.** The site may live under a sub-path (`/greenstandardlawn/`) until a custom domain is connected. From `index.html`, link to `services/x.html`. From a service page, link to `../index.html`.
- Keep the `<meta name="robots" content="noindex, nofollow">` tag on every page until the owner says this site is replacing greenstandardlawn.co. Then remove it from every page.
- The quote form has no backend. On submit, `main.js` checks the fields and opens the visitor's email app with a pre-filled message to greenstandard.team@gmail.com. Opening `index.html?service=<chip>#quote` pre-selects that service.
- Season chart bars: `<span class="bar" style="grid-column: START / END">`. START is the first month (1 to 12) and END is the month *after* the last one, so April through October is `4 / 11`. The "Today" marker places itself.
- Elements with `data-reveal` fade in on scroll. New sections can use it too.

## Before you push

Preview the site and click through every page you touched, at desktop width and phone width (about 375px). From the repo folder, either of these serves it at http://localhost:8000:

```
python -m http.server 8000
npx serve -l 8000
```

Check the browser console for errors, then commit with a short message that says what changed, and push to `main`.
