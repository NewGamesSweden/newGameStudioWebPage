import FoolsIntro from "./FoolsIntro";
import GallerySection from "./GallerySection";
import MomentsEntry from "./MomentsEntry";

/* The timeline. Connector svgs are normal-flow blocks (an svg with a height
   IS the band), so every line lands on whatever the flow puts under it.
   Snake 203 + date ~33 + tail 28 keeps every band on the same 264px rhythm.
   All x values are wrap-relative %, and the one contract is: a date's
   margin-left must equal its snake's landing x — 37.5% july, 62.5% august,
   37.5% the following moment (no date: the line runs straight through),
   62.5% september, 50% october, 50% what's next; change them together.
   The line grows out of the fools box's funnel tip, then snakes down to
   each entry. The DOM order here is load-bearing — connectors, date, tail,
   entry, in that order, or the rhythm breaks. */

function Snake({ d }: { d: string }) {
  return (
    <svg className="ngs-connector ngs-connector--snake" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Tail({ d, thru = false }: { d: string; thru?: boolean }) {
  return (
    <svg className={thru ? "ngs-connector ngs-connector--tail ngs-connector--thru" : "ngs-connector ngs-connector--tail"} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

const d = {
  july: "M50 0 V42 Q50 50 48.7 50 H38.8 Q37.5 50 37.5 58 V100",
  august: "M37.5 0 V42 Q37.5 50 38.8 50 H61.2 Q62.5 50 62.5 58 V100",
  following: "M62.5 0 V42 Q62.5 50 61.2 50 H38.8 Q37.5 50 37.5 58 V100",
  september: "M37.5 0 V42 Q37.5 50 38.8 50 H61.2 Q62.5 50 62.5 58 V100",
  october: "M62.5 0 V42 Q62.5 50 61.2 50 H51.3 Q50 50 50 58 V100",
  whatsNext: "M50 0 V100",
};

interface Props {
  onOpenTest: () => void;
}

export default function Timeline({ onOpenTest }: Props) {
  return (
    <>
      <FoolsIntro />

      {/* july 2026: We begin with Gallery. Heading + caption + photo on the left. */}
      <Snake d={d.july} />
      <p className="ngs-date ngs-date--left">july 2026</p>
      <Tail d="M37.5 0 V100" />
      <div className="ngs-entry ngs-entry--left">
        <div className="ngs-block">
          <h2 className="fools-title">We begin with <span className="gallery-word">Gallery</span></h2>
          <p className="fools-caption">Daniel had a list of game ideas and Gallery stood out as a potential first game. A good way to see if we can work together without destroying our friendship</p>
          <img className="ngs-photo" src="assets/fools-banner.jpg" alt="The three of us around the studio table" width={1041} height={508} />
        </div>
      </div>

      {/* august 2026: the deadline. Heading + photo on the right. */}
      <Snake d={d.august} />
      <p className="ngs-date ngs-date--right">august 2026</p>
      <Tail d="M62.5 0 V100" />
      <div className="ngs-entry ngs-entry--right">
        <div className="ngs-block">
          <h2 className="fools-title">“let’s post it by <span>early October</span>”</h2>
          <img className="ngs-photo" src="assets/open-beta.jpg" alt="two thumbs up at the desk during the open-beta grind" width={1041} height={508} />
        </div>
      </div>

      {/* the following moment: no date, no words — two pictures side by
          side; the line runs straight through where the date was. */}
      <Snake d={d.following} />
      <Tail d="M37.5 0 V100" thru />
      <div className="ngs-entry ngs-entry--left">
        <div className="ngs-block">
          <figure className="ngs-sept">
            <img src="assets/daniel-selfie.jpg" alt="Daniel squinting at the camera" width={864} height={976} loading="lazy" />
            <img src="assets/september-lantern.jpg" alt="a green lantern glowing on the desk" width={250} height={314} loading="lazy" />
          </figure>
        </div>
      </div>

      {/* september 2026: no words, just the moments. Frames are baked by
          tools/bake-moment-frames.py — re-run that tool to rebuild or
          reorder them, then paste its output into src/data/site.ts. */}
      <Snake d={d.september} />
      <p className="ngs-date ngs-date--right">september 2026</p>
      <Tail d="M62.5 0 V100" />
      <MomentsEntry />

      {/* october 2026: back to the centre. The whole Gallery game lives at
           the end of the timeline — the nav's gallery link scrolls here. */}
      <Snake d={d.october} />
      <p className="ngs-date ngs-date--centre">october 2026</p>
      <Tail d="M50 0 V100" />
      <GallerySection onOpenTest={onOpenTest} />

      {/* what's next: no date — the line runs straight down from the gallery. */}
      <Snake d={d.whatsNext} />
      <Tail d="M50 0 V100" />
      <div className="ngs-entry ngs-entry--centre" id="upcoming">
        <div className="ngs-block">
          <h2 className="fools-title">what’s <span>next</span> for us</h2>
          <p className="fools-caption">two thirds of our team are going to Korea for a few weeks to find ourselves or something (sorry Ahmed)</p>
          <p className="fools-caption">when we get back, we’ll be refining Gallery and continuing the process on a new single player game we’re working on. Probably some game jams too, so stay tuned</p>
        </div>
      </div>
    </>
  );
}
