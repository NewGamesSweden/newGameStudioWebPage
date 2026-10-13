import type { MouseEvent } from "react";
import { t } from "../i18n";
import LanguageSelect from "./LanguageSelect";
import { WordmarkText } from "./Wordmark";

/* The fixed site bar: logo (hidden while the hero behind it is on screen —
   App toggles at-hero from the same IntersectionObserver main.js used),
   anchor nav, the money button and the language picker. */

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
          <span className="brand-tag">{t.header.tagline}</span>
        </div>
        <nav aria-label={t.header.nav}>
          <a href="#gallery" onClick={e => goAnchor(e, "gallery")}>{t.header.gallery}</a>
          <a href="#upcoming" onClick={e => goAnchor(e, "upcoming")}>{t.header.upcoming}</a>
          <button type="button" className="nav-money" id="open-money" onClick={onOpenMoney}>
            {t.header.money} <span aria-hidden="true">↗</span>
          </button>
          <LanguageSelect />
        </nav>
      </div>
    </header>
  );
}
