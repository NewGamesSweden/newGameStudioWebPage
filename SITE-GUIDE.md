# NewGameStudio website: the complete guide

This is the long version of `README.md`. It explains what the site is made of, how every
page works, where each piece lives and how to change it. Read `README.md` first if you only
want to get it running.

Everything here was checked against the code on 6 October 2026, after the site became two
pages — the game on `index.html`, the team on `fools.html` — the coffee page was folded into
a "give us money" modal that opens from the nav on either page (and the 3D mug went with it),
the carousel was rebuilt as an endlessly drifting filmstrip, and a help-us-test section with
a playtest questionnaire modal joined the front page.

---

## 1. What this is

A small static website for NewGameStudio, the studio run by Daniel, Ahmed and Micky. Two
pages: the first game (Gallery) with its development carousel and a help-us-test section, and
the team (the fools). "give us money" in the nav opens a donation modal on either page; the
front page's "fill it out" opens a playtest questionnaire modal. The header and footer are
shared by both pages (duplicated in each HTML file — there is no build step to include them
from one place).

Technical shape:

- Plain HTML, CSS and JavaScript. No framework, no bundler, no package manager, no build step.
- Two HTML files, one stylesheet, one ordinary script. That's all.
- Fonts come from Google Fonts and fall back to system fonts offline.
- Hosted as static files. GitHub Pages is the intended host, but any static host works.

---

## 2. Running and publishing

### Run it locally

Open a terminal in the project folder and start any small web server, then open
http://127.0.0.1:8080 in a browser:

```powershell
py -m http.server 8080 --bind 127.0.0.1
```

Double-clicking `index.html` also works — every feature runs straight from disk.

### Publish

The repository is `NewGamesSweden/newGameStudioWebPage` on GitHub, branch `main`. Once GitHub
Pages is set to deploy from the root of `main`, every push updates the live site within a minute
or two.

```powershell
git add -A
git commit -m "Describe the change"
git push
```

Nothing needs to be compiled before pushing. What is in the repository is exactly what visitors
receive.

---

## 3. Folder map

| Path | What it is |
| --- | --- |
| `index.html` | The front page: the Gallery game text, the development carousel, and the help-us-test section (which opens the playtest questionnaire). |
| `fools.html` | The team page. |
| `style.css` | All styling for both pages, in numbered sections. Colours and fonts at the top, screen-size rules near the bottom. |
| `main.js` | The money modal (every page), the playtest modal, the filmstrip carousel and the image preview dialog (the last three on `index.html` only). Each part is guarded on its element existing. Settings at the top. |
| `assets/` | Every image on the site: the main-menu backdrop behind the Gallery card, the baked `gallery-title-ink.svg` wordmark, the fools banner, three avatar portraits, seventeen carousel images. |
| `tools/` | One-off build tools, never shipped with the site. `bake-title-ink.html` + `bake-title-ink.py` regenerate the Gallery title's ink-outlined wordmark (see section 5.2). |
| `README.md` | Short getting-started guide. |
| `NewGameStudio.code-workspace` | VS Code workspace shortcut. Optional. |

---

## 4. How the pages load

**Every page** links `style.css` and loads `main.js` just before `</body>`. The `?v=` on both
links busts caches — bump both whenever either file changes, on both pages.

**Every page**: `main.js` first wires the money modal (section 5.6 below) — the nav button
and dialog exist on both pages.

**`index.html`**: `main.js` also wires the playtest modal (section 5.5 below), finds the
carousel and starts the filmstrip (section 5.3 below), and wires the image preview dialog.
No other scripts.

**`fools.html`**: no carousel, no preview dialog — those parts no-op. No other scripts.

---

## 5. The pages, section by section

The section numbers below match the comments in the HTML files.

### 5.1 Header (both pages)

Sticky bar with the wordmark and the navigation: "gallery" (to `index.html`), "the fools"
(to `fools.html`), and "give us money ↗" — a bordered `<button>` that opens the money modal
(section 5.6), not a link. The nav item for the page you're on is pinned cyan
(`class="active"` + `aria-current="page"`, hard-coded per page) and wears a small cyan dot
centred under its text (`nav a.active::after`) — so exactly one dot shows per page, always
naming the page you're on. On phones the nav wraps to a
second row under the logo; all three items stay visible.

**The logo is the way home.** The wordmark ("NewGameStudio", "Game" in cyan) is a link to
`index.html` on every page. Beside it sits the studio's one-liner, "three fools making games",
in the small secondary style (`--muted`, 14px); hidden on phones. There is no hide-and-swap
behaviour — the wordmark is always visible.

Where: both HTML files section 1, `style.css` section 3.

### 5.2 The Gallery card (`index.html` section 2)

One row on the card: the game's name and its one-line pitch on the left, the "Play for free"
button on the right, all centred vertically. The card sits a 16px slide-gap under the nav's
underline (`#games { padding-top: 16px }` — the one exception to the section-gap rhythm; the
ID out-ranks the phone media query's `.section` shorthand, so it holds at every width). The
button links to https://gallery.newgamestudio.com/ and opens in a new tab. The card is
content-driven, about 250px tall.

**The title is a baked image, not text.** `assets/gallery-title-ink.svg` is a one-time render
of "Gallery" in the game's blackletter (UnifrakturCook). It wears the
ink-outline treatment the game draws around its 3D props — a near-black
sticker halo whose thickness breathes ±30% around the stroke mean, at the game's on-screen
stroke weight and noise rate — traced into six nested ink bands (thresholds 0.1 to 0.85)
whose wedge opacities stack to reproduce the game's continuous alpha ramp exactly.
It was produced by `tools/bake-title-ink.py`
(which runs `tools/bake-title-ink.html` headless); the SVG is the only runtime artefact and
nothing is calculated on the page. The `<img>` lives inside the `<h2>`, so the heading
semantics survive via its `alt` ("Gallery"). Its CSS width repeats the old
`clamp(64px, 7.5vw, 108px)` font rule with every term scaled by the lockup's width, so it
scales exactly like the font did. To change the title copy: edit the `fillText` call in
the bake page, re-run the driver, and paste its printed numbers into `.game-title img` and
the img's `width`/`height` attributes — and bump the `?v=` on the img's `src` (the bake
changes content at the same path).

**The backdrop.** One copy of the menu picture (`assets/menu-backdrop.jpg`, captured from the
game) on the card's `::before` (`z-index: -1` inside the card's own stacking context),
undimmed but softened with `filter: blur(6px)` — the pseudo-element is oversized
(`inset: -24px`) so the blur's soft edge hides inside the card's clipped corners. Fully
static CSS: nothing interactive. The pitch line under the title reads "a drawing deduction
game for the browser. Now in beta", set in the body font (DM Sans, like the header tagline)
in the title's white (`--ink`), and carries a soft two-layer navy
`text-shadow` so it stays readable over the undimmed picture.

**The joint with the carousel.** The card and the strip are two separate rounded panels with
one slide-gap (16px, the same space as between pictures) between them.

Where: `index.html` section 2, `style.css` section 4, `tools/` for the title bake.

### 5.3 The development carousel (`index.html` section 2)

An endless filmstrip: all seventeen images in one row — the latest in-game screenshots first,
then development studies and older builds — one slide-gap below the card. The strip's viewport
(`.slide-stage`) is painted the page background colour, so the gaps between pictures read as
the page showing through rather than a lighter panel.

- **Browsing is native.** The strip is a real horizontal scroller (no visible scrollbar), so
  trackpad swipes, touch drags and shift-plus-wheel all work with no JavaScript.
- **It drifts.** When the visitor is not on it — no pointer over the carousel, no keyboard
  focus inside, no press on the strip, preview closed, carousel on screen — it advances on
  its own at a slow, constant rate (`AUTO_SCROLL_PX_PER_S`, at the top of `main.js`).
- **It loops.** `main.js` appends one hidden copy of the slide list and quietly pulls the
  scroll position back one copy width each time it crosses the seam. Content at `s` and at
  `s + loopWidth` is pixel-identical, so the wrap is invisible, in either direction.
- **The chevron buttons.** A round button in the page's own background colour floats over
  each end of the strip (46px circle, 18px in from the edge; 38px and 10px on phones), with
  an inline-SVG chevron that turns cyan and grows slightly on hover. One press moves exactly
  one picture: from the centre of the picture in view to the centre of the next (or
  previous), taking the shortest way around the loop.
- **Caption labels.** Each picture carries its `data-title` as a small label in its
  bottom-right corner — page-background chip, rounded top-left corner — via a `.slide::after`
  pseudo-element (`content: attr(data-title)`), so the loop's clones label themselves for
  free and adding a slide needs no extra markup.
- **Thumbnails.** The clickable preview rail sits under the panel, still built by `main.js`.
  It follows whatever is in view — manual scroll, drift or chevrons — and clicking a thumb
  centres that image, exactly as a chevron press would.
- **Click a picture to enlarge it.** A short press (under 45px of movement) anywhere on a
  slide — picture or caption label — opens the preview dialog; drags are the strip's own
  scrolling. Keyboard: arrows on the focused carousel step one picture like the chevrons,
  Enter or Space opens the preview of the picture in view.

Where: `index.html` section 2, `style.css` section 4, `main.js` part 3.

### 5.4 The fools page (`fools.html`)

The group photo as a banner (`assets/fools-banner.jpg`): full column width, cropped to a
~320px-tall strip with the top of the picture anchored in frame (`object-fit: cover`,
`object-position: 50% 20%`) and shown as-is — no dimming, tint or blur, unlike the Gallery
card's backdrop. Below it, all left-aligned: the heading ("look how youthful we were before
the scope-creep got *completely out of control*", the span in cyan), the rock-climbing
caption, and the three names — each with a small round avatar portrait and a grey one-liner
bio, separated by the same row rules the old name list used. No box or band around the
section. `main.js` only wires the money modal here.

Where: `fools.html` section 2, `style.css` section 5.

### 5.5 Help us test + the playtest modal (`index.html`)

Below the carousel, styled exactly like the fools page content: the heading "help us *test*"
(the span in cyan), the caption "we've just sort of 'released' an open beta for Gallery, so
play the shit out of it and fill this thing out:", then a "questionnaire ↗" button reusing
the nav button's `.nav-money` class (its hover rule was un-scoped from the nav for this). The
button opens the questionnaire (`#test`), a native `<dialog>` in the money modal's exact style —
same box, title ("we need you to *fill* this out", "fill" cyan), lede, and corner ×. Inside,
sixteen open questions (`label.test-q` with a muted question line and a textarea each) scroll
inside a fixed-height `.test-form`, so the header and the × stay visible while the list
scrolls. The "send it" button is a deliberate no-op (`type="button"`, no handler): responses
will be wired to somewhere real later. Closes the same three ways as the money modal.

Where: `index.html` sections 3 and 7, `style.css` sections 5 (`.help-test`) and 7
(`dialog#test`, `.test-form`, `.test-q`), `main.js` part 2.

### 5.6 The money modal (both pages)

The nav's "give us money ↗" is a button, not a link. Clicking it opens a small native
`<dialog>` (`#money`) in the browser's top layer, above everything including the sticky
header, over a dimmed backdrop. Text only, in the usual panel colours — no orange: the title
"Gallery is free" (Space Grotesk, 34px), then the lede in two lines (18px) — "but if you're
rich as hell," / "we'd like several million euros please" — with "rich as hell" and "several
million euros" in cyan (`.money-hot`), then "donation link coming soon. You can still mail us
cash or other valuables" (14px, muted). Closing is a small × in the dialog's top-right corner
(`.money-close`, grey, cyan on hover — it overrides the shared dialog-button rule). It closes
on the ×, Escape, or a click on the dimmed background (the shared `closeOnOutsideClick` helper
in `main.js`). The dialog markup is duplicated in both HTML files, like the header and footer.

Where: both HTML files, `style.css` section 7, `main.js` part 1.

### 5.7 Footer (both pages)

Three parts on one grid row: the wordmark at the left edge, the credit dead-centre
("made with love by daniel, ahmed & micky." with the year under it — `1fr auto 1fr` columns
make the middle truly centred however wide the sides are), and the contact address
(`contact@newgamestudio.com`, a `mailto:` link, muted, cyan on hover) at the right edge. On
phones they stack centred: logo, then credit, then address.

Where: both HTML files, `style.css` section 6.

### 5.8 Image preview dialog (`index.html`)

A native `<dialog>` that opens on a short press on any picture in the strip (or Enter/Space
on the focused carousel). Shows the picture full size with its `data-title` caption. Closes
with the Close button, Escape, or a click outside the box. While it is open the strip's drift
pauses.

Where: `index.html` section 5, `style.css` section 7, `main.js` part 4.

---

## 6. Design system

### Colours

Defined once as variables in the `:root` block at the top of `style.css`:

| Variable | Use |
| --- | --- |
| `--bg` | Page background, deep navy (also the carousel stage, so the strip's picture gaps read as page) |
| `--panel` | The dialogs and buttons |
| `--ink` | Main text, warm off-white |
| `--muted` | Secondary text (the header tagline, captions) |
| `--cyan` | Accent 1: links, highlights, buttons, the active nav item, list rules |
| `--orange` | Accent 2: the keyboard focus ring |
| `--line` | Borders |

### Type

Space Grotesk for headings and labels; DM Sans for body text. Both from
Google Fonts. The Gallery title is the one outlier — the game's own blackletter
(UnifrakturCook) — but it ships as a baked SVG wordmark (section 5.2), not a live
font; the site itself stays in the 34 to 56px heading range.

### Spacing

One scale: 8, 16, 24, 32, 40, 56, 64px. Things that belong together sit 8 to 32px apart;
56 and 64px are reserved for the gaps between sections.

### Screen sizes

| Breakpoint | Behaviour |
| --- | --- |
| Desktop | Content is limited to a 1280px column. |
| 1000px and below (tablet) | Tighter page margins, smaller Gallery title, shorter carousel strip |
| 700px and below (phone) | Everything stacks: the Gallery card (copy, then button), the carousel, and the team content. The header tagline hides; the nav wraps to a second row under the logo, all three items visible. |

### Reduced motion

When the visitor's system asks for reduced motion: no smooth scrolling, no CSS transitions or
animations, and the carousel does not drift on its own (arrows jump instantly, manual
scrolling still works).

---

## 7. Common tasks

**Change any text.** Edit the HTML file the text lives on. Sections are numbered and
commented. The header, footer and money dialog exist in both files — change them in each.

**Add a carousel image.** Drop the file in `assets/`. In `index.html`, inside the block marked
`SLIDES`, copy one `<div class="slide">` block and change `src`, `alt` and `data-title`.
The loop and the thumbnails pick it up automatically.

**Change the Play Gallery link.** Edit the `href` on the `play-gallery` button in `index.html`
section 2.

**Re-bake the Gallery title.** The wordmark is generated, never hand-edited: edit the
`fillText` call in `tools/bake-title-ink.html`, run `python3 tools/bake-title-ink.py`
(it needs the machine-local headless Chrome the path at its top points to, plus network for
the font), and it overwrites `assets/gallery-title-ink.svg` and prints the CSS sizing
numbers — paste those into `.game-title img` and the img's `width`/`height` attributes in
`index.html`, then bump the `?v=` on the img's `src` (and on the `style.css`/`main.js`
links if those changed too).

**Make the donation link real.** The money modal's "donation link coming soon" sentence lives
in the money dialog in both HTML files. Replace the sentence with a link (or point it
somewhere new) in both.

**Tune the carousel.** `AUTO_SCROLL_PX_PER_S` (the drift speed) and `SWIPE_DISTANCE_PX`
(click threshold) sit at the top of `main.js`; the chevron buttons' size, inset and colours
are the `.strip-arrow` rules in `style.css` section 4.

**Wire up the questionnaire.** The playtest form's sixteen questions live in the `#test`
dialog in `index.html` section 7 (one `label.test-q` per question, `name="q01"`…`q16`). The
"send it" button is a `type="button"` no-op; when a destination exists, give the form a
handler in `main.js` part 2 (or a real `action`) and flip the button to
`type="submit"`.

**Add a contact channel.** The footer's address is the `.footer-mail` link in both HTML
files; change the `href` and text in each.

---

## 8. Checklist before pushing

1. Serve the site locally and load **both pages**: navigation works both ways, the current
   page's nav item is cyan, "give us money" opens the modal and it closes from the corner ×,
   Escape and a click outside, the strip drifts and loops, hover pauses it, the chevrons
   step one picture at a time, the thumbnails centre their picture, and a short click on a
   picture (or its label) opens the preview. On the front page, "fill it out" opens the
   questionnaire and its × closes it.
2. Resize the window down to phone width. Confirm everything stacks, the nav wraps onto its
   own row, and nothing is clipped or scrolls sideways.
3. If you touched a script, run `node --check` on it to catch syntax slips.
4. If you changed `style.css` or `main.js`, bump the `?v=` on both links in **both**
   HTML files.
5. Commit and push. GitHub Pages redeploys on its own.
