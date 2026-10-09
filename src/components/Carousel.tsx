import { useEffect, useRef, useState } from "react";
import { SLIDES } from "../data/site";
import { reducedMotion } from "../lib/media";
import PreviewDialog from "./PreviewDialog";

/* The filmstrip carousel — a faithful port of main.js section 3. The drift
   loop, the seamless clone, the seam wrap and the steering detection are
   left imperative on purpose: they run inside one rAF loop that must never
   wait on a React render, so everything lives in one effect over refs and
   the only React state is which slide (if any) the preview shows.

   The strip drifts on its own and loops; hover, focus or touching it pauses
   the drift. Click a picture to enlarge it. */

const SWIPE_DISTANCE_PX = 45;    // how far a press may travel and still count as a click
const AUTO_SCROLL_PX_PER_S = 30; // the idle drift speed of the strip

// What the markup effect hands back to the JSX click handlers: the strip
// machinery (steering timestamp, geometry) lives inside the effect, so the
// chevrons and thumbnails reach it through this ref.
interface CarouselApi {
  step: (direction: number) => void;
  thumbTo: (index: number) => void;
}

export default function Carousel() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<HTMLDivElement[]>([]);
  const thumbRefs = useRef<HTMLButtonElement[]>([]);
  const apiRef = useRef<CarouselApi | null>(null);
  // Mirror of "is the preview open" for the rAF loop: state changes reach a
  // running rAF closure through the ref, not through effect deps.
  const previewOpenRef = useRef(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  useEffect(() => {
    const carousel = carouselRef.current;
    const strip = stripRef.current;
    const stage = stageRef.current;
    if (!carousel || !strip || !stage) return;
    const slides = slideRefs.current;
    const thumbs = thumbRefs.current;

    let loopW = 0;    // pixel width of one copy of the list
    let offsets: number[] = []; // where each original slide sits inside the strip
    let last = 0;
    let active = -1; // which original slide is in view (the thumbnail rail follows it)
    let expectedLeft = 0; // where the drift left the strip, so outside scrolls are recognised
    let hovering = false;
    let pressing = false;
    let onScreen = true;
    let steeredAt = -1e9; // last time the strip was sent somewhere on purpose
    let pointerStart: { x: number; y: number } | null = null;
    let raf = 0;

    const openPreview = (index: number) => {
      previewOpenRef.current = true;
      setPreviewIndex(index);
    };

    function measure() {
      loopW = strip!.scrollWidth / 2;
      offsets = slides.map(slide => slide.offsetLeft - slides[0].offsetLeft);
      expectedLeft = strip!.scrollLeft;
    }

    // When the pictures do land (or fail), refine the geometry — widths are
    // attribute-exact already, so this is a belt-and-braces re-measure. A
    // broken file resolves too — one missing image must not stall the strip.
    Promise.all(slides.map(slide => {
      const image = slide.querySelector("img");
      if (!image) return null;
      return image.complete ? null : new Promise<void>(resolve => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      });
    })).then(measure);

    // The drift: the strip advances on its own unless the visitor is on it —
    // pointer over the carousel, keyboard focus inside it, a press on the
    // strip, the preview open — or the carousel is scrolled offscreen, or
    // the visitor prefers reduced motion.
    const drifting = () => !reducedMotion.matches && !hovering && !pressing && onScreen && !previewOpenRef.current &&
                           performance.now() - steeredAt > 1200;

    // Any scroll movement the drift did not cause counts as steering too — a
    // drag's momentum, a wheel or an in-flight smooth scroll — and buys
    // another quiet second before the drift takes over again.
    const onStripScroll = () => {
      if (Math.abs(strip!.scrollLeft - expectedLeft) > 1) steeredAt = performance.now();
    };
    const onEnter = () => { hovering = true; };
    const onLeave = () => { hovering = false; };
    const onFocusIn = () => { hovering = true; };
    const onFocusOut = () => { hovering = false; };
    const onPointerDown = () => { pressing = true; };
    const onWindowPointerUp = () => { pressing = false; };
    const onResize = () => measure();

    const onScreenObserver = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; });
    onScreenObserver.observe(carousel);

    strip.addEventListener("scroll", onStripScroll, { passive: true });
    carousel.addEventListener("mouseenter", onEnter);
    carousel.addEventListener("mouseleave", onLeave);
    carousel.addEventListener("focusin", onFocusIn);
    carousel.addEventListener("focusout", onFocusOut);
    carousel.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onWindowPointerUp);
    window.addEventListener("resize", onResize, { passive: true });

    function tick(now: number) {
      const dt = Math.min((now - last) / 1000, 0.1); // clamp tab-switch gaps
      last = now;
      const s = strip!.scrollLeft;
      if (Math.abs(s - expectedLeft) > 1) {
        // Something else is scrolling — a drag, a fling's momentum or one of
        // the smooth scrolls from the arrows and thumbnails. Hands off:
        // writing the position now would cancel that animation mid-flight.
        // Drift resumes once the strip settles where it was headed.
        expectedLeft = s;
      } else if (drifting()) {
        expectedLeft = s + AUTO_SCROLL_PX_PER_S * dt;
        strip!.scrollLeft = expectedLeft;
      }

      // Wrap in both directions to keep the loop endless: the strip's home
      // range is [0, loopW). The upper bound alone does the work — 0 is a
      // fine resting place (same pixels as loopW). The lower bound only
      // catches rubber-band overscroll, which can report a negative
      // scrollLeft. The guard is paranoia beyond that: one copy of the list
      // is always far wider than any viewport.
      if (loopW > stage!.clientWidth) {
        const cur = strip!.scrollLeft;
        if (cur >= loopW) { strip!.scrollLeft = cur - loopW; expectedLeft = strip!.scrollLeft; }
        else if (cur < 0) { strip!.scrollLeft = cur + loopW; expectedLeft = strip!.scrollLeft; }
      }

      // Track which picture is in view (measured from the centre of the
      // stage, so "in view" means the same picture the chevrons would centre
      // next) — this keeps the thumbnails in step with manual scrolling, the
      // drift and the chevrons alike.
      const view = (strip!.scrollLeft % (loopW || 1)) + stage!.clientWidth * 0.5;
      let index = 0;
      while (index + 1 < slides.length && offsets[index + 1] <= view) index++;
      if (index !== active) {
        active = index;
        thumbs.forEach((thumb, i) => thumb.setAttribute("aria-current", String(i === active)));
      }

      raf = requestAnimationFrame(tick);
    }

    // The chevrons: one press advances (or rewinds) exactly one picture,
    // from centre of the picture in view to centre of the next — the
    // shortest way around the loop in the pressed direction.
    const slideCenter = (i: number) => offsets[i] + slides[i].offsetWidth / 2;
    const scrollByPic = (direction: number) => {
      steeredAt = performance.now();
      if (!loopW) return;
      const centre = (strip!.scrollLeft + stage!.clientWidth / 2) % loopW;
      const next = (Math.max(active, 0) + direction + slides.length) % slides.length;
      let delta = (slideCenter(next) - centre) % loopW;
      if (direction > 0 && delta < 0) delta += loopW;
      if (direction < 0 && delta > 0) delta -= loopW;
      strip!.scrollBy({ left: delta, behavior: reducedMotion.matches ? "instant" : "smooth" });
    };

    // Thumbnail press: centre the picture, same as a chevron press would.
    const thumbTo = (index: number) => {
      steeredAt = performance.now();
      let left = (offsets[index] || 0) + slides[index].offsetWidth / 2 - stage!.clientWidth / 2;
      if (loopW) left = ((left % loopW) + loopW) % loopW; // stay inside one copy of the loop
      strip!.scrollTo({ left, behavior: reducedMotion.matches ? "instant" : "smooth" });
    };
    apiRef.current = { step: scrollByPic, thumbTo };

    // Keyboard on the focused carousel: arrows scroll, Enter or Space
    // enlarges the picture in view (only when the carousel itself has
    // focus, not a button inside it).
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        scrollByPic(event.key === "ArrowRight" ? 1 : -1);
      } else if ((event.key === "Enter" || event.key === " ") && event.target === carousel) {
        event.preventDefault();
        openPreview(Math.max(active, 0));
      }
    };
    carousel.addEventListener("keydown", onKeyDown);

    // A short press on a picture opens the preview; longer drags are the
    // strip's own native scrolling and must not count as a click.
    const onStagePointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      pointerStart = { x: event.clientX, y: event.clientY };
    };
    const onStagePointerUp = (event: PointerEvent) => {
      if (!pointerStart) return;
      const moved = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
      pointerStart = null;
      if (moved >= SWIPE_DISTANCE_PX) return;
      // The whole slide counts as the click target, caption label included.
      const target = event.target as Element | null;
      const slideEl = target?.closest(".slide");
      if (!slideEl) return;
      const all = [...strip!.querySelectorAll(".slide")];
      openPreview(all.indexOf(slideEl) % slides.length);
    };
    const onStagePointerCancel = () => { pointerStart = null; };
    stage.addEventListener("pointerdown", onStagePointerDown);
    stage.addEventListener("pointerup", onStagePointerUp);
    stage.addEventListener("pointercancel", onStagePointerCancel);

    /* The seamless loop: one hidden copy of the list is appended, and the
       scroll position quietly jumps back one copy width each time it crosses
       the seam. The strip's content at s and at s + loopW is pixel-identical,
       so the jump is invisible — even in the middle of a trackpad fling.
       Boot now, without waiting for pixels: the slide imgs wear width/height
       attributes, so the strip's geometry is real before any pixels arrive.
       (Waiting for the images used to starve the whole carousel — the strip
       sits below the lazy-load line, so at page open no slide had even been
       requested: no clones, no drift, dead chevrons.) */
    slides.forEach(slide => {
      const clone = slide.cloneNode(true) as HTMLElement;
      clone.setAttribute("aria-hidden", "true");
      clone.dataset.clone = "true";
      const img = clone.querySelector("img");
      if (img) img.draggable = false;
      strip.append(clone);
    });
    measure();
    last = performance.now();
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      apiRef.current = null;
      onScreenObserver.disconnect();
      strip.removeEventListener("scroll", onStripScroll);
      carousel.removeEventListener("mouseenter", onEnter);
      carousel.removeEventListener("mouseleave", onLeave);
      carousel.removeEventListener("focusin", onFocusIn);
      carousel.removeEventListener("focusout", onFocusOut);
      carousel.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onWindowPointerUp);
      window.removeEventListener("resize", onResize);
      carousel.removeEventListener("keydown", onKeyDown);
      stage.removeEventListener("pointerdown", onStagePointerDown);
      stage.removeEventListener("pointerup", onStagePointerUp);
      stage.removeEventListener("pointercancel", onStagePointerCancel);
      // Drop the loop copy so a StrictMode remount doesn't double the strip.
      strip.querySelectorAll("[data-clone]").forEach(node => node.remove());
      strip.scrollLeft = 0;
    };
  }, []);

  const closePreview = () => {
    previewOpenRef.current = false;
    setPreviewIndex(null);
  };

  return (
    <div
      className="carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Gallery, screenshots and development"
      tabIndex={0}
      ref={carouselRef}
    >
      <div className="slide-stage" ref={stageRef}>
        {/* SLIDES: one block per image. data-title labels the thumbnail and
            the preview. role/aria-roledescription/aria-label per slide are
            what main.js used to set on every original (its clones inherit
            them, hidden behind aria-hidden). */}
        <div className="strip" ref={stripRef}>
          {SLIDES.map((slide, index) => (
            <div
              className="slide"
              data-title={slide.title}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${SLIDES.length}`}
              key={slide.src}
              ref={el => { if (el) slideRefs.current[index] = el; }}
            >
              <img src={slide.src} width={slide.width} height={slide.height} alt={slide.alt} loading="lazy" draggable={false} />
            </div>
          ))}
        </div>

        {/* The whole fading area at each end is the button. */}
        <button className="strip-arrow strip-arrow--left" type="button" aria-label="Scroll back" onClick={() => apiRef.current?.step(-1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <button className="strip-arrow strip-arrow--right" type="button" aria-label="Scroll forward" onClick={() => apiRef.current?.step(1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>

      {/* Thumbnail rail: one button per slide; aria-current follows the
          picture in view (set from the drift loop, like main.js did). */}
      <div className="thumbnails" aria-label="Choose an image">
        {SLIDES.map((slide, index) => (
          <button
            type="button"
            className="thumb"
            aria-label={`Show ${slide.title}`}
            key={slide.src}
            onClick={() => apiRef.current?.thumbTo(index)}
            ref={el => { if (el) thumbRefs.current[index] = el; }}
          >
            <img src={slide.src} alt="" loading="lazy" />
          </button>
        ))}
      </div>

      <PreviewDialog index={previewIndex} onClose={closePreview} />
    </div>
  );
}
