import { useDialog } from "../hooks/useDialog";
import { TEST_QUESTIONS } from "../data/site";
import { t } from "../i18n";
import { rich } from "../i18n/rich";

interface Props {
  open: boolean;
  onClose: () => void;
}

/* The playtest questionnaire, opened from help-us-test. Closes via its ×,
   Escape or the dimmed background — the send button stays inert, exactly as
   it shipped. */

export default function TestDialog({ open, onClose }: Props) {
  const ref = useDialog(open, onClose);

  return (
    <dialog id="test" aria-labelledby="test-title" ref={ref}>
      <button type="button" className="money-close" aria-label={t.close} onClick={onClose}>×</button>
      <h2 id="test-title" className="money-title">{rich(t.test.title, "money-hot")}</h2>
      <p className="money-lede">{t.test.lede}</p>
      <form className="test-form">
        {TEST_QUESTIONS.map(name => (
          <label className="test-q" key={name}>
            <span>{t.questions[name]}</span>
            <textarea name={name} rows={3} />
          </label>
        ))}
        <button type="button" className="test-send">{t.test.send}</button>
      </form>
    </dialog>
  );
}
