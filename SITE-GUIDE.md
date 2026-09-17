# NewGameStudio website: the complete guide

This is the long version of `README.md`. It explains what the site is made of, how every
section works, where each piece lives and how to change it. Read `README.md` first if you only
want to get it running.

Everything here was checked against the code on 17 September 2026, after the rocket
sequence was added: the shelf rocket leaves the workshop as you scroll and comes back in the
workbench section to push SCOPE off the page and carry the two other games in.

---

## 1. What this is

A one-page static website for NewGameStudio, the studio run by Daniel, Ahmed and Micky.
The studio comes first, with the workshop picture and the word SCOPE that drifts over it now
and then. Then the first game (Gallery) with a drawable practice easel, the two other games in
production, the team, and a full-width "buy us coffee" band with an interactive 3D mug.

Technical shape:

- Plain HTML, CSS and JavaScript. No framework, no bundler, no package manager, no build step.
- One HTML file, one stylesheet, four ordinary scripts and two ES module folders (easel, mug).
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
| `main.js` | Carousel, image preview dialog and the logo tooltip joke. Timing settings at the top. |
| `workshop-scope.js` | The SCOPE thought over the workshop picture: when it appears and where. Settings at the top. |
| `rocket.js` | The rocket: the hero launch and the workbench scroll scene. One controller, settings at the top. |
| `surface.js` | The decorative folding-triangle background. Desktop with a mouse only. Safe to delete. |
| `assets/` | Every image on the page: the transparent workshop (`workshop.webp`, no rocket on its shelf), the rocket pictures (`rocket.webp` upright, `rocket-side.webp` side-on), team photo, twelve carousel images. |
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
3. `main.js` runs (carousel, dialog, logo joke).
4. `surface.js` runs (background effect, if the device qualifies).
5. `workshop-scope.js` runs (the SCOPE thought, once the workshop picture is on screen).
6. `rocket.js` runs. Once the shelf rocket picture has loaded it takes over the sprite for the
   scroll flight, and once `assets/rocket-side.webp` has loaded it turns the workbench section
   into the scroll scene, on wide screens without reduced motion.
7. A small inline module imports `gallery/practice-easel.js` and mounts the easel into
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

### 5.2 Hero, with the workshop picture

Two columns that share a floor. The left column holds everything the studio has to say:
eyebrow, the headline ("Three fools. Too many ideas. One more late night."), the intro line,
the two calls to action (Explore Gallery, Meet the fools) side by side, the small "free to
play" note and the closing "Independent games. Questionable bedtimes." line. The right column
holds the workshop illustration, its feet level with that last line, so it rises alongside the
lower part of the headline without touching the text. At 1440 by 900 the whole group and the
whole picture fit on the first screen.

The picture is `assets/workshop.webp`, the workshop scene with its background removed, so it
sits straight on the page with a soft drop shadow. Its shelf is empty in the file: the small
rocket standing there is a separate picture (`assets/rocket.webp`) parked by the `.rocket-flyer`
rule in `style.css` section 4, so it is there without JavaScript too. There is nothing to click
on the picture.

**The launch.** As you scroll, `rocket.js` lifts that shelf rocket off with its engine lit,
leans it well over to the right and dips it out past the right edge before the Gallery section
reaches the header, so it never covers the headline, the navigation or the easel. The motion
eases toward the scroll position over about a tenth of a second, so wheel notches glide. With
reduced motion, or if the rocket picture fails to load, it simply stays on the shelf. The flight is a pure function of the scroll position: scrolling back brings it
back, and a page opened further down never shows it. If either file is missing, the picture
stays as it is and nothing flies. The rocket returns in the workbench section (5.5).

On phones the order is eyebrow, headline, picture, then the intro and buttons.

Where: `index.html` section 2, `style.css` section 4 (`.rocket-flyer`), `rocket.js` part 1.

### 5.3 The SCOPE thought

The running joke lives over the workshop picture instead of in its own section. Every so
often a small SCOPE appears in the air above the developers, inflates in two comical spurts to
about three times its size, pops, and a sheepish little "scope." takes its place before fading.
About one time in three a small orange "just one more feature" afterthought follows.

| When | What happens |
| --- | --- |
| Picture scrolls into view | 4.5 quiet seconds first. |
| One appearance | 4 seconds: small thought, two growth spurts, pop, sheepish "scope.", fade. |
| Between appearances | 10.5 to 18 quiet seconds, so one thought every 14.5 to 22 seconds. |
| Picture off screen, tab hidden | Nothing plays. It starts over when the picture comes back. |

It picks one of three curated spots each time, never the same one twice in a row. The spots
are percentages of the picture and sit above the desk, away from the faces and screens, and
low enough that the biggest pose stays clear of the headline just above the picture.

Pointing the mouse at the word while it is up brings out the afterthought once, a nod to the
logo's own scope joke. Otherwise it is decorative only: nothing to click, no sound, no layout
change, hidden from assistive technology. With "reduce motion" on it shows as one small, faint,
still "scope." instead.

Where: `index.html` section 2 (the `scope-cloud` element inside the picture wrapper),
`style.css` section 4b (the keyframes), `workshop-scope.js` (timing and spots).

### 5.4 Gallery, with the practice easel

One composition built around the easel. There is no separate section heading; the game's own
heading does that job. Three parts:

**The practice easel** (left, 55% on desktop). A 3D easel standing straight on the page, no box
or border, seen from a fixed camera a little to the left and above, so the canvas faces inward
toward the text. Press and drag on its canvas to draw. Right under its feet: "Go on. Draw
something." and a Reset button. Described in full in section 6 below.

**The game** (right, 45%, vertically centred on the easel). The small label "GALLERY / FREE
BROWSER GAME", the heading "Less talking. More drawing.", the tagline "Bring your friends. Make
your mark.", two short descriptive lines (one of them explaining that this easel is the
practice one), and the "Play Gallery" button, which links to https://gallery.newgamestudio.com/.

**The development carousel** (full width below, under the heading "It didn't start like
this."). Twelve images tracing Gallery from layout studies to a playable browser build. The
image sits on a dark card pinned up slightly askew. Directly under it, one row: the previous
arrow, caption and count, the next arrow, then the "Auto-play screenshots" switch. Under that,
one horizontal strip of thumbnails that scrolls sideways when it runs out of room; the current
one has a cyan edge and is scrolled into view. Each image is a `<div class="slide">` with a
`data-title` caption; `main.js` builds the thumbnails, counter and accessibility labels from
that list.

Carousel behaviour:

- Browsing is manual by default. "Auto-play screenshots" runs the sequence every 4.5 seconds
  (`AUTOPLAY_INTERVAL_MS`); while running it reads "Pause auto-play" and is marked pressed.
- While playing, it pauses automatically when the mouse is over it, when anything inside has
  focus, when the tab is hidden, when it is scrolled off screen, or when the preview dialog is
  open.
- Any manual navigation (arrows, thumbnails, keyboard, swipe) stops autoplay until the switch
  is pressed again.
- Left and right arrow keys work when the carousel is focused. Touch swipes of 45px or more
  (`SWIPE_DISTANCE_PX`) change the slide.
- The ↗ button opens the current image in the preview dialog.

On phones the order is: the game text with its Play Gallery button, then the easel, then the
carousel with its controls and thumbnail strip.

Where: `index.html` section 3, `style.css` section 5, `main.js` part 1, `gallery/`.

### 5.5 Also on the workbench

The rocket's return. On desktop, with motion allowed and `assets/rocket-side.webp` loaded,
`rocket.js` turns the section into a scroll scene: the section becomes about twice the height
of the viewport and a stage the height of the viewport (minus the header) sticks while you
scroll through it. Progress through that scroll drives everything:

| Progress | What happens |
| --- | --- |
| 0 to 12% | The stage with the small "Also on the workbench" label and a small SCOPE already sitting in the middle. |
| 12 to 45% | SCOPE grows to 80% of the page column, expanding equally to both sides. |
| 45 to 62% | SCOPE holds. The rocket's nose peeks in from the right edge of the viewport, pointing left. |
| 62 to 82% | The rocket travels left. The moment its nose reaches the word's right edge, SCOPE is shoved along with it, tilting and squashing a little, and leaves past the left edge. |
| 82 to 100% | The rocket settles centred and the copy fades in on its cream hull. Then the stage releases and the page scrolls on. |

The stage spans the whole viewport during the scene so the rocket really comes in from the edge;
SCOPE and the rocket themselves are sized to the 1280px page column. SCOPE is laid out at its
full size and only ever scaled down, which keeps it crisp and cheap to animate. Like the
launch, the scene eases toward the scroll position over about a tenth of a second.

The copy is ordinary HTML text laid over the hull: the heading and intro near the nose, one
project per panel behind it. It stays horizontal while the rocket moves and remains readable
once the section has scrolled on. The hull's position on the picture is set by the
`--hull-left`, `--hull-right` and `--hull-middle` variables in `style.css` section 5b; measure
them again if the rocket picture changes.

Everywhere else (phones, reduced motion, no JavaScript, or a rocket picture that failed to
load) the section is plain: the label, a small rocket picture, then the heading, intro and the
two entries, each a title, one sentence and "In development". Nothing decorative is in the
accessibility tree; the heading and entries always are. The hero's own small SCOPE thought
only ever plays while the workshop picture is on screen, so the two jokes never overlap.

Reverse scrolling, fast scrolling, resizing, reloading mid-scene and arriving by the
`#workbench` anchor all land in the right state because the scene is computed from the scroll
position alone.

Where: `index.html` section 4, `style.css` section 5b, `rocket.js` part 2.

### 5.6 The fools

The team photo (`assets/team.jpg`), large and pinned up slightly askew, beside the team block:
eyebrow, heading ("Who thought this was a good idea? All three of us."), a short introduction,
the three names and a closing line. No box or band around the section; it sits straight on the
page with modest room above and below. The names are listed, not matched to positions in the
photo.

Where: `index.html` section 5, `style.css` section 6.

### 5.7 Coffee

A full-width orange band, its content lined up with the page column: copy on the left, the 3D
mug in the middle with "Click to sip · Drag to spin" under it, and "REFILL THE DEVS ☕" right
beside it so the two read as one interaction. The mug stands mostly inside the band; only its
rim and steam cross the top edge on desktop and tablet. Nothing is shown while the mug loads;
the status line under it is for screen readers only, except in the no-3D fallback where it
explains itself. The mug's behaviour is unchanged and described in section 7 below. The donation
label becomes a real link only when `DONATION_URL` is set in `coffee/coffee-mug.js`. On phones
the copy, the mug and the refill label stack.

Where: `index.html` section 6, `style.css` section 7, `coffee/coffee-mug.js`.

### 5.8 Footer

Logo (with the same joke), a "Made after bedtime" credit with the year, and a "Back to top" link.

Where: `index.html` section 7, `style.css` section 8.

### 5.9 Image preview dialog

A native `<dialog>` that opens from the carousel's ↗ button. Shows the current image full size
with its caption. Closes with the Close button, Escape, or a click outside the box. The
carousel pauses while it is open.

Where: `index.html` section 8, `style.css` section 9, `main.js` part 2.

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
seen from slightly left and above so the canvas faces inward toward the Gallery text: the
canvas's left edge is nearer the camera and draws taller, which is how to check the direction
in the browser. A long lens keeps the perspective gentle. The canvas fills about two thirds of
the height, with the tray, lower beam and legs beneath it. There is no box behind it; the page
shows through. The camera never moves and the easel never rotates.

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
| `CAMERA_FOV`, `CAMERA_DIRECTION`, `FRAME_MARGIN`, `LOOK_DROP` | Framing. `CAMERA_DIRECTION` is `[-0.22, 0.10, 1]` (from the left), `CAMERA_FOV` 20, `FRAME_MARGIN` 1.5 and `LOOK_DROP` 0.12. Raise the margin a little if something important gets clipped. |

### Testing in the browser

With the site served locally, open the console:

```js
practiceEasel.mode    // '3d', 'flat' or 'static'
practiceEasel.reset()
```

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

A small "Click to sip · Drag to spin" hint sits under the mug.

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
| `--panel` | Carousel buttons and the preview dialog |
| `--ink` | Main text, warm off-white |
| `--muted` | Secondary text |
| `--cyan` | Accent 1: links, highlights, buttons, the first workbench rule |
| `--orange` | Accent 2: the coffee band, workbench status, the small "scope…" echo |
| `--line` | Borders |

### Type

Space Grotesk for headings, labels and the SCOPE thought; DM Sans for body text. Both from
Google Fonts. Section headings are all in the 34 to 56px range and the hero headline tops out
at 70px, so no one heading shouts over the rest.

### Spacing

One scale: 8, 16, 24, 32, 40, 56, 64px. Things that belong together sit 8 to 32px apart;
56 and 64px are reserved for the gaps between sections. Asymmetry comes from proportions
(55/45 in the Gallery, 5/7 in the workbench, a narrower second workbench entry) rather than
from odd margins.

### Screen sizes

| Breakpoint | Behaviour |
| --- | --- |
| Desktop | The hero headline scales with the window up to 70px. Content is limited to a 1280px column; the coffee band runs edge to edge with its content on that column. |
| 1000px and below (tablet) | Hero columns go 50/50, tighter gaps, shorter carousel image, workbench copy stacks under the rocket picture, smaller mug |
| 820px and below (tablet held upright) | The coffee copy takes the full width of the band, with the mug and refill label side by side beneath it |
| 700px and below (phone) | Everything stacks. Hero picture comes right after the headline. Game text comes before the easel. No rocket scene: a small rocket picture, then the workbench copy. "Buy us coffee" nav link hidden. |

### Reduced motion

When the visitor's system asks for reduced motion: no smooth scrolling, no CSS transitions or
animations (the SCOPE thought shows as one small still "scope."), no carousel autoplay, no
background effect, no mug spin, splash or steam drift, and no rocket: the hero picture keeps its
shelf rocket and the workbench shows its plain layout. Drawing on the easel still works; it is input, not animation.

---

## 9. Common tasks

**Change any text.** Edit `index.html`. Sections are numbered and commented.

**Move the SCOPE thought.** In `workshop-scope.js`, `POSITIONS` are percentages of the
workshop picture's width and height. Keep them in the air above the desk, away from faces and
screens, and check the biggest pose at a wide window so it stays clear of the headline.

**Change how often SCOPE appears.** The delays and the echo chance are the settings at the top
of `workshop-scope.js`.

**Change the SCOPE movement.** The keyframes are in `style.css` section 4b. If you change the
4s duration there, change `SEQUENCE_MS` in `workshop-scope.js` to match.

**Add a carousel image.** Drop the file in `assets/`. In `index.html`, inside the block marked
`SLIDES`, copy one `<div class="slide">` block and change `src`, `alt` and `data-title`.

**Autoplay the carousel on load.** In `main.js`, set `playing` to `true` near the top of part 1.
The "Auto-play screenshots" switch then starts pressed.

**Change the Play Gallery link.** Edit the `href` on the `play-gallery` button in `index.html`
section 3.

**Make "Refill the devs" a real link.** Paste the URL into `DONATION_URL` in
`coffee/coffee-mug.js`.

**Replace the easel model.** Overwrite `gallery/easel-with-canvas.glb`, keeping a node named
`easelCanvas` (or change `CANVAS_NODE`). Its local +Z must be the front of the canvas.

**Replace the mug model.** Overwrite `coffee/workshop-mug-with-steam.glb`, keeping the node
names listed in section 7.

**Add a picture to a workbench game.** Only once the game has art of its own. Add an `<img>`
inside that list item and give it a rule in `style.css` section 5b.

**Replace the rocket art.** Three files in `assets/`: `workshop.webp` (the workshop with an
empty shelf, 1536 by 1024), `rocket.webp` (the upright rocket alone, transparent) and
`rocket-side.webp` (a long left-pointing rocket with a broad cream hull, currently 1921 by 819).
After swapping `rocket-side.webp`, measure the cream hull and update `--hull-left`,
`--hull-right` and `--hull-middle` in `style.css` section 5b; after swapping the workshop
picture, re-measure the shelf position in the `.rocket-flyer` rule in section 4.

**Move the shelf rocket.** The `.rocket-flyer` rule in `style.css` section 4 places it by
percentages of the workshop picture. In `rocket.js`, `FLIGHT_LIFT`, `MAX_BANK` and `BANK_BIAS`
shape the flight, `PHASE` holds the workbench timings and `SMOOTH_TIME` sets how quickly both
scenes catch up with the scroll (0 makes them instant).

**Replace the workshop picture.** Overwrite `assets/workshop.webp` with another 3:2 image with
a transparent background and an empty shelf, then check the SCOPE spots still sit in clear air
and the shelf rocket still stands on the shelf.

**Remove the background effect.** Delete the canvas line and the `surface.js` script tag from
`index.html`, then delete `surface.js`.

**Upgrade Three.js.** Replace the three files in `coffee/vendor/` with the same files from the
new version, all on one version, and re-apply the one import path change noted in
`coffee/vendor/README.md`. Both the easel and the mug use these files.

---

## 10. Checklist before pushing

1. Serve the site locally and load it once. Wait a few seconds on the hero: SCOPE inflates
   over the workshop and shrinks to "scope.". Scroll: the rocket lifts off the shelf and leaves
   right. Further down: the easel renders and takes a
   stroke, Reset clears it, the carousel arrows and auto-play switch work, SCOPE grows in the
   workbench and the rocket pushes it away, the copy reads on the hull, the mug spins and
   empties after three clicks.
2. Resize the window down to phone width. Confirm everything stacks and nothing is clipped or
   scrolls sideways.
3. Run the mug tests: `node --test "coffee/tests/*.test.mjs"`.
4. If you touched a script, run `node --check` on it to catch syntax slips.
5. Commit and push. GitHub Pages redeploys on its own.
