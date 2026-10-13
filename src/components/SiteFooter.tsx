import { t } from "../i18n";
import { WordmarkText } from "./Wordmark";

export default function SiteFooter() {
  return (
    <footer className="wrap">
      <div className="logo-wrap">
        <span className="brand"><span className="wordmark"><WordmarkText /></span></span>
      </div>
      <p>{t.footer.madeBy} <span className="footer-year">© 2026 NewGameStudio</span></p>
      <a className="footer-mail" href="mailto:contact@newgamestudio.com">contact@newgamestudio.com</a>
    </footer>
  );
}
