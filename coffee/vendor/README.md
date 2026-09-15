# Vendored Three.js

Three.js r170, copied from the npm package so the website does not depend on a CDN.

| File | From |
| --- | --- |
| `three.module.min.js` | `three/build/three.module.min.js` |
| `GLTFLoader.js` | `three/examples/jsm/loaders/GLTFLoader.js` (one import path changed to `./BufferGeometryUtils.js`) |
| `BufferGeometryUtils.js` | `three/examples/jsm/utils/BufferGeometryUtils.js` |
| `LICENSE` | MIT licence for Three.js |

To upgrade, download the same three files from the new version and re-apply the one import path change.
Keep all three files on the same version.
