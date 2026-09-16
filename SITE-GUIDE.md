# NewGameStudio website: the complete guide

This is the long version of `README.md`. It explains what the site is made of, how every
section works, where each piece lives and how to change it. Read `README.md` first if you only
want to get it running.

Everything here was checked against the code on 16 September 2026, after the "scope got out of
hand" redesign.

---

## 1. What this is

A one-page static website for NewGameStudio, the studio run by Daniel, Ahmed and Micky.
The studio comes first, then the SCOPE joke, then the first game (Gallery) with a drawable
practice easel, the two other games in production, the team, and a "buy us coffee" support box
with an interactive 3D mug.

Technical shape:

- Plain HTML, CSS and JavaScript. No framework, no bundler, no package manager, no build step.
- One HTML file, one stylesheet, two ordinary scripts and two ES module folders (easel, mug).
- The only third-party code is Three.js, copied into the repository once under `coffee/vendor/`
  and shared by the easel and the mug. Fonts come from Google Fonts and fall back to system
  fonts offline.
- Hosted as static files. GitHub Pages is the intended host, but any static host works.

---

## 2. Running and publishing

### Run it locally

Open a terminal in the project folder and start any small web server, then open
http://127.0.0.1:8080 in a browser:

```powershell
py -m http.server 8080 --bind 127.0.0.1
```

Double-clicking `index.html` also works for everything except the two 3D pieces. Browsers
refuse to load ES modules and models straight from disk, so the easel shows a one-line note and
the coffee section falls back to a plain ☕. That is expected, not a bug.

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
| `index.html` | The whole page. All text lives here, split into numbered, commented sections. |
| `style.css` | All styling, in numbered sections. Colours and fonts at the top, screen-size rules near the bottom. |
| `main.js` | Carousel, image preview dialog, logo tooltip joke, and the one-shot SCOPE animation trigger. Timing settings at the top. |
| `surface.js` | The decorative folding-triangle background. Desktop with a mouse only. Safe to delete. |
| `assets/` | Every image on the page: hero art, team photo, twelve carousel images. |
| `gallery/practice-easel.js` | The drawable 3D easel: loads the model, paints, handles pointer input and fallbacks. Settings at the top. |
| `gallery/easel-with-canvas.glb` | The easel model, exported from Blender. |
| `coffee/` | The interactive 3D coffee mug. Model, behaviour, rules, tests, vendored Three.js. |
| `coffee/coffee-mug.js` | Loads and renders the mug, handles spin, drag, click, splash, keyboard and fallback. Settings at the top, including `DONATION_URL`. |
| `coffee/coffee-state.js` | The mug's rules with no graphics: sips left, click versus drag, liquid easing. |
| `coffee/tests/` | Node tests for those rules. |
| `coffee/vendor/` | Three.js r170 and its GLTF loader, plus the MIT licence. Used by both the easel and the mug. |
| `coffee/workshop-mug-with-steam.glb` | The mug model. |
| `coffee/kit/` | The original mug design kit. Not used by the site at runtime. |
| `coffee/README.md`, `coffee/IMPLEMENTATION-SPEC.md` | Mug-specific notes and the original brief. |
| `README.md` | Short getting-started guide. |
| `NewGameStudio.code-workspace` | VS Code workspace shortcut. Optional. |

---

## 4. How the page loads

1. `index.html` links `style.css` in the head.
2. Just before `</body>`, an import map tells the browser that `three` means
   `coffee/vendor/three.module.min.js`.
3. `main.js` runs (carousel, dialog, logo joke, SCOPE trigger).
4. `surface.js` runs (background effect, if the device qualifies).
5. A small inline module imports `gallery/practice-easel.js` and mounts the easel into
   `#practice-easel`, then imports `coffee/coffee-mug.js` and mounts the mug into `#coffee-mug`.
   If either import fails, the same inline code switches that piece to its fallback so the page
   never shows a stuck "loading" state.

The mounted pieces are exposed as `window.practiceEasel` and `window.coffeeMug` for testing in
the browser console.

---

## 5. The page, section by section

The section numbers below match the comments in `index.html`.

### 5.1 Header

Sticky bar with the logo and three navigation links: Games, The fools, Buy us coffee. The
links jump to sections on the same page. The "Buy us coffee" link is hidden on phones.

**Logo joke.** The logo is a button. Hovering or focusing it shows a tooltip that reads
"Dont work because of scope". Tapping it on touch devices shows the tooltip for a few seconds
(`LOGO_JOKE_VISIBLE_MS` in `main.js`). Escape or tapping elsewhere dismisses it. The same logo
and joke appear again in the footer. This is deliberate and should stay exactly as it is.

Where: `index.html` section 1, `style.css` section 3, `main.js` part 3.

### 5.2 Hero, with the workshop hotspots

The big headline ("Three fools. Too many ideas. One more late night."), an intro line, two
calls to action (Explore Gallery, Meet the fools), and the workshop illustration
(`assets/workshop.png`) with a small caption badge.

**Hotspots.** Three ordinary links sit over objects in the picture:

| Object in the picture | Label | Goes to |
| --- | --- | --- |
| The middle monitor showing Gallery | Gallery | The Gallery section |
| The white coffee mug on the desk | Coffee | The coffee section |
| The three people | The fools | The team section |

Each link is positioned by two percentages (`--x`, `--y`) set inline in `index.html`, inside a
wrapper that keeps the image's 3:2 shape, so the dots stay on their objects at any size. The
label appears on hover or keyboard focus. On devices without hover (phones, tablets) labels are
always visible. The dot has a 12px padding around it so it is comfortable to tap. The ordinary
navigation and hero buttons remain, so the hotspots are optional.

Where: `index.html` section 2, `style.css` section 4.

### 5.3 Scope

The memorable pause in the page. Lead-in "THE PLAN WAS SIMPLE.", heading "Scope is hard.",
then a stage with a dashed box labelled "THE ORIGINAL PLAN", the word SCOPE in orange with a
cyan O, and a cyan sticker "One more feature." Below, two lines of body text.

**Animation.** About 3.7 seconds, played once per page visit when the section scrolls into
view:

| Time | What happens |
| --- | --- |
| 0 to 0.45s | The word sits small and tidy inside the plan. |
| 0.45 to 1.7s | It grows in two awkward surges, briefly trying to fit again. |
| 1.7 to 2.5s | It bursts past the boundary. The O pops up, the E leans out, the rest wobble. The box strains and fades. |
| 2.5 to 3.25s | The letters settle into a readable, slightly crooked SCOPE. |
| 2.8 to 3.7s | The sticker lands. |
| After | Everything stays still. |

The markup in `index.html` is already the final pose. `main.js` adds the class `run` once,
which starts the keyframes in `style.css`. So without JavaScript, or with "reduce motion" on,
visitors see the same finished picture and the same text, just without the show. The stage has
`overflow: hidden` and the word is sized from the stage width, so the biggest pose never spills
into the page. The letters are decorative and hidden from assistive technology; the heading and
body are read once, normally. Scrolling back does not replay it.

Where: `index.html` section 3, `style.css` section 4b, `main.js` part 4.

### 5.4 Gallery, with the practice easel

Gallery is its own section, not the whole site's identity. Three parts:

**The practice easel** (left, about 60% on desktop). A 3D easel seen from a fixed, slightly
angled camera. Press and drag on its canvas to draw. Under it: "Go on. Draw something." and a
Reset button. Described in full in section 6 below.

**Gallery copy** (right). Title, tagline, description, a line explaining that this easel is
the practice one, and the "Play Gallery" label, which is deliberately not a link yet. A comment
above it shows the exact line to swap in when the game has a URL.

**The development carousel** (full width below). Twelve images tracing Gallery from layout
studies to a playable browser build. Image on the left, caption, arrows and a grid of
thumbnails on the right. Each image is a `<div class="slide">` with a `data-title` caption;
`main.js` builds the thumbnails, counter and accessibility labels from that list.

Carousel behaviour:

- Starts paused. The Play button in the corner runs the sequence every 4.5 seconds
  (`AUTOPLAY_INTERVAL_MS`).
- While playing, it pauses automatically when the mouse is over it, when anything inside has
  focus, when the tab is hidden, when it is scrolled off screen, or when the preview dialog is
  open.
- Any manual navigation (arrows, thumbnails, keyboard, swipe) stops autoplay until Play is
  pressed again.
- Left and right arrow keys work when the carousel is focused. Touch swipes of 45px or more
  (`SWIPE_DISTANCE_PX`) change the slide.
- The ↗ button opens the current image in the preview dialog.

On phones the order is: Gallery copy, then the easel, then the carousel stacked.

Where: `index.html` section 4, `style.css` section 5, `main.js` part 1, `gallery/`.

### 5.5 Also on the workbench

A plain numbered list, deliberately not another row of cards: the multiplayer project and the
single-player adventure, each with one sentence and an "In development" status. Both are real
and in production. Add an image to each only when a real matching asset exists.

Where: `index.html` section 5, `style.css` section 5b.

### 5.6 The fools

The team photo (`assets/team.jpg`) beside the team block: eyebrow, heading, a short
introduction, the three names and a closing line. The old scope copy that used to live here
now has its own section, so nothing is repeated.

Where: `index.html` section 6, `style.css` section 6.

### 5.7 Coffee

Unchanged by the redesign. The orange support box: copy on the left, the 3D mug in the middle,
"REFILL THE DEVS ☕" on the right. The mug is described in section 7 below. The donation label
becomes a real link only when `DONATION_URL` is set in `coffee/coffee-mug.js`.

Where: `index.html` section 7, `style.css` section 7, `coffee/coffee-mug.js`.

### 5.8 Footer

Logo (with the same joke), a "Made after bedtime" credit with the year, and a "Back to top" link.

Where: `index.html` section 8, `style.css` section 8.

### 5.9 Image preview dialog

A native `<dialog>` that opens from the carousel's ↗ button. Shows the current image full size
with its caption. Closes with the Close button, Escape, or a click outside the box. The
carousel pauses while it is open.

Where: `index.html` section 9, `style.css` section 9, `main.js` part 2.

### 5.10 Animated background

A full-screen canvas behind everything that draws a flat sheet of triangles which fold where
the mouse moves and flatten again after about three seconds. Runs only on devices with a mouse
and hover, never with reduced motion, never while the tab is hidden. To remove it, delete the
`<canvas class="origami-surface">` line and the `surface.js` script tag from `index.html`.

Where: `surface.js`, `style.css` section 10.

---

## 6. The practice easel in detail

### What the visitor sees

A wooden easel with a stretched canvas, lit warm with a cyan fill like the rest of the site,
seen from slightly right and above. The camera never moves and the easel never rotates.

### Behaviour

| Action | Result |
| --- | --- |
| Press and drag on the canvas | Draws with one dark, round brush. |
| Drag off the canvas edge | The stroke ends there. Coming back starts a fresh stroke, never a line across the canvas. |
| Second finger or right mouse button | Ignored while one pointer is drawing. |
| Reset | Clears this drawing only. |
| Scroll away and back | The drawing is still there. |
| Refresh | Blank canvas. Nothing is saved anywhere. |

There is no undo, palette, download, account or network. Touch drawing works because the
canvas element blocks browser panning over itself; the rest of the page scrolls normally.

### How it works

- The hidden `.easel-flat` canvas element is the paint buffer (768 by 1024 pixels, 3:4).
- In 3D, that buffer becomes a `CanvasTexture` on a thin plane that is a child of the model's
  `easelCanvas` node, sitting about a millimetre in front of its face and inset to 95% so the
  canvas edge stays visible. The model's own canvas box shares one primitive with its edges and
  uses default cube UVs, so painting straight onto it would smear; the plane avoids that.
- Only that plane is raycast. Hit UVs map straight to buffer pixels (checked with a corner-mark
  test on 16 September 2026: top-left lands top-left).
- Segments are drawn between sampled points, so fast strokes stay continuous. The texture is
  marked for update only when something changed.
- Frames are rendered only after a change, a resize, or when the section comes back on
  screen. A still easel costs nothing.

### Fallbacks

- **WebGL unavailable or model failed:** the paint buffer itself is shown flat, letterboxed
  with a wooden border, with the same drawing and the same Reset button.
- **Module failed to load** (for example the page was opened from disk): a one-line note
  replaces the stage. Reset is hidden.

### Settings you may want to change

All at the top of `gallery/practice-easel.js`:

| Setting | Meaning |
| --- | --- |
| `CANVAS_NODE` | Name of the model node that holds the canvas. Currently `easelCanvas`. |
| `BRUSH_PX`, `INK_COLOR`, `PAINT_COLOR` | Brush width, ink colour, blank canvas colour. |
| `PLANE_INSET`, `PLANE_LIFT` | How much of the canvas face is paintable and how far in front the plane sits. |
| `CAMERA_FOV`, `CAMERA_DIRECTION`, `FRAME_MARGIN`, `LOOK_DROP` | Framing. |

### Testing in the browser

With the site served locally, open the console:

```js
practiceEasel.mode                          // '3d', 'flat' or 'static'
practiceEasel.drawPath([[0.1, 0.1], [0.9, 0.9]])  // draws a diagonal, coordinates 0 to 1
practiceEasel.reset()
```

`drawPath` also exists so a real recorded drawing could be replayed one day. Nothing on the
page uses it.

---

## 7. The coffee mug in detail

Unchanged by the redesign.

### Behaviour

| Action | Result |
| --- | --- |
| Do nothing | The mug turns slowly on its own (`IDLE_SPIN_SPEED`). |
| Drag horizontally | The mug follows the pointer. On release it keeps the throw, then eases back to the slow idle spin in the direction it was thrown. |
| Spin fast | Three to five coffee droplets fly off the rim and fade. Cosmetic only. Never from an empty mug. |
| Click the ceramic | Takes a sip. Three sips empty the mug. Steam fades with the last sip. |
| Click an empty mug | Nothing. |
| Click the donation link (once live) | Refills the mug and opens the link. |
| Refresh the page | Mug starts full again. Sip state is never stored. |

Nothing on the page explains the sipping. It is meant to be discovered.

### Keyboard and screen readers

Enter or Space on the focused canvas sips; arrow keys nudge the mug. A visually hidden status
line announces sips left. With "reduce motion" on, the mug stands still and sips snap instantly.

### Files, settings and tests

Rules in `coffee/coffee-state.js`, graphics in `coffee/coffee-mug.js`, settings at the top of
that file (including `DONATION_URL`). The model must keep the node names `MugRoot`, `Mug_Body`,
`Mug_Handle`, `Mug_Accent`, `Coffee`, `Steam_1`, `Steam_2`, `Steam_3`.

```powershell
node --test "coffee/tests/*.test.mjs"
```

In the browser console: `coffeeMug.sips`, `coffeeMug.sip()`, `coffeeMug.refill()`.

---

## 8. Design system

### Colours

Defined once as variables in the `:root` block at the top of `style.css`:

| Variable | Use |
| --- | --- |
| `--bg` | Page background, deep navy |
| `--panel` | Cards and boxes |
| `--ink` | Main text, warm off-white |
| `--muted` | Secondary text |
| `--cyan` | Accent 1: links, highlights, the O in SCOPE, the sticker |
| `--orange` | Accent 2: SCOPE, the coffee box, workbench status |
| `--line` | Borders |

### Type

Space Grotesk for headings, labels and the SCOPE word; DM Sans for body text. Both from Google
Fonts.

### Screen sizes

| Breakpoint | Behaviour |
| --- | --- |
| 1550px and up | Larger hero headline |
| 1000px and below (tablet) | Tighter gaps, shorter carousel image, smaller mug |
| 700px and below (phone) | Everything stacks. Gallery copy comes before the easel. Carousel thumbnails become a scrolling strip. Workbench status drops under the title. "Buy us coffee" nav link hidden. |

### Reduced motion

When the visitor's system asks for reduced motion: no smooth scrolling, no CSS transitions or
animations (so SCOPE shows its final pose only), no carousel autoplay, no background effect, no
mug spin, splash or steam drift. Drawing on the easel still works; it is input, not animation.

---

## 9. Common tasks

**Change any text.** Edit `index.html`. Sections are numbered and commented.

**Move a hotspot.** In the hero markup, change the `--x` and `--y` percentages on that link.
Measure the object in `assets/workshop.png` as a percentage of the image width and height.

**Change the SCOPE choreography.** The keyframes are in `style.css` section 4b. The timing
(3.7s) is repeated on each `animation:` line. The trigger threshold is in `main.js` part 4.

**Add a carousel image.** Drop the file in `assets/`. In `index.html`, inside the block marked
`SLIDES`, copy one `<div class="slide">` block and change `src`, `alt` and `data-title`.

**Autoplay the carousel on load.** In `main.js`, set `playing` to `true` near the top of part 1.

**Make "Play Gallery" a real link.** Follow the comment above it in `index.html` section 4.

**Make "Refill the devs" a real link.** Paste the URL into `DONATION_URL` in
`coffee/coffee-mug.js`.

**Replace the easel model.** Overwrite `gallery/easel-with-canvas.glb`, keeping a node named
`easelCanvas` (or change `CANVAS_NODE`). Its local +Z must be the front of the canvas.

**Replace the mug model.** Overwrite `coffee/workshop-mug-with-steam.glb`, keeping the node
names listed in section 7.

**Add an image to a workbench game.** Only with a real asset. Add an `<img>` inside that list
item and give it a rule in `style.css` section 5b.

**Remove the background effect.** Delete the canvas line and the `surface.js` script tag from
`index.html`, then delete `surface.js`.

**Upgrade Three.js.** Replace the three files in `coffee/vendor/` with the same files from the
new version, all on one version, and re-apply the one import path change noted in
`coffee/vendor/README.md`. Both the easel and the mug use these files.

---

## 10. Checklist before pushing

1. Serve the site locally and load it once. Scroll down: SCOPE plays once, the easel renders
   and takes a stroke, Reset clears it, the mug spins.
2. Resize the window down to phone width. Confirm everything stacks, the SCOPE word stays
   inside the page and nothing is clipped.
3. Run the mug tests: `node --test "coffee/tests/*.test.mjs"`.
4. If you touched a script, run `node --check` on it to catch syntax slips.
5. Commit and push. GitHub Pages redeploys on its own.
