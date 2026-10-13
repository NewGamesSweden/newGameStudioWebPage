import type { FoolName, QuestionName, SlideId } from "../data/site";

/* Every word the page shows, for one language. Each file in src/i18n/
   implements this whole shape, so a missing string is a type error, not a
   blank on the page.

   Accent phrases are marked with [brackets] and line breaks with \n — rich()
   in ./rich.tsx turns them into the <span>/<br> the markup needs, so each
   language can put the accent wherever its word order lands it. */

export interface Messages {
  meta: {
    description: string;
  };
  header: {
    tagline: string;
    nav: string;      // the nav landmark's accessible name
    gallery: string;
    upcoming: string;
    money: string;
    language: string; // the language picker's accessible name
  };
  intro: {
    title: string;                       // [accent]
    captions: [string, string, string];
  };
  fools: Record<FoolName, string>;
  timeline: {
    july: string;
    august: string;
    september: string;
    october: string;
    beginTitle: string;                  // [Gallery], set in the blackletter
    beginCaption: string;
    beginPhotoAlt: string;
    deadlineTitle: string;               // [accent]
    deadlinePhotoAlt: string;
    selfieAlt: string;
    lanternAlt: string;
    momentsLabel: string;
    nextTitle: string;                   // [accent]
    nextCaptions: [string, string];
  };
  gallery: {
    description: string;
    play: string;
    helpTitle: string;                   // [accent]
    helpCaption: string;
    questionnaire: string;
  };
  carousel: {
    label: string;
    back: string;
    forward: string;
    thumbnails: string;
    show: (title: string) => string;
    position: (n: number, total: number) => string;
  };
  slides: Record<SlideId, { alt: string; title: string }>;
  preview: {
    close: string;
    closeLabel: string;
    defaultCaption: string;
  };
  close: string; // the dialogs' corner ×
  money: {
    title: string;
    lede: string;                        // [accent] twice, \n between
    note: string;
  };
  test: {
    title: string;                       // [accent]
    lede: string;
    send: string;
    sending: string;   // the send button while the mail goes out
    thanks: string;    // replaces the form once it's sent
    failed: string;    // followed by the studio's address as a mailto link
    empty: string;     // send pressed with every answer blank
    forbidden: string; // under an answer with code characters, followed by the list of them
    invalid: string;   // send pressed while an answer is flagged
  };
  questions: Record<QuestionName, string>;
  footer: {
    madeBy: string;
  };
}
