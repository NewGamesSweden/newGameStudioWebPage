import type { MouseEvent } from "react";
import { WordmarkText } from "./Wordmark";

/* The fixed site bar: logo (hidden while the hero behind it is on screen —
   App toggles at-hero from the same IntersectionObserver main.js used),
   anchor nav and the money button. */

interface Props {
  atHero: boolean;
  onOpenMoney: () => void;
}

/* The nav links keep their hrefs (middle-click, copy-link) but a plain click
   scrolls without ever putting the hash in the URL: preventDefault, then
   scrollIntoView — which reuses the CSS scroll-behavior/scroll-padding —
   then pushState the hash-less URL, keeping the usual history semantics. */
const goAnchor = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  document.getElementById(id)?.scrollIntoView();
  history.pushState(null, "", location.pathname + location.search);
};

export default function SiteHeader({ atHero, onOpenMoney }: Props) {
  return (
    <header className={atHero ? "site-header at-hero" : "site-header"}>
      <div className="nav wrap">
        <div className="logo-wrap">
          <a className="brand" href="index.html">
            <span className="wordmark"><WordmarkText /></span>
          </a>
          <span className="brand-tag">three fools making games</span>
        </div>
        <nav aria-label="Main navigation">
          <a href="#gallery" onClick={e => goAnchor(e, "gallery")}>gallery</a>
          <a href="#upcoming" onClick={e => goAnchor(e, "upcoming")}>upcoming</a>
          <button type="button" className="nav-money" id="open-money" onClick={onOpenMoney}>
            give us money <span aria-hidden="true">↗</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
