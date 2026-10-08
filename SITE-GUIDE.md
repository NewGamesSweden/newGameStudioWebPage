# NewGameStudio website: the complete guide

This is the long version of `README.md`. It explains what the site is made of, how every
page works, where each piece lives and how to change it. Read `README.md` first if you only
want to get it running.

Everything here was checked against the code on 7 October 2026, after the site became one
page — the studio timeline on `index.html` (GitHub Pages serves `index.html` at `/`, so the
site had to *be* that file), with the Gallery game folded into the end of the timeline and
`gallery.html` retired — the coffee
page had earlier been folded into
a "give us money" modal that opens from the nav (and the 3D mug went with it),
the carousel was rebuilt as an endlessly drifting filmstrip, and a help-us-test section with
a playtest questionnaire modal joined the page.

---

## 1. What this is

A small static website for NewGameStudio, the studio run by Daniel, Ahmed and Micky. One
page: the studio hero, a dated timeline of the studio's story (july → october 2026), and the
first game (Gallery) at the end of it with its development carousel and a help-us-test
section. "give us money" in the nav opens a donation modal; the nav's "gallery" link scrolls
down to the game; its questionnaire button opens a playtest modal.

Technical shape:

- Plain HTML, CSS and JavaScript. No framework, no bundler, no package manager, no build step.
- One HTML file, one stylesheet, one ordinary script. That's all.
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
| `index.html` | The whole site: the hero, the july–october studio timeline, and the Gallery game finale (game card, carousel, help-us-test). GitHub Pages serves this at `/`. |
| `style.css` | All styling, in numbered sections. Colours and fonts at the top, screen-size rules near the bottom. |
| `main.js` | The money modal, the playtest modal, the filmstrip carousel, the image preview dialog and the september moments cycle. Each part is guarded on its element existing. Settings at the top. |
| `assets/` | Every image on the site: the main-menu backdrop behind the Gallery card, the baked `gallery-title-ink.svg` wordmark, the fools banner, the open-beta photo, the september lantern shot, three avatar portraits, seventeen carousel images. |
| `tools/` | One-off build tools, never shipped with the site. `bake-title-ink.html` + `bake-title-ink.py` regenerate the Gallery title's ink-outlined wordmark (see section 5.2). |
| `README.md` | Short getting-started guide. |
| `NewGameStudio.code-workspace` | VS Code workspace shortcut. Optional. |

---

## 4. How the page loads

The page links `style.css` and loads `main.js` just before `</body>`. The `?v=` on both
links busts caches — bump them whenever either file changes.

`main.js` wires the money modal (section 5.6 below), the playtest modal (section 5.5), the
carousel and the image preview dialog (sections 5.3 and 5.8). Each part is guarded on its
element existing, so a missing piece just no-ops. No other scripts.

---

## 5. The pages, section by section

The section numbers below match the comments in the HTML files.

### 5.1 Header

Sticky bar with the wordmark and the navigation: "gallery" (an anchor to `#gallery` at the
end of the timeline — it smooth-scrolls there, and `scroll-padding-top` keeps the heading
clear of the sticky bar), and "give us money ↗" — a bordered `<button>` that opens the
money modal (section 5.6), not a link. The site is one page, so there is no home item and
no active-page dot; the wordmark is the way home. On phones the nav wraps to a
second row under the logo; both items stay visible.

**The logo is the way home.** The wordmark ("NewGameStudio", "Game" in cyan) is a link to
`index.html` — the wordmark is the way home.
Beside it sits the studio's one-liner, "three fools making games",
in the small secondary style (`--muted`, 14px); hidden on phones.

**The brand yields to the hero.** While the page hero (the tilted wordmark) is on screen,
the header's own wordmark and one-liner fade out — the same words twice on one screen
looks like a bug. main.js §6 toggles `.at-hero` on the header with an IntersectionObserver
on `.ngs-hero` (the hero moved into the fools box but kept its class, so the fade follows
it); CSS transitions opacity + visibility over .25s and keeps the layout space,
so the nav links never shift (visibility also drops the hidden brand from the tab/a11y
order). Under reduced motion the global transition kill makes the swap instant. With no
JS, the class is never added and the brand simply stays.

Where: `index.html` section 1, `style.css` section 3.

### 5.2 The Gallery card (`index.html`, the `#gallery` block)

One row on the card: the game's name and its one-line pitch on the left, the "Play for free"
button on the right, all centred vertically. The card opens the gallery finale — a centred
860px column (`.ngs-gallery`) at the end of the timeline; spacing above it comes from the
timeline bands, not section padding. The
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

Where: `index.html` (the `#gallery` block), `style.css` section 4, `tools/` for the title bake.

### 5.3 The development carousel (`index.html`, the `#gallery` block)

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
  scroll position back one copy width each time it crosses the seam (the strip's home
  range is `[0, loopWidth)`; only a rubber-band overscroll can leave it, and that gets
  folded back in). Content at `s` and at `s + loopWidth` is pixel-identical, so the wrap
  is invisible, in either direction.
- **It boots immediately.** The slide images wear `width`/`height` attributes (aspect-ratio
  boxes, like every other image on the page), so the strip's geometry is exact before any
  pixels arrive — the carousel, its drift and its chevrons never wait on the network. The
  strip sits below the browser's lazy-load line, so at page open no slide has even been
  requested; loading them later only triggers a re-measure.
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

Where: `index.html` (the `#gallery` block), `style.css` section 4, `main.js` part 3.

### 5.4 The NGS timeline (`index.html` section 2)

The studio itself, told as a **timeline**: the fools box → five dated entries → the gallery
finale, strung on one continuous cyan line, all inside `.wrap`. The line grows out of the
**fools box** — a date section's content without the date, surrounded by the line itself:
the tilted wordmark in the box's top-left corner, the heading "three *fools* making games"
("fools" cyan), the third-person caption, the iteration paragraph ("we've naturally fallen
into a fast iteration way of working…") with the quoted "Just IMPLEMENT" line on its own,
and the
**fools list** (three names, round avatar portrait and grey one-liner each; the rows keep
their own left alignment inside the centred 700px content column). Every entry's content block is
explicitly **half the wrap** wide — twice the old quarter — offset by a quarter-column
(`margin-left: 12.5%` on `--left` entries, `37.5%` on `--right`), so the block stays centred
on its landing: the line meets the middle of every block, and plain margins mean nothing
ever extends past the wrap.

- **The hero.** The wordmark itself — "NewGameStudio" with "Game" in cyan, in Space Grotesk
  700 at `clamp(34px, 7vw, 88px)` (the 34px floor is the smallest that still fits a 390px
  phone) — tilted −4° into the fools box's top-left corner (absolute, `top: -18px`,
  `left: 24px`, rotation about the top-left origin so nothing overflows left). The box's
  surround stops short of the text on both sides — the path's gap ends (top edge at 75%,
  left edge at 16%) clear the wordmark at every width; when the font clamp caps, the text
  run fills ~71% of the box. The section's 120px top padding keeps the tilted hero clear of
  the sticky header.
  On phones the surround hides (like every line) and the smaller hero stays tilted.
- **The fools box.** `.fools-intro` is `min(960px, the wrap)`, centred — so its x=50% still
  lines up with every connector's 50% — while the captions/list stay a centred 700px column.
  The **surround** (`.ngs-surround`) is an absolutely positioned svg in the connectors'
  stretched-viewBox language, `height: calc(100% + 48px)`: three rounded sides, and a
  bottom centre that **funnels** — both halves of the bottom edge curve down and meet at
  one point, no perpendicular junction — into the tip snake-1 starts from. The contract:
  the intro's `margin-bottom`, the surround's `+48px` and snake-1's `M50 0` are one
  agreement; change them together.
- **The line.** Decorative inline SVGs (`aria-hidden`, `pointer-events: none`) that are
  **normal-flow blocks** — an svg with `display: block; width: 100%; height: Xpx` simply IS
  a band in the page flow, so every line lands on whatever the flow puts under it. No
  absolute positioning, no paired padding/margin contract — the surround is the one
  exception (it must wrap fluid content, so it stretches over the box instead). Two
  shapes: the `--snake` (203px: down, a curved turn, down into an entry — landing at 37.5%
  (left entries) or 62.5% (right entries) of the wrap, or back to 50% for the finale), and
  the `--tail` (28px vertical that continues below
  the date to the entry's top). Corners are quadratic arcs with per-axis radii (1.3 x-units,
  8 y-units ≈ a 16px corner) because the stretched viewBox scales x and y differently. The
  stroke is 2px cyan via `vector-effect: non-scaling-stroke`.
- **The dates.** Small grey lowercase labels ("july 2026", "august 2026", "the following
  moment 2026", "september 2026", "october 2026") that sit ON the line:
  `width: max-content; transform: translateX(-50%)`
  with `margin-left` equal to the snake's landing x — **37.5% (`--left`), 62.5%
  (`--right`) or 50% (`--centre`); change them together.** Each band totals the 264px
  rhythm: 203 snake + ~33 date + 28 tail. On phones the svgs hide and the dates stay as
  plain left-aligned labels above their entries.
- **The entries.** Each holds one `.ngs-block`: half the wrap wide, centred text, offset by
  `margin-left: 12.5%` (`--left` entries) or `37.5%` (`--right` entries) so its centre sits
  on the line's landing. On phones the block goes full width and the offset resets to 0.
  Entries:
  - **july 2026** (left): the heading "the *blood pact* is signed. We begin with *Gallery*"
    ("blood pact" cyan, "Gallery" in `.gallery-word` — UnifrakturCook 700, the wordmark's own
    blackletter, at 1em of the title) with the group photo under it
    (`assets/fools-banner.jpg`).
  - **august 2026** (right): the quotation ""I think by *early October* we should be able
    to post it somewhere"" ("early October" cyan) with the thumbs-up photo under it
    (`assets/open-beta.jpg`).
  - **the following moment 2026** (left): no words — just the lantern picture
    (`assets/september-lantern.jpg`), capped at 300px tall so the section matches the
    others.
  - **september 2026** (right): no words either — the **moments frame** (`.ngs-moment`): a
    fixed-height 300px box (260 on phones) that cycles quickly through the baked
    `assets/moment-01…86.jpg` frames, one visible at a time (`.moment-on`), each capped to
    the frame (never cropped or upscaled, so different shapes read as the same size). The
    frames are baked by `tools/bake-moment-frames.py` from the source screenshots folder
    (edit its `EXCLUDE` list to drop more); the cycle runs in main.js (`MOMENT_MS`) and
    honours reduced motion by keeping the first frame static. The cycle also waits for
    its pictures: an unloaded frame would paint an empty box, so main.js only starts
    flipping once every frame is fetched and decoded (it forces the fetches as the
    reader approaches the section). Until then the first frame sits still, exactly like
    reduced motion. The frame's fixed height
    means the cycle can never reflow the bands.
  - **october 2026** (centre): the gallery finale — `.ngs-gallery` (`#gallery`), a centred
    860px column holding the whole game: the card, the carousel and help-us-test (5.2, 5.3,
    5.5).
  - Photos sit in-flow under their headings (`.ngs-photo`, `height: auto`), so each row's
    height is whatever its content needs and the bands above and below land on the entry's
    flow edges — nothing to hand-tune.

**Add a timeline entry:** copy one "snake svg + date + tail svg + `.ngs-entry`" group in
`index.html` section 2, alternating `--left`/`--right` (or `--centre`); pick the date's
modifier to match the side the line lands on, and extend a snake's path if you need a new
landing x (keep the date's `margin-left` equal to it).

Where: `index.html` section 2, `style.css` section 5.

### 5.5 Help us test + the playtest modal (`index.html`, the `#gallery` block)

Below the carousel, styled exactly like the NGS page content: the heading "help us *test*"
(the span in cyan), the caption "we've just sort of 'released' an open beta for Gallery, so
play the shit out of it and fill this thing out:", then a "questionnaire ↗" button reusing
the nav button's `.nav-money` class (its hover rule was un-scoped from the nav for this). The
button opens the questionnaire (`#test`), a native `<dialog>` in the money modal's exact style —
same box, title ("we need you to *fill* this out", "fill" cyan), lede, and corner ×. Inside,
sixteen open questions (`label.test-q` with a muted question line and a textarea each) scroll
inside a fixed-height `.test-form`, so the header and the × stay visible while the list
scrolls. The "send it" button is a deliberate no-op (`type="button"`, no handler): responses
will be wired to somewhere real later. Closes the same three ways as the money modal.

Where: `index.html` (the `#gallery` block and `#test`), `style.css` sections 5 (`.help-test`) and 7
(`dialog#test`, `.test-form`, `.test-q`), `main.js` part 2.

### 5.6 The money modal

The nav's "give us money ↗" is a button, not a link. Clicking it opens a small native
`<dialog>` (`#money`) in the browser's top layer, above everything including the sticky
header, over a dimmed backdrop. Text only, in the usual panel colours — no orange: the title
"Gallery is free" (Space Grotesk, 34px), then the lede in two lines (18px) — "but if you're
rich as hell," / "we'd like several million euros please" — with "rich as hell" and "several
million euros" in cyan (`.money-hot`), then "donation link coming soon. You can still mail us
cash or other valuables" (14px, muted). Closing is a small × in the dialog's top-right corner
(`.money-close`, grey, cyan on hover — it overrides the shared dialog-button rule). It closes
on the ×, Escape, or a click on the dimmed background (the shared `closeOnOutsideClick` helper
in `main.js`).

Where: `index.html`, `style.css` section 7, `main.js` part 1.

### 5.7 Footer

Three parts on one grid row: the wordmark at the left edge, the credit dead-centre
("made with love by daniel, ahmed & micky." with the year under it — `1fr auto 1fr` columns
make the middle truly centred however wide the sides are), and the contact address
(`contact@newgamestudio.com`, a `mailto:` link, muted, cyan on hover) at the right edge. On
phones they stack centred: logo, then credit, then address.

Where: `index.html`, `style.css` section 6.

### 5.8 Image preview dialog

A native `<dialog>` that opens on a short press on any picture in the strip (or Enter/Space
on the focused carousel). Shows the picture full size with its `data-title` caption. Closes
with the Close button, Escape, or a click outside the box. While it is open the strip's drift
pauses.

Where: `index.html`, `style.css` section 7, `main.js` part 4.

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
| `--cyan` | Accent 1: links, highlights, buttons, list rules |
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
| 700px and below (phone) | Everything stacks: the timeline entries go full width, the Gallery card (copy, then button), the carousel. The header tagline hides; the nav wraps to a second row under the logo, all three items visible. |

### Reduced motion

When the visitor's system asks for reduced motion: no smooth scrolling, no CSS transitions or
animations, and the carousel does not drift on its own (arrows jump instantly, manual
scrolling still works).

---

## 7. Common tasks

**Change any text.** Edit `index.html`. Sections are numbered and commented.

**Add a carousel image.** Drop the file in `assets/`. In `index.html`, inside the block marked
`SLIDES`, copy one `<div class="slide">` block and change `src`, `alt` and `data-title`.
The loop and the thumbnails pick it up automatically.

**Change the Play Gallery link.** Edit the `href` on the `play-gallery` button in `index.html`'s
`#gallery` block.

**Re-bake the Gallery title.** The wordmark is generated, never hand-edited: edit the
`fillText` call in `tools/bake-title-ink.html`, run `python3 tools/bake-title-ink.py`
(it needs the machine-local headless Chrome the path at its top points to, plus network for
the font), and it overwrites `assets/gallery-title-ink.svg` and prints the CSS sizing
numbers — paste those into `.game-title img` and the img's `width`/`height` attributes in
`index.html`, then bump the `?v=` on the img's `src` (and on the `style.css`/`main.js`
links if those changed too).

**Make the donation link real.** The money modal's "donation link coming soon" sentence lives
in the money dialog in `index.html`. Replace the sentence with a link (or point it
somewhere new).

**Tune the carousel.** `AUTO_SCROLL_PX_PER_S` (the drift speed) and `SWIPE_DISTANCE_PX`
(click threshold) sit at the top of `main.js`; the chevron buttons' size, inset and colours
are the `.strip-arrow` rules in `style.css` section 4.

**Wire up the questionnaire.** The playtest form's sixteen questions live in the `#test`
dialog in `index.html` (one `label.test-q` per question, `name="q01"`…`q16`). The
"send it" button is a `type="button"` no-op; when a destination exists, give the form a
handler in `main.js` part 2 (or a real `action`) and flip the button to
`type="submit"`.

**Add a contact channel.** The footer's address is the `.footer-mail` link in `index.html`;
change the `href` and text.

---

## 8. Checklist before pushing

1. Serve the site locally and load the page: the nav's "gallery" link scrolls to the game,
   "give us money" opens the modal and it closes from the corner ×,
   Escape and a click outside, the strip drifts and loops, hover pauses it, the chevrons
   step one picture at a time, the thumbnails centre their picture, and a short click on a
   picture (or its label) opens the preview. The "questionnaire" button opens the
   playtest modal and its × closes it.
2. Resize the window down to phone width. Confirm everything stacks, the nav wraps onto its
   own row, and nothing is clipped or scrolls sideways.
3. If you touched a script, run `node --check` on it to catch syntax slips.
4. If you changed `style.css` or `main.js`, bump the `?v=` on both links.
5. Commit and push. GitHub Pages redeploys on its own.
