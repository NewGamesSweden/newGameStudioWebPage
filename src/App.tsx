import { useEffect, useState } from "react";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import Timeline from "./components/Timeline";
import MoneyDialog from "./components/MoneyDialog";
import TestDialog from "./components/TestDialog";

/* App = the old body of index.html plus the wiring main.js did at the page
   level: the two modal states and the header brand fade. While the page hero
   (wordmark + one-liner) is on screen, the header hides its own wordmark —
   same words twice looks like a bug. The observer only toggles state; the
   fade itself is CSS. */

export default function App() {
  const [moneyOpen, setMoneyOpen] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [atHero, setAtHero] = useState(true);

  useEffect(() => {
    const hero = document.querySelector(".ngs-hero");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => {
      setAtHero(entry.isIntersecting);
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <SiteHeader atHero={atHero} onOpenMoney={() => setMoneyOpen(true)} />
      <main>
        {/* the studio: the wordmark hero, the fools intro, the timeline
            (july, august, september) and the Gallery game at the end of it. */}
        <section className="ngs" aria-labelledby="fools-heading">
          <div className="wrap">
            <Timeline onOpenTest={() => setTestOpen(true)} />
          </div>
        </section>
      </main>
      <SiteFooter />
      <MoneyDialog open={moneyOpen} onClose={() => setMoneyOpen(false)} />
      <TestDialog open={testOpen} onClose={() => setTestOpen(false)} />
    </>
  );
}
