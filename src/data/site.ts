/* Data tables for the site, extracted verbatim from the original static
   index.html (the extraction is mechanical — keep it that way when re-running
   tools/bake-moment-frames.py: its printed <img> lines paste straight into
   MOMENTS). Widths/heights are load-bearing: the carousel measures its strip
   from the slide imgs' attributes before any pixels arrive. */

export interface Slide {
  src: string;
  width: number;
  height: number;
  alt: string;
  title: string;
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
  line: string;
}

export interface TestQuestion {
  name: string;
  label: string;
}

export const SLIDES: Slide[] = [
  { src: "assets/game-faker.png", width: 1068, height: 1074, alt: "Gallery in game: the easel canvas reads 'you are the faker'", title: "In game · You are the faker" },
  { src: "assets/game-printer.png", width: 1072, height: 1254, alt: "Gallery in game: the easel canvas reads 'the word is printer'", title: "In game · The word is printer" },
  { src: "assets/game-night.png", width: 3012, height: 1606, alt: "Gallery in game at night: player signs, a painted smiley on the shared canvas, and the word sign", title: "In game · Night round" },
  { src: "assets/game-day.png", width: 3006, height: 1604, alt: "Gallery in game by day: the word sign reveals 'mango'", title: "In game · Day round" },
  { src: "assets/game-rules.png", width: 3006, height: 1602, alt: "Gallery's open rule book showing the welcome and how-to-play pages", title: "In game · The rule book" },
  { src: "assets/study-menu.jpg", width: 1920, height: 1080, alt: "Concept artwork arranging an easel, scroll, and artist desk", title: "Main menu · Layout study" },
  { src: "assets/study-lobby.jpg", width: 1920, height: 1080, alt: "Gallery lobby concept with an easel, parchment, and hanging player signs", title: "Lobby · Layout study" },
  { src: "assets/study-game.jpg", width: 1920, height: 1080, alt: "Gallery in-game layout study with artist and information poles", title: "In game · Layout study" },
  { src: "assets/menu-july.png", width: 2048, height: 1011, alt: "Early Gallery menu with a stone wall, practice canvas, and how-to-play instructions", title: "20 Jul · An early menu" },
  { src: "assets/prop-august.png", width: 327, height: 307, alt: "An early angular low-poly prop model", title: "13 Aug · Building the props" },
  { src: "assets/jar-august.png", width: 253, height: 264, alt: "A low-poly transparent jar model in development", title: "20 Aug · A jar takes shape" },
  { src: "assets/gallery.png", width: 2048, height: 1090, alt: "Gallery gameplay with coloured drawings, artist list, and hidden-role information", title: "30 Aug · On the shared canvas" },
  { src: "assets/frame-september.png", width: 265, height: 297, alt: "A decorative picture-frame corner being modelled in 3D", title: "04 Sep · One more detail" },
  { src: "assets/paint-september.png", width: 2048, height: 1331, alt: "A coloured cylindrical prop being edited in the 3D modelling workspace", title: "05 Sep · Back to the workbench" },
  { src: "assets/playtest-september.jpg", width: 1153, height: 2048, alt: "A photograph of Gallery running on a laptop with a shared drawing and innocent role", title: "06 Sep · A game in progress" },
  { src: "assets/game-september.png", width: 2047, height: 1090, alt: "Gallery gameplay with an easel, mountain scenery, and the faker role", title: "10 Sep · Into the outdoors" },
  { src: "assets/browser-september.png", width: 654, height: 448, alt: "Gallery in a browser window with a scroll menu and low-poly landscape", title: "11 Sep · Another browser iteration" },
];

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

export const FOOLS: Fool[] = [
  { name: "Daniel", img: "assets/avatar-daniel.jpg", width: 248, height: 264, line: "unable to take a day off. Allergic to everything" },
  { name: "Ahmed", img: "assets/avatar-ahmed.jpg", width: 218, height: 232, line: "tried keto a few times, was depressed each time, will probably try again" },
  { name: "Micky", img: "assets/avatar-micky.jpg", width: 98, height: 116, line: "has never tried keto, not allergic to anything, will not eat cauliflower" },
];

export const TEST_QUESTIONS: TestQuestion[] = [
  { name: "q01", label: "What did you think the goal of the game was, and what were you trying to accomplish while playing?" },
  { name: "q02", label: "Was there ever a point where you didn’t know what to do or how something worked? What happened?" },
  { name: "q03", label: "What was the most fun part of the game, and why?" },
  { name: "q04", label: "What was the least fun part of the game, and why?" },
  { name: "q05", label: "What was the most satisfying or rewarding moment? What caused that feeling?" },
  { name: "q06", label: "What was the most frustrating or annoying moment? What caused it?" },
  { name: "q07", label: "Were there any moments where you felt bored or the game became repetitive?" },
  { name: "q08", label: "Did anything behave differently from what you expected?" },
  { name: "q09", label: "Was there anything you wanted to do but couldn’t?" },
  { name: "q10", label: "Did you ever feel lost, stuck, or unsure how to progress? What caused it?" },
  { name: "q11", label: "Was anything about the controls or interface awkward or unintuitive?" },
  { name: "q12", label: "Did you discover any strategies, behaviors, or ways of playing that you think the game may not have intended?" },
  { name: "q13", label: "If you could change one thing about the game, what would you change?" },
  { name: "q14", label: "Who do you think would enjoy this game?" },
  { name: "q15", label: "Is there anything you expected from the game that it didn’t provide?" },
  { name: "q16", label: "Is there anything else you’d like us to know?" },
];
