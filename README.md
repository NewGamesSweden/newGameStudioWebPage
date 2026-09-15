# NewGameStudio website

A one-page static website. Plain HTML, CSS and JavaScript. No build step, no packages, no server needed.

## Files

| File | What it is |
| --- | --- |
| `index.html` | All the text and page structure. Edit this to change what the site says. |
| `style.css` | All the styling. Colours are at the top. Phone and tablet rules are at the bottom. |
| `main.js` | The image carousel, the enlarge dialog and the logo joke. Timing settings are at the top. |
| `surface.js` | The decorative folding background. Desktop only. Safe to remove. |
| `assets/` | All images. |
| `coffee/` | The interactive 3D coffee mug: model, Three.js, behaviour code and tests. See `coffee/README.md`. |
| `NewGameStudio.code-workspace` | Shortcut for opening the folder in VS Code. Optional. |

## View it locally

Run a small web server in the folder and open http://127.0.0.1:8080:

```powershell
py -m http.server 8080 --bind 127.0.0.1
```

Double-clicking `index.html` also works, except the 3D coffee mug, which browsers refuse to load
straight from disk. In that case the coffee section shows a plain ☕ instead. Everything else is the same.

## Host it on GitHub Pages

1. Create a GitHub repository and push this folder to it. `index.html` must be at the root of the repository.
2. On GitHub, open the repository, then **Settings**, then **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick your branch (usually `main`) and the `/ (root)` folder. Save.
4. After a minute or two the site is live at `https://<your-username>.github.io/<repository-name>/`.

Every push to that branch updates the live site.

## Common edits

**Change text.** Open `index.html`. The file is split into numbered sections with comments (Header, Hero, Games, The fools, Coffee, Footer). Edit the words in place.

**Change colours.** Open `style.css`. The colours are variables in the `:root` block at the top.

**Add or remove a carousel image.** Put the image in `assets/`. In `index.html`, find the block marked `SLIDES` and copy one `<div class="slide">` block. Change the `src`, the `alt` text and the `data-title` caption. Thumbnails and the "01 / 12" counter update automatically. The first slide in the list is shown first.

**Change carousel speed.** Open `main.js` and change `AUTOPLAY_INTERVAL_MS` at the top. The value is in milliseconds.

**Turn on the two dead links.** The "Play Gallery" and "Refill the devs" labels are intentionally not links yet. Each one has a comment right above it in `index.html` showing the line to swap in once you have a URL.

**Add the donation link.** Open `coffee/coffee-mug.js` and paste the URL into `DONATION_URL` at the top. The "Refill the devs" label becomes a link that opens in a new tab and refills the mug.

**Test the coffee mug rules.** Run `node --test "coffee/tests/*.test.mjs"` in the folder.

**Remove the background effect.** Delete the `<canvas class="origami-surface">` line and the `surface.js` script tag from `index.html`. You can then delete `surface.js`.

## Notes

- Fonts load from Google Fonts. Offline, the browser falls back to a system font.
- The layout adapts to phones (700px and below) and tablets (1000px and below). Those rules are in section 11 of `style.css`.
- Visitors who have "reduce motion" turned on get no autoplay, no animations and no background effect.
