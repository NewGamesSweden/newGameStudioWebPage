# Coffee mug (interactive 3D, in progress)

This folder holds everything for the clickable coffee mug in the orange coffee section.
Click the mug to sip (three sips, then empty), drag to spin it, spin fast to spill a few drops.
Only the donation button refills it. A page refresh also starts it full again.

## Where to put the mug model

Put your GLB file here and name it exactly:

```
coffee/workshop-mug-with-steam.glb
```

If you export a new version from Blender, overwrite that file. Keep these node names
in the model, because the website code will look for them:

```
MugRoot
  Mug_Body
  Mug_Handle
  Mug_Accent
  Coffee          (origin at the bottom, so scaling Y lowers the liquid)
  Steam_1  Steam_2  Steam_3
```

Export from Blender with the default glTF settings (Y up, include materials).

## Files

| File | What it is |
| --- | --- |
| `workshop-mug-with-steam.glb` | The mug model the website will load. Exported from Blender with the handle normals and accent band fixed. |
| `coffee-mug.js` | The mug itself: loads the model, renders it, handles clicks, drags, steam, splashes, keyboard and fallback. Settings at the top, including `DONATION_URL`. |
| `coffee-state.js` | The rules with no graphics: sips left, click versus drag, liquid easing. Tested by Node. |
| `tests/` | Node tests for the rules. Run `node --test "coffee/tests/*.test.mjs"`. |
| `vendor/` | Three.js r170 and its GLTF loader, copied into the repo so nothing loads from a CDN. |
| `IMPLEMENTATION-SPEC.md` | The full brief for how the mug should behave. |
| `kit/coffee-controller.reference.js` | The kit's original reference logic, kept for comparison. |
| `kit/build_asset.py` | Regenerates the placeholder GLB with plain Python. Not needed once a real model exists. |
| `kit/setup_blender.py` | Run inside Blender to import the GLB with lights, camera and a preview animation. |
| `kit/KIT-NOTES.md` | Original notes that came with the kit. |

## Status

- [x] Kit and placeholder model in the repo
- [x] Final mug model from Blender (checked 15 Sep 2026: normals, liquid containment, all angles)
- [x] Three.js renderer and controls in the website
- [ ] Donation link URL (paste it into `DONATION_URL` in `coffee-mug.js`)

## Testing in the browser

While the donation URL is empty there is no refill button on the page. To test a refill,
open the browser console and run:

```js
coffeeMug.refill()
```

`coffeeMug.sip()` and `coffeeMug.sips` are there too.

## How it loads

`index.html` has an import map pointing `three` at `vendor/three.module.min.js`, then imports
`coffee-mug.js` as an ES module. If that import fails (no web server, no WebGL, model missing)
the section shows a plain ☕ with a short message. The donation label is unaffected.
