/* Data tables for the site, extracted verbatim from the original static
   index.html (the extraction is mechanical — keep it that way when re-running
   tools/bake-moment-frames.py: its printed <img> lines paste straight into
   MOMENTS). Widths/heights are load-bearing: the carousel measures its strip
   from the slide imgs' attributes before any pixels arrive.

   The words live in src/i18n/, one file per language: slides, fools and
   questions are keyed here by id/name, and every language file must carry
   the same keys (the Messages type enforces it). */

// The studio's inbox: the footer's mailto and where playtest answers go.
export const CONTACT_EMAIL = "contact.newgamestudio@gmail.com";

export interface Slide {
  id: string;
  src: string;
  width: number;
  height: number;
}

export interface Moment {
  src: string;
  width: number;
  height: number;
}

export interface Fool {
  name: string;
  img: string;
  width: number;
  height: number;
}

export const SLIDES = [
  { id: "menu-day", src: "assets/shot-01-menu-day.webp", width: 1600, height: 900 },
  { id: "rule-book", src: "assets/shot-02-rule-book.webp", width: 1600, height: 900 },
  { id: "menu-night", src: "assets/shot-03-menu-night.webp", width: 1600, height: 900 },
  { id: "lobby-four", src: "assets/shot-04-lobby-four.webp", width: 1600, height: 900 },
  { id: "word-segway", src: "assets/shot-05-word-segway.webp", width: 1600, height: 900 },
  { id: "blank-canvas", src: "assets/shot-06-blank-canvas.webp", width: 1600, height: 900 },
  { id: "first-strokes", src: "assets/shot-07-first-strokes.webp", width: 1600, height: 900 },
  { id: "bicycle", src: "assets/shot-08-bicycle.webp", width: 1600, height: 900 },
  { id: "vote-four", src: "assets/shot-09-vote-four.webp", width: 1600, height: 900 },
  { id: "faker-guesses", src: "assets/shot-10-faker-guesses.webp", width: 1600, height: 900 },
  { id: "artists-win", src: "assets/shot-11-artists-win.webp", width: 1600, height: 900 },
  { id: "lobby-eight", src: "assets/shot-12-lobby-eight.webp", width: 1600, height: 900 },
  { id: "you-are-faker", src: "assets/shot-13-you-are-faker.webp", width: 1600, height: 900 },
  { id: "faker-view", src: "assets/shot-14-faker-view.webp", width: 1600, height: 900 },
  { id: "car-sketch", src: "assets/shot-15-car-sketch.webp", width: 1600, height: 900 },
  { id: "car-done", src: "assets/shot-16-car-done.webp", width: 1600, height: 900 },
  { id: "vote-eight", src: "assets/shot-17-vote-eight.webp", width: 1600, height: 900 },
  { id: "votes-locked", src: "assets/shot-18-votes-locked.webp", width: 1600, height: 900 },
  { id: "faker-steals", src: "assets/shot-19-faker-steals.webp", width: 1600, height: 900 },
  { id: "fakers-win", src: "assets/shot-20-fakers-win.webp", width: 1600, height: 900 },
  { id: "airship", src: "assets/shot-21-airship.webp", width: 1600, height: 900 },
  { id: "menu-night-again", src: "assets/shot-22-menu-night-again.webp", width: 1600, height: 900 },
] as const satisfies readonly Slide[];

export type SlideId = (typeof SLIDES)[number]["id"];

export const MOMENTS: Moment[] = [
  { src: "assets/moment-01.jpg", width: 600, height: 471 },
  { src: "assets/moment-02.jpg", width: 367, height: 600 },
  { src: "assets/moment-03.jpg", width: 423, height: 600 },
  { src: "assets/moment-04.jpg", width: 313, height: 600 },
  { src: "assets/moment-05.jpg", width: 600, height: 246 },
  { src: "assets/moment-06.jpg", width: 222, height: 600 },
  { src: "assets/moment-07.jpg", width: 255, height: 600 },
  { src: "assets/moment-08.jpg", width: 600, height: 471 },
  { src: "assets/moment-09.jpg", width: 600, height: 516 },
  { src: "assets/moment-10.jpg", width: 478, height: 600 },
  { src: "assets/moment-11.jpg", width: 549, height: 600 },
  { src: "assets/moment-12.jpg", width: 600, height: 447 },
  { src: "assets/moment-13.jpg", width: 600, height: 474 },
  { src: "assets/moment-14.jpg", width: 600, height: 555 },
  { src: "assets/moment-15.jpg", width: 546, height: 600 },
  { src: "assets/moment-16.jpg", width: 600, height: 470 },
  { src: "assets/moment-17.jpg", width: 600, height: 484 },
  { src: "assets/moment-18.jpg", width: 600, height: 463 },
  { src: "assets/moment-19.jpg", width: 587, height: 600 },
  { src: "assets/moment-20.jpg", width: 600, height: 333 },
  { src: "assets/moment-21.jpg", width: 600, height: 319 },
  { src: "assets/moment-22.jpg", width: 600, height: 489 },
  { src: "assets/moment-23.jpg", width: 536, height: 600 },
  { src: "assets/moment-24.jpg", width: 600, height: 600 },
  { src: "assets/moment-25.jpg", width: 600, height: 319 },
  { src: "assets/moment-26.jpg", width: 508, height: 600 },
  { src: "assets/moment-27.jpg", width: 600, height: 391 },
  { src: "assets/moment-28.jpg", width: 600, height: 358 },
  { src: "assets/moment-29.jpg", width: 445, height: 600 },
  { src: "assets/moment-30.jpg", width: 429, height: 600 },
  { src: "assets/moment-31.jpg", width: 468, height: 600 },
  { src: "assets/moment-32.jpg", width: 421, height: 600 },
  { src: "assets/moment-33.jpg", width: 494, height: 600 },
  { src: "assets/moment-34.jpg", width: 515, height: 600 },
  { src: "assets/moment-35.jpg", width: 512, height: 600 },
  { src: "assets/moment-36.jpg", width: 577, height: 600 },
  { src: "assets/moment-37.jpg", width: 600, height: 591 },
  { src: "assets/moment-38.jpg", width: 600, height: 503 },
  { src: "assets/moment-39.jpg", width: 600, height: 325 },
  { src: "assets/moment-40.jpg", width: 533, height: 600 },
  { src: "assets/moment-41.jpg", width: 600, height: 374 },
  { src: "assets/moment-42.jpg", width: 600, height: 464 },
  { src: "assets/moment-43.jpg", width: 600, height: 350 },
  { src: "assets/moment-44.jpg", width: 600, height: 452 },
  { src: "assets/moment-45.jpg", width: 548, height: 600 },
  { src: "assets/moment-46.jpg", width: 600, height: 580 },
  { src: "assets/moment-47.jpg", width: 441, height: 600 },
  { src: "assets/moment-48.jpg", width: 600, height: 423 },
  { src: "assets/moment-49.jpg", width: 600, height: 432 },
  { src: "assets/moment-50.jpg", width: 600, height: 479 },
  { src: "assets/moment-51.jpg", width: 600, height: 394 },
  { src: "assets/moment-52.jpg", width: 600, height: 548 },
  { src: "assets/moment-53.jpg", width: 600, height: 492 },
  { src: "assets/moment-54.jpg", width: 600, height: 309 },
  { src: "assets/moment-55.jpg", width: 600, height: 388 },
  { src: "assets/moment-56.jpg", width: 600, height: 384 },
  { src: "assets/moment-57.jpg", width: 600, height: 433 },
  { src: "assets/moment-58.jpg", width: 600, height: 387 },
  { src: "assets/moment-59.jpg", width: 600, height: 389 },
  { src: "assets/moment-60.jpg", width: 600, height: 332 },
  { src: "assets/moment-61.jpg", width: 600, height: 320 },
  { src: "assets/moment-62.jpg", width: 600, height: 469 },
  { src: "assets/moment-63.jpg", width: 598, height: 600 },
  { src: "assets/moment-64.jpg", width: 549, height: 600 },
  { src: "assets/moment-65.jpg", width: 600, height: 361 },
  { src: "assets/moment-66.jpg", width: 574, height: 600 },
  { src: "assets/moment-67.jpg", width: 549, height: 600 },
  { src: "assets/moment-68.jpg", width: 595, height: 600 },
  { src: "assets/moment-69.jpg", width: 600, height: 331 },
  { src: "assets/moment-70.jpg", width: 600, height: 453 },
  { src: "assets/moment-71.jpg", width: 600, height: 489 },
  { src: "assets/moment-72.jpg", width: 600, height: 556 },
  { src: "assets/moment-73.jpg", width: 478, height: 600 },
  { src: "assets/moment-74.jpg", width: 504, height: 600 },
  { src: "assets/moment-75.jpg", width: 600, height: 497 },
  { src: "assets/moment-76.jpg", width: 600, height: 420 },
  { src: "assets/moment-77.jpg", width: 600, height: 552 },
  { src: "assets/moment-78.jpg", width: 352, height: 600 },
  { src: "assets/moment-79.jpg", width: 481, height: 600 },
  { src: "assets/moment-80.jpg", width: 476, height: 600 },
  { src: "assets/moment-81.jpg", width: 600, height: 543 },
  { src: "assets/moment-82.jpg", width: 600, height: 403 },
  { src: "assets/moment-83.jpg", width: 600, height: 438 },
  { src: "assets/moment-84.jpg", width: 473, height: 600 },
  { src: "assets/moment-85.jpg", width: 313, height: 600 },
  { src: "assets/moment-86.jpg", width: 487, height: 600 },
];

export const FOOLS = [
  { name: "Daniel", img: "assets/avatar-daniel.jpg", width: 248, height: 264 },
  { name: "Ahmed", img: "assets/avatar-ahmed.jpg", width: 218, height: 232 },
  { name: "Micky", img: "assets/avatar-micky.jpg", width: 98, height: 116 },
] as const satisfies readonly Fool[];

export type FoolName = (typeof FOOLS)[number]["name"];

// The playtest form's field names, in display order; each language file
// carries the question text for every name.
export const TEST_QUESTIONS = [
  "q01", "q02", "q03", "q04", "q05", "q06", "q07", "q08",
  "q09", "q10", "q11", "q12", "q13", "q14", "q15", "q16",
] as const;

export type QuestionName = (typeof TEST_QUESTIONS)[number];
