#!/usr/bin/env python3
"""Bake the september "moments" frames for the timeline section.

Reads the source screenshots in ~/Desktop/ngswebslideshow/, skips the tiny
fragment images listed in EXCLUDE, resizes each to a 600px max dimension
(crisp at the section's 300px display slot on retina) and writes
assets/moment-NN.jpg (JPEG q85, numbered in capture order). Prints the <img>
tag list for index.html with each file's real post-resize dimensions.

One-off bake tool, like bake-title-ink.py: edit EXCLUDE and re-run; the
Desktop folder itself is never modified.
"""

import os
import subprocess
import sys

SRC = os.path.expanduser("~/Desktop/ngswebslideshow")
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "assets")
MAX_DIM = 600          # sips -Z: bounding box for the longest side
QUALITY = 85           # JPEG q, the site's screenshot quality

# Tiny fragment screenshots that are not real "moments" (user-requested).
EXCLUDE = {
    "Screenshot 2026-10-07 at 21.22.55.png",  # 4x2
    "Screenshot 2026-10-07 at 21.35.31.png",  # 364x82
    "Screenshot 2026-10-07 at 21.35.50.png",  # 454x148
    "Screenshot 2026-10-07 at 21.36.40.png",  # 324x178
    "Screenshot 2026-10-07 at 21.37.49.png",  # 148x158
    "Screenshot 2026-10-07 at 21.38.27.png",  # 196x170
    "Screenshot 2026-10-07 at 21.39.11.png",  # 268x186
    "Screenshot 2026-10-07 at 21.41.56.png",  # 198x210
    "Screenshot 2026-10-07 at 21.45.33.png",  # 412x178
}


def dims(path):
    out = subprocess.run(["sips", "-g", "pixelWidth", "-g", "pixelHeight", path],
                         capture_output=True, text=True, check=True).stdout
    w = h = 0
    for line in out.splitlines():
        if line.startswith("  pixelWidth:"):
            w = int(line.split()[-1])
        elif line.startswith("  pixelHeight:"):
            h = int(line.split()[-1])
    return w, h


def main():
    files = sorted(f for f in os.listdir(SRC)
                   if not f.startswith(".") and f.lower().endswith((".png", ".jpg", ".jpeg")))
    skipped = [f for f in files if f in EXCLUDE]
    missing = EXCLUDE - set(files)
    if missing:
        sys.exit(f"EXCLUDE names not found in {SRC}: {sorted(missing)}")
    print(f"skipping {len(skipped)} excluded fragments:")
    for f in skipped:
        print(f"  {f}")

    os.makedirs(OUT, exist_ok=True)
    tags = []
    sizes = []
    total = 0
    for i, f in enumerate([f for f in files if f not in EXCLUDE], 1):
        src = os.path.join(SRC, f)
        dst = os.path.join(OUT, f"moment-{i:02d}.jpg")
        for q in (QUALITY, 80, 75):  # busy frames re-encode until they fit the cap
            subprocess.run(["sips", "-Z", str(MAX_DIM), src,
                            "-s", "format", "jpeg", "-s", "formatOptions", str(q),
                            "--out", dst], capture_output=True, check=True)
            if os.path.getsize(dst) <= 100 * 1024:
                break
        w, h = dims(dst)
        size = os.path.getsize(dst)
        sizes.append(size)
        total += size
        lazy = "" if i == 1 else " loading=\"lazy\""
        on = " class=\"moment-on\"" if i == 1 else ""
        tags.append(f'        <img{on} src="assets/moment-{i:02d}.jpg" alt="" width="{w}" height="{h}"{lazy}>')
        print(f"moment-{i:02d}.jpg  {w}x{h}  {size // 1024} KB")

    print(f"\nbaked {len(tags)} frames, {total // 1024} KB total")
    assert len(tags) == 86, f"expected 86 frames, got {len(tags)}"
    assert total <= 6 * 1024 * 1024, "batch over 6 MB"
    assert max(sizes) <= 100 * 1024, "a frame is over 100 KB"
    print("\n<img> list for index.html:\n")
    print("\n".join(tags))


if __name__ == "__main__":
    main()
