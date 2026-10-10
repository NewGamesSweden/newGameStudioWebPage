/* The NewGameStudio wordmark, shared by the header, the hero and the footer so
   all three render the same letters — including the brush-stroke i: a stem
   with a rounded top that tapers downward like a pulled brush, and a dab for
   a dot (a circle whose top-right quadrant is a square corner) in the accent
   colour. The svg is sized in em, so one glyph serves every wordmark size.

   The "i" is repeated as visually-hidden real text: the svg is aria-hidden,
   so screen readers still read "NewGameStudio". */

function BrushI() {
  return (
    <>
      {/* Geometry measured from a raster of Space Grotesk 700's own i at
          1000px (1 viewBox unit = 1/1000 em): dot diameter 159 centred
          y≈85, stem 126 wide topping out at y≈224, baseline 720. The brush
          treatment: the stem tapers to ~60% at the base, the dot gains a
          square top-right corner. Plan §5 has the tuning procedure. */}
      <span className="brush-i" aria-hidden="true">
        <svg viewBox="0 0 200 720">
          {/* Stem: rounded top cap peaking at y=224 (the real x-height —
              the arc endpoints sit one radius lower, y=287), tapering from
              half-width 63 to 40 at the flat base on the baseline (y=720). */}
          <path className="brush-i__stem" d="M37 287
            A63 63 0 0 1 163 287
            L140 720
            L60 720 Z" />
          {/* Dot: circle radius 80 centred at (100, 85); its top-right
              quadrant is a square corner — straight top edge to (180,5),
              straight right edge down to (180,85), then the round three
              quarters back. */}
          <path className="brush-i__dot" d="M100 5
            L180 5
            L180 85
            A80 80 0 1 1 20 85
            A80 80 0 0 1 100 5 Z" />
        </svg>
      </span>
      <span className="sr-only">i</span>
    </>
  );
}

export function WordmarkText() {
  return (
    <>
      New<span className="wm-accent">Game</span>Stud<BrushI />o
    </>
  );
}
