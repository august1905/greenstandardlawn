# Green Standard Lawn Co. website

The new website for Green Standard Lawn Co. LLC.

**Preview:** https://august1905.github.io/greenstandardlawn/

It's a plain website with no Wix or other website builder underneath. Every change saved to this repository goes live on its own in about a minute. Until it replaces greenstandardlawn.co, it's hidden from Google.

---

## How to make changes

### Option 1: Ask an AI to do it (easiest)

Any AI coding assistant that can connect to GitHub can edit this site: Claude (the Code tab in the Claude app, or claude.ai/code), ChatGPT's Codex, GitHub Copilot, Cursor, and others.

1. Connect the AI to your GitHub account (each tool walks you through it the first time).
2. Point it at this repository and describe what you want in plain words, for example:
   - "Change the phone number to 262-555-0100 everywhere."
   - "Add a new service called Aeration with its own page."
   - "Replace the photo on the Seasonal Cleanups tile with assets/photos/leaves.jpg."
   - "Take Snow Removal out of 'coming soon'. Here's what's included: ..."
3. Ask it to show you what it changed, then tell it to push the change.

The AI reads `AGENTS.md` first. That file explains how the site is built and the rules (weekly mowing only, no made-up facts, brand colors, and so on), so it doesn't break anything or invent things about your business.

### Option 2: Edit text yourself on GitHub

Good for fixing a typo or changing a sentence.

1. Open the page's file on github.com (the home page is `index.html`; service pages are in the `services` folder).
2. Click the pencil icon (top right of the file).
3. Find the text and change it. Use your browser's find (Ctrl+F) to locate it.
4. Click **Commit changes**. It's live in about a minute.

The menu and footer appear on every page. If you change something in them, such as contact info, change it in every file, or use Option 1.

### Adding your own photos

1. Open the `assets` folder on github.com, then **Add file → Upload files**. Put photos in a `photos` folder, and use simple names like `patio-job.jpg`.
2. Ask your AI to use the photo where you want it, or find the matching `<img src="...">` line yourself and replace the address with `assets/photos/patio-job.jpg` (on service pages, `../assets/photos/patio-job.jpg`).

Photos straight from a phone are huge. Shrink them to about 2000 pixels wide first so the site stays fast. Most photo apps have an "export" or "resize" option.

---

## What's where

| File | Page |
|---|---|
| `index.html` | Home page |
| `services/mowing-trimming.html` | Mowing & Trimming |
| `services/seasonal-cleanups.html` | Seasonal Cleanups |
| `services/landscape-detailing.html` | Landscape Detailing |
| `services/hardscaping-concrete.html` | Hardscaping & Concrete |
| `services/snow-removal.html` | Snow Removal (coming soon) |
| `css/styles.css` | Colors, fonts, layout |
| `js/` | Menus, animations, the quote form, the mowable lawn |

---

## Before it replaces greenstandardlawn.co

- [ ] **Swap in real photos.** The home page hero and most service photos are free stock placeholders (Unsplash). The lawn-and-ivy photo comes from Wix's built-in photo library, and Wix licenses those for Wix sites only, so replace it before cancelling Wix. The "Our work" photo is Green Standard's own: download it from the current site into `assets/photos/` so it doesn't disappear with Wix.
- [ ] **Check the wording** on every service page, especially Hardscaping & Concrete and the season months on the home page.
- [ ] **Quote form:** right now it opens the visitor's email app with the details filled in. For requests that go straight to your inbox, sign up for a form service (Formspree has a free plan) and have your AI connect it.
- [ ] **Point the domain here.** In the domain settings wherever greenstandardlawn.co is registered (Wix, if it was bought there), add GitHub Pages' DNS records. Then, in this repo's **Settings → Pages**, enter the domain under **Custom domain** and turn on **Enforce HTTPS**. GitHub's guide: https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site
- [ ] **Let Google see it.** Remove the `noindex` line near the top of every page (or ask your AI to).
- [ ] **Cancel the Wix plan** once the domain works, keeping the domain registration until it's moved elsewhere.
