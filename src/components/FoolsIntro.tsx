import { FOOLS } from "../data/site";
import { t } from "../i18n";
import { rich } from "../i18n/rich";
import { WordmarkText } from "./Wordmark";

/* The fools: the intro, boxed in the same cyan line the timeline is
   drawn with. The surround svg is absolutely positioned over the box and
   stretches with it; its bottom centre funnels into the single point
   snake-1 starts from. Contract: .fools-intro's margin-bottom must equal
   the surround's tail depth (48px) and snake-1 must start at M50 0. */
export default function FoolsIntro() {
  return (
    <div className="fools-intro">
      <svg className="ngs-surround" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M74.5 2 H97.8 Q99 2 99 4 V86 Q99 88 97.8 88 H56 Q50 88 50 100 M1 16 V86 Q1 88 2.2 88 H44 Q50 88 50 100" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="ngs-hero">
        <h1 className="ngs-logo"><span className="wordmark"><WordmarkText /></span></h1>
      </div>
      <h2 id="fools-heading" className="fools-title">{rich(t.intro.title)}</h2>
      {t.intro.captions.map(caption => <p className="fools-caption" key={caption}>{caption}</p>)}
      <ul className="fools-list">
        {FOOLS.map(fool => (
          <li className="fool" key={fool.name}>
            <img className="fool-avatar" src={fool.img} alt="" width={fool.width} height={fool.height} loading="lazy" />
            <div className="fool-info">
              <strong>{fool.name}</strong>
              <p>{t.fools[fool.name]}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
