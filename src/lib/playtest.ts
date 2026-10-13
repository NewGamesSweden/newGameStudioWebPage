import { CONTACT_EMAIL, TEST_QUESTIONS, type QuestionName } from "../data/site";
import en from "../i18n/en";

/* The playtest questionnaire's rules and its delivery (the form itself is
   src/components/TestDialog.tsx). */

export const MAX_ANSWER_LENGTH = 2000;

// Characters only code needs — markup < >, template and array brackets
// { } [ ], escapes \ and backticks — plus control characters other than tab
// and newline. Prose never needs them (round brackets and CJK quote marks
// stay allowed), so an answer containing one is held back with a note, never
// silently altered. A courtesy check in the browser, not the security
// boundary: anyone can post to the endpoint directly. The answers arrive as
// an email, and Gmail runs no scripts.
const FORBIDDEN = /[<>{}[\]\\`\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
export const FORBIDDEN_CHARS = "< > { } [ ] \\ `";

export type AnswerProblem = "tooLong" | "forbidden" | null;

export function answerProblem(answer: string): AnswerProblem {
  if (answer.length > MAX_ANSWER_LENGTH) return "tooLong";
  if (FORBIDDEN.test(answer)) return "forbidden";
  return null;
}

// FormSubmit (formsubmit.co) turns a JSON post into an email to the address
// in its URL: no account, no key, no server of ours. The first submission
// from the site emails the inbox an activation link, and nothing is delivered
// until someone clicks it.
const ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;

export async function sendAnswers(answers: Record<QuestionName, string>, language: string, honeypot: string) {
  if (honeypot) return; // only a bot fills the hidden field: drop it, but let it think it worked
  const fields: Record<string, string> = {
    _subject: `Gallery playtest answers (${language})`,
    _template: "table",
    _captcha: "false",
    language,
  };
  // English questions as the row labels, whichever language the player answered in.
  for (const name of TEST_QUESTIONS) fields[`${name}. ${en.questions[name]}`] = answers[name].trim() || "—";

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(fields),
  });
  const result: { success?: string | boolean; message?: string } | null = await response.json().catch(() => null);
  if (!response.ok || String(result?.success) !== "true") {
    throw new Error(result?.message ?? `HTTP ${response.status}`);
  }
}
