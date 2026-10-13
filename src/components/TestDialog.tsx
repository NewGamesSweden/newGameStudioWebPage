import { useEffect, useRef, useState, type FormEvent } from "react";
import { useDialog } from "../hooks/useDialog";
import { CONTACT_EMAIL, TEST_QUESTIONS, type QuestionName } from "../data/site";
import { lang, t } from "../i18n";
import { rich } from "../i18n/rich";
import { FORBIDDEN_CHARS, MAX_ANSWER_LENGTH, answerProblem, sendAnswers } from "../lib/playtest";

interface Props {
  open: boolean;
  onClose: () => void;
}

/* The playtest questionnaire, opened from help-us-test. Closes via its ×,
   Escape or the dimmed background. Each answer is capped at 2000 characters
   (the textarea's maxLength) and checked for code characters as it is typed;
   send re-checks everything, needs at least one answer, then mails the lot to
   the studio (src/lib/playtest.ts). After a successful send a thank-you
   replaces the form, and closing the dialog resets it for the next player. */

type Status = "idle" | "sending" | "sent" | "failed";

const COUNT_FROM = MAX_ANSWER_LENGTH - 200; // the character counter only shows near the cap

const emptyAnswers = () =>
  Object.fromEntries(TEST_QUESTIONS.map(name => [name, ""])) as Record<QuestionName, string>;

export default function TestDialog({ open, onClose }: Props) {
  const ref = useDialog(open, onClose);
  const [answers, setAnswers] = useState(emptyAnswers);
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open || status !== "sent") return;
    setAnswers(emptyAnswers());
    setStatus("idle");
  }, [open, status]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    const firstBad = TEST_QUESTIONS.find(name => answerProblem(answers[name]));
    if (firstBad) {
      setFormError(t.test.invalid);
      document.getElementById(`test-${firstBad}`)?.focus();
      return;
    }
    if (TEST_QUESTIONS.every(name => !answers[name].trim())) {
      setFormError(t.test.empty);
      return;
    }
    setFormError(null);
    setStatus("sending");
    try {
      await sendAnswers(answers, lang, honeypotRef.current?.value ?? "");
      setStatus("sent");
    } catch {
      setStatus("failed");
    }
  };

  return (
    <dialog id="test" aria-labelledby="test-title" ref={ref}>
      <button type="button" className="money-close" aria-label={t.close} onClick={onClose}>×</button>
      <h2 id="test-title" className="money-title">{rich(t.test.title, "money-hot")}</h2>
      <p className="money-lede">{t.test.lede}</p>
      {status === "sent" ? (
        <p className="test-thanks" role="status">{t.test.thanks}</p>
      ) : (
        <form className="test-form" noValidate onSubmit={onSubmit}>
          {TEST_QUESTIONS.map(name => {
            const value = answers[name];
            const problem = answerProblem(value);
            const noteId = `test-${name}-note`;
            return (
              <div className="test-q" key={name}>
                <label htmlFor={`test-${name}`}>{t.questions[name]}</label>
                <textarea
                  id={`test-${name}`}
                  name={name}
                  rows={3}
                  maxLength={MAX_ANSWER_LENGTH}
                  value={value}
                  aria-invalid={problem ? true : undefined}
                  aria-describedby={problem === "forbidden" ? noteId : undefined}
                  onChange={event => {
                    const next = event.target.value;
                    setAnswers(previous => ({ ...previous, [name]: next }));
                    setFormError(null);
                  }}
                />
                {problem === "forbidden" && (
                  <p className="test-note test-note--error" id={noteId}>
                    {t.test.forbidden} <code>{FORBIDDEN_CHARS}</code>
                  </p>
                )}
                {value.length >= COUNT_FROM && (
                  <p className="test-note test-note--count">{value.length} / {MAX_ANSWER_LENGTH}</p>
                )}
              </div>
            );
          })}
          {/* Honeypot: off-screen and out of the tab order, so only bots fill it. */}
          <input className="test-honeypot" type="text" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" ref={honeypotRef} />
          <button type="submit" className="test-send" disabled={status === "sending"}>
            {status === "sending" ? t.test.sending : t.test.send}
          </button>
          <p className="test-status" role="status">
            {formError ?? (status === "failed" && (
              <>{t.test.failed} <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></>
            ))}
          </p>
        </form>
      )}
    </dialog>
  );
}
