/* The fixed site bar: logo (hidden while the hero behind it is on screen —
   App toggles at-hero from the same IntersectionObserver main.js used),
   anchor nav and the money button. */

interface Props {
  atHero: boolean;
  onOpenMoney: () => void;
}

export default function SiteHeader({ atHero, onOpenMoney }: Props) {
  return (
    <header className={atHero ? "site-header at-hero" : "site-header"}>
      <div className="nav wrap">
        <div className="logo-wrap">
          <a className="brand" href="index.html">New<span>Game</span>Studio</a>
          <span className="brand-tag">three fools making games</span>
        </div>
        <nav aria-label="Main navigation">
          <a href="#gallery">gallery</a>
          <a href="#upcoming">upcoming</a>
          <button type="button" className="nav-money" id="open-money" onClick={onOpenMoney}>
            give us money <span aria-hidden="true">↗</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
