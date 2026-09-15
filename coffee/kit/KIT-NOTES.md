# NewGameStudio — interactive coffee proposal

## Included asset
`workshop-mug.glb` is a real, self-contained glTF 2.0 model: a 12-sided ivory mug, angular handle, cyan band, separate dark coffee volume, and three translucent steam ribbons. It has no external textures. Import it in Blender using File > Import > glTF 2.0.

`setup_blender.py` imports the model into a new scene, adds warm/cyan lighting, a camera and a sip/steam preview animation, and saves a native .blend file beside the script. In Blender's Scripting workspace, open the saved script and Run Script. It preserves other scenes and avoids overwriting an existing .blend output. The saved .blend contains your current Blender session as well, so use a fresh session for a standalone asset file.

Blender was not installed in the creation environment. The GLB structure was validated here; the Blender setup script has only been syntax checked, not run or visually rendered. The model is an initial usable asset for visual review in Blender, not a claimed Blender-rendered final.

`build_asset.py` regenerates the GLB using standard Python only. `coffee-controller.js` supplies proposed interaction logic for Three.js, not a complete installed website component. The current website has not been modified.

## Placement and behaviour
Replace the right-hand coffee-panel placeholder with a transparent 3D canvas, roughly 300 by 300 px on desktop, above a real “Refill the devs” donation link. Keep the orange panel, existing heading, and body text. Put “Drag to spin · Click to sip” beneath the mug. On mobile stack it under the copy.

State: full -> 2/3 -> 1/3 -> empty. Only three clicks consume coffee. Each sip lowers the Coffee mesh over about 350ms; at empty it disappears entirely and steam fades away. Clicking an empty mug does nothing except leave the empty status visible. Empty text: “Out of coffee. Scope remains unlimited.”

A drag over 7px rotates the mug and must not count as a sip. Horizontal drag rotates around the upright axis; release gives a little inertia. Constrain tilt if added, so the mug stays inspectable. The existing canvas renderer's animation loop calls controller.update(deltaSeconds, elapsedSeconds). Use a Three.js raycast in hitTest so clicks on blank canvas do not drink. Supply a role=status text node and a keyboard-accessible “Take a sip” button wired to controller.sip(). Add left/right keyboard rotation controls and reduced-motion handling in the host component.

Steam: the supplied ribbons are cheap transparent meshes, individually named Steam_1 through Steam_3. Animate their position and opacity in the browser while coffee exists. No smoke simulation is necessary. Pause rendering offscreen; remove drifting/inertia/splash motion when reduced motion is enabled, keeping sip state accessible.

Spills: on a fast spin emit 3–5 small brown droplet meshes from the rim, throw them outward, then shrink/fade them over 400ms. Pool and reuse droplets. The controller invokes onSplash for the host renderer to implement this effect. These are cosmetic: do not subtract coffee, preserving the exact three-click rule. No spills from an empty mug. A slight liquid tilt may accompany the splash, but should stay inside the mug.

Refill: the donation link's click handler calls controller.refill() and opens the real donation destination. The visual refill acknowledges the click, not a verified payment. If payment verification is desired later, refill after a payment-provider confirmation instead. Do not attach refill to the mug, use timers to refill, or store the sip state in localStorage: refreshing the page must restore full coffee. A donation URL has not been supplied, so no live donation integration is included.

## Three.js integration sketch

Load the GLB with GLTFLoader, add gltf.scene to the scene and pass its MugRoot to createCoffeeController. Keep model units unchanged; frame with an orthographic camera looking slightly down into the rim. Warm key light and restrained cyan fill match the workshop artwork. Use a transparent renderer over the existing orange panel.

The controller expects the GLB's original Y-up axes. Blender uses a different world convention internally; if re-exporting from Blender, retain standard glTF export axis conversion and preserve node names.

Suggested integration imports:
- GLTFLoader: https://threejs.org/docs/pages/GLTFLoader.html
- glTF 2.0 model format: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html

Ship the model, controller and renderer dependency with the website project after visual review. Keep an accessible static mug fallback if WebGL is unavailable. No extra backend is needed for the proposed visual behaviour.
