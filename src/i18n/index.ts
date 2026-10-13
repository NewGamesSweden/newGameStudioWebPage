import type { Messages } from "./types";
import en from "./en";
import ja from "./ja";
import zh from "./zh";
import es from "./es";
import ko from "./ko";

/* The page's language is decided once, at boot, and never changes while the
   page is open: picking another one stores it and reloads. That keeps every
   component a plain read of `t` — no context, no re-render — and the
   imperative parts (the carousel's cloned slides) never hold stale words.

   Order of choice: the visitor's stored pick, then the first browser language
   we have, then English. */

// The picker's order. code is the <html lang> tag (it also makes the browser
// pick the right CJK system font), short is the picker's face, label is the
// language's own name in the open list.
export const LANGS = [
  { code: "en", short: "EN", label: "English", messages: en },
  { code: "ja", short: "JA", label: "日本語", messages: ja },
  { code: "zh-CN", short: "ZH", label: "中文", messages: zh },
  { code: "es", short: "ES", label: "Español", messages: es },
  { code: "ko", short: "KO", label: "한국어", messages: ko },
] as const satisfies readonly { code: string; short: string; label: string; messages: Messages }[];

export type Lang = (typeof LANGS)[number]["code"];

const STORAGE_KEY = "ngs-lang";

const primary = (tag: string) => tag.toLowerCase().split("-")[0];

function pickLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const match = LANGS.find(entry => entry.code === stored);
    if (match) return match.code;
  } catch {
    // storage blocked (privacy settings): fall through to the browser's languages
  }
  // Primary subtag only, so zh-TW and es-MX still land on our Chinese and Spanish.
  for (const tag of navigator.languages) {
    const match = LANGS.find(entry => primary(entry.code) === primary(tag));
    if (match) return match.code;
  }
  return "en";
}

export const lang: Lang = pickLang();
export const current = LANGS.find(entry => entry.code === lang)!;
export const t: Messages = current.messages;

export function setLang(next: Lang) {
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // storage blocked: the reload falls back to the browser's languages
  }
  location.reload();
}

// index.html ships the English head; this swaps in the chosen language.
export function applyDocumentLanguage() {
  document.documentElement.lang = lang;
  document.querySelector('meta[name="description"]')?.setAttribute("content", t.meta.description);
}
