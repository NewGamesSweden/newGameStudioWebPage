import { useEffect, useRef } from "react";
import { MOMENTS } from "../data/site";
import { reducedMotion } from "../lib/media";

/* september 2026: no words, just the moments. The figure is a fixed-height
   frame; the effect swaps which image is visible every MOMENT_MS, but only
   once its frames are all fetched and decoded — an unloaded frame paints an
   empty box, and at 160ms a lap is ~14s of flicker while frames trickle in.
   As the reader approaches, the observer force-fetches every lazy frame
   (loading=eager), then the flip starts only after every decode settles
   (allSettled: one broken picture must not stall the other 85). Reduced
   motion keeps the first frame, which ships visible in the markup. */

const MOMENT_MS = 160; // how long each image is on screen

export default function MomentsEntry() {
  const figRef = useRef<HTMLElement>(null);
  const frameRefs = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    if (reducedMotion.matches) return;
    const box = figRef.current;
    if (!box) return;
    const frames = frameRefs.current;
    let interval: number | undefined;

    const observer = new IntersectionObserver(([entry], obs) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      frames.forEach(frame => { frame.loading = "eager"; });
      Promise.allSettled(frames.map(frame => frame.decode())).then(() => {
        let on = 0;
        interval = window.setInterval(() => {
          frames[on].classList.remove("moment-on");
          on = (on + 1) % frames.length;
          frames[on].classList.add("moment-on");
        }, MOMENT_MS);
      });
    }, { rootMargin: "100% 0px" });
    observer.observe(box);

    return () => {
      observer.disconnect();
      if (interval !== undefined) clearInterval(interval);
    };
  }, []);

  return (
    <div className="ngs-entry ngs-entry--right">
      <figure className="ngs-block ngs-moment" aria-label="september, in moments" ref={figRef}>
        {MOMENTS.map((moment, i) => (
          <img
            key={moment.src}
            ref={el => { if (el) frameRefs.current[i] = el; }}
            className={i === 0 ? "moment-on" : undefined}
            src={moment.src}
            alt=""
            width={moment.width}
            height={moment.height}
            loading={i === 0 ? undefined : "lazy"}
          />
        ))}
      </figure>
    </div>
  );
}
