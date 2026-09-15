# Coffee mug (interactive 3D, in progress)

This folder holds everything for the clickable coffee mug that will sit in the orange
coffee section of the website. The website itself does not load anything from here yet.

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
| `coffee-controller.js` | Reference sip / drag / steam logic from the kit. Will be adapted when the feature is built. |
| `IMPLEMENTATION-SPEC.md` | The full brief for how the mug should behave. |
| `kit/build_asset.py` | Regenerates the placeholder GLB with plain Python. Not needed once a real model exists. |
| `kit/setup_blender.py` | Run inside Blender to import the GLB with lights, camera and a preview animation. |
| `kit/KIT-NOTES.md` | Original notes that came with the kit. |

## Status

- [x] Kit and placeholder model in the repo
- [x] Final mug model from Blender (checked 15 Sep 2026: normals, liquid containment, all angles)
- [ ] Three.js renderer and controls in the website
- [ ] Donation link URL (still missing, see the coffee section in `index.html`)
