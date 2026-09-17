# Implement the interactive NewGameStudio coffee mug

## Task

Integrate the supplied low-poly coffee mug into the existing orange coffee/donation section of the NewGameStudio website. Build the working interaction, not a mockup. Preserve the surrounding design and existing website behaviour.

Read the repository's own instructions first. Inspect the actual project before choosing paths or dependencies. This website was originally plain HTML, CSS and JavaScript; do not migrate it to a framework just for this feature.

The owner is adding `NewGameStudio-coffee-kit.zip` to the repository. Locate and extract that kit if necessary. Do not assume it has already been extracted or invent a missing asset.

## Existing page context

The coffee section has:

- Section ID `coffee`.
- Orange background, dark text and the heading “Great ideas. Empty coffee cups.”
- A right-hand `.coffee-action` area with the “REFILL THE DEVS” label and a donation-link placeholder.
- Text explaining that donations are optional.

Place the interactive mug above the donation button in that right-hand area. Target roughly 300 × 300 CSS pixels on desktop, with responsive sizing on smaller screens. Keep the heading, paragraph, and optional-support note.

The source may live under `dist/` in the original checkout or at the project root in the downloadable export. Locate the actual `index.html`, `style.css`, `main.js`, `surface.js`, and `assets/` before editing. Preserve the Gallery carousel, sticky header, NewGameStudio logo joke, origami mouse background and footer year.

## Supplied kit

| File | Purpose |
| --- | --- |
| `workshop-mug.glb` | Self-contained mug model with materials and separate coffee/steam meshes |
| `coffee-controller.js` | Reference interaction logic; adapt and complete it for this repository |
| `setup_blender.py` | Imports the GLB into a new Blender scene and saves a `.blend` with lighting, camera and preview animation |
| `build_asset.py` | Regenerates the GLB using Python's standard library |
| `README.md` | Asset notes and proposed behaviour |

Model nodes:

- `MugRoot`
- `Mug_Body`
- `Mug_Handle`
- `Mug_Accent`
- `Coffee`
- `Steam_1`, `Steam_2`, `Steam_3`

The GLB uses Y-up coordinates. `Coffee` has its origin at the bottom and a local Y translation of 0.20. Lower its local Y scale to lower the liquid surface; retain its base translation. Hide the coffee mesh at empty. Preserve the node names if editing and re-exporting the asset.

### Asset readiness

This is an initial programmatically generated asset, not a Blender-rendered final. Its GLB structure and script syntax were checked, but Blender was unavailable during creation. Inspect it visually in Blender or the browser before calling the feature finished. Check face normals, the hollow interior, handle, liquid containment, steam transparency, and appearance from all allowed angles. Repair actual geometry/material defects if found.

Do not assume Blender smoke simulations or preview animations will automatically provide the required website behaviour. Drive the interactive coffee and steam state in the browser.

## Required state and behaviour

Use one authoritative integer `sipsRemaining`, initially `3`, and a separate animated display level.

| Action | Result |
| --- | --- |
| Initial page load | Full coffee; steam visible |
| First intentional mug click | 2 sips remain; liquid settles at approximately 2/3 |
| Second intentional mug click | 1 sip remains; liquid settles at approximately 1/3 |
| Third intentional mug click | Empty mug; liquid hidden; steam fades out |
| Additional mug clicks while empty | Remain empty |
| Donation-button activation | Refill to 3 sips and open the configured donation destination |
| Full page refresh | Reset to 3 sips |

Rules:

1. Each valid click consumes exactly one sip. Update the logical state immediately, even while the previous level transition is animating.
2. Animate toward the latest target level over approximately 300 to 450 ms. Rapid clicks must never create negative state or stale animation results.
3. Only donation-button activation or page refresh refills the mug. Do not add automatic refill, empty-mug refill, double-click refill, or a separate refill control.
4. Keep state in memory. Do not use localStorage, sessionStorage, cookies or backend persistence for coffee level.
5. Dragging, spinning, scrolling, preview resizing, tab changes, visibility changes and WebGL restoration must not reset or consume coffee.
6. Cosmetic splashes never consume a sip. Exactly three drinking clicks must still empty a full mug.

Suggested visible text:

- Instruction: “Drag to spin · Click to sip”
- Status: “3 sips left”, “2 sips left”, “1 sip left”
- Empty: “Out of coffee. Scope remains unlimited.”
- Donation button: “Refill the devs ☕”

## Pointer and touch interactions

- Raycast the mug's solid meshes before starting an interaction. Empty canvas space, steam, droplets and background clicks must not consume coffee.
- Use pointer events and pointer capture for an active drag.
- Treat movement beyond approximately 7 CSS pixels as dragging. Track maximum displacement, not just final displacement, so dragging away and back cannot count as a sip.
- Ignore secondary mouse buttons and additional pointers while one pointer owns the interaction.
- A completed click/tap consumes one sip. A drag never consumes a sip.
- Handle pointer cancellation and lost capture without consuming a sip or leaving a stuck drag state.
- Horizontal dragging rotates the mug around the upright Y axis. Give release a short, damped inertia animation.
- If adding vertical tilt, keep it small enough to preserve a useful view of the mug and liquid.
- Preserve vertical page scrolling on mobile. Use an appropriate touch-action policy, such as `pan-y`, and cancel cleanly when the browser takes over scrolling.
- Never attach a global preventDefault handler that disables normal page navigation.

## Steam and splashes

### Steam

Use the three supplied translucent steam ribbons, or improve them with a similarly lightweight effect if visual inspection warrants it.

- Steam must originate above the opening and drift upward with slight lateral variation.
- Animate opacity so it feels like steam rather than rigid plastic strips.
- Clone materials before independently animating each ribbon's opacity. Transparent steam should not write to the depth buffer.
- Ensure the ribbons remain visible at different mug rotations; billboard them toward the camera or use crossed ribbons if necessary.
- Fade steam out as the final sip finishes. Empty means no continuing steam.
- Resume steam after a valid refill.

### Small spill on fast spin

Implement the reference controller's `onSplash` hook; the kit only exposes the hook, not a droplet renderer.

- Trigger only above a deliberate angular-velocity threshold and only with coffee remaining.
- Emit 3 to 5 small faceted brown droplets from the rim in the direction of motion.
- Fade/shrink them over roughly 400 ms, then recycle them.
- Rate-limit emission so a long drag does not allocate unlimited particles.
- Keep the splash restrained and cosmetic. Do not wet the page, cover text, play audio, or alter `sipsRemaining`.
- Skip splash motion under reduced-motion preferences.

## Donation-link semantics

Look for an existing real donation URL in the repository or supplied configuration. No donation URL was provided when the kit was created.

If a real URL exists:

- Use a semantic link styled as the donation button.
- Its activation refills the visual mug and opens the real destination. Opening in a new tab preserves the visible refill; use appropriate `rel` attributes.
- Keyboard activation must work too.
- Do not claim a successful donation or payment merely because the button was clicked. This feature acknowledges a button click, not a verified transaction.

If no URL exists:

- Complete the model, renderer, state and configurable donation hookup.
- Do not invent a URL or silently turn the live button into a fake donation flow.
- Keep the existing clearly labelled unavailable state in production and report the missing URL to the owner.
- Test refill through the controller in development; do not add a production-only workaround refill button.

Actual payment verification is outside this task.

## Rendering and implementation approach

Prefer Three.js with `GLTFLoader` if the repository does not already have a suitable 3D renderer. Reuse existing dependency versions and build tooling where possible. Keep the loader and Three.js core on matching versions. Do not install a framework or unrelated UI library.

If the project remains buildless, choose a compatible module-loading approach and document it. Prefer serving required runtime files from the project so production does not unexpectedly depend on a third-party CDN. Do not introduce a package-manager migration merely for this component.

Suggested renderer setup:

- Transparent canvas over the orange panel.
- Camera slightly above the rim so all three liquid levels are visible.
- Orthographic framing or restrained perspective.
- Warm key light with subtle cyan fill to match the workshop illustration.
- Ivory faceted ceramic and a chunky handle; retain low-poly shading rather than smoothing the entire mug.
- Modest device-pixel-ratio cap, around 1.5 to 2.
- ResizeObserver or equivalent sizing against the component's actual bounds.
- Raycast coordinates derived from the canvas bounding rectangle, not the whole window.

Keep the coffee renderer separate from the existing origami background renderer. Pause unnecessary rendering when the coffee section is offscreen or the tab is hidden, while retaining sip state. Clamp the first delta after resuming to avoid large jumps.

Dispose of event listeners, observers, renderer resources, cloned materials, and droplet resources on teardown. Avoid leaking loops when the component mounts more than once.

### Complete the reference controller

Treat `coffee-controller.js` as a starting point, not a complete component. In particular, the host must provide or finish:

- GLTF loading, renderer, camera, lights and responsive framing.
- A correct `hitTest` raycast.
- Droplet rendering through `onSplash`.
- Accessible controls and status.
- Reduced-motion handling, including disabling inertia/drift as appropriate.
- Visibility pause/resume and teardown.
- Real donation-link wiring.
- Loading/error/WebGL fallback.
- Multi-pointer ownership and lost-capture handling if absent in the reference.

Check the reference controller's material ownership and object transforms before adapting it. Do not let visual implementation details become the authoritative sip state.

## Accessibility and fallback

- Keyboard: Enter or Space on the focused canvas sips, arrow keys spin. (Updated 15 Sep 2026: the visible “Take a sip” and rotate buttons, the hint line and the visible sips counter were removed on request; the mug now spins slowly on its own and the status line is kept only for screen readers.)
- Use visible focus styles and a concise polite status announcement for sip changes. Do not announce every animation frame.
- Keep donation navigation usable without WebGL.
- Respect reduced motion: preserve the three-sip state changes, but remove inertia, drifting steam and splashes; immediate level changes are acceptable.
- If WebGL or the GLB fails, show a static mug image or a clear fallback status with the normal donation link. Do not leave a broken or permanently loading canvas.
- Do not make the whole orange panel a mug click target.

## Acceptance checks

1. Starts full on a fresh page load.
2. Exactly three valid clicks reach empty, including three rapid clicks.
3. Liquid stays inside the mug at every level; the empty interior is visible.
4. Steam fades out at empty and returns after a valid refill.
5. A drag followed by release never drinks, including a drag that ends near its starting point.
6. Clicks outside the mug do not drink.
7. Fast spins can splash while filled, but never change sip count or splash while empty.
8. A real donation-link activation opens the correct destination and restores three sips, without claiming payment success.
9. Refresh restores full; ordinary resize, scroll, visibility changes and remount-related rendering work do not unintentionally refill.
10. Touch drag works while vertical page scrolling remains usable.
11. Keyboard-only visitors can sip, rotate and reach the donation link.
12. Reduced-motion mode and loading/WebGL failure paths work.
13. Inspect desktop and narrow-mobile layouts: no clipped handle, steam, controls or overlapping text.
14. Inspect a full 360-degree rotation for geometry defects, disappearing steam, and liquid clipping.
15. No regressions in the Gallery carousel, sticky navigation, logo scope joke or origami background.
16. No missing assets, uncaught runtime errors, growing particle allocations or duplicate animation loops.

Use the repository's existing verification workflow. Add focused state/gesture tests where useful and perform visual interaction checks when a browser is available. Clearly distinguish checks actually run from unverified assumptions.

## Handoff

Implement all available work, then summarize:

- What changed and where.
- How to run the project locally.
- Which checks passed.
- Any asset fixes made.
- Any remaining missing donation URL or environment limitation.

Do not publish or change hosting/access settings as part of this handoff unless the owner or repository instructions explicitly authorize that action. Preserve existing hosting identity and deployment configuration.
