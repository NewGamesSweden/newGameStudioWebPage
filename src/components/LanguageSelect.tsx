import { LANGS, current, setLang, t, type Lang } from "../i18n";

/* The language picker, the last thing in the nav (top right). The face is a
   globe and the current language's short code, bordered like the money
   button; a real <select> lies invisibly over the whole face, so a click
   anywhere on it opens the native list (keyboard, screen readers and the
   phone pickers come free). Picking a language stores it and reloads the
   page — see src/i18n/index.ts for why. */

export default function LanguageSelect() {
  return (
    <span className="lang-select">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3z" />
      </svg>
      <span aria-hidden="true">{current.short}</span>
      <select
        aria-label={t.header.language}
        value={current.code}
        onChange={event => setLang(event.target.value as Lang)}
      >
        {LANGS.map(entry => (
          <option key={entry.code} value={entry.code} lang={entry.code}>{entry.label}</option>
        ))}
      </select>
    </span>
  );
}
