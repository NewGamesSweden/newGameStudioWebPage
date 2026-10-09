import { useDialog } from "../hooks/useDialog";
import { TEST_QUESTIONS } from "../data/site";

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
      <button type="button" className="money-close" aria-label="Close" onClick={onClose}>×</button>
      <h2 id="test-title" className="money-title">we need you to <span className="money-hot">fill</span> this out</h2>
      <p className="money-lede">you don’t have to be nice, we’ve lost all emotional response due to AI psychosis</p>
      <form className="test-form">
        {TEST_QUESTIONS.map(question => (
          <label className="test-q" key={question.name}>
            <span>{question.label}</span>
            <textarea name={question.name} rows={3} />
          </label>
        ))}
        <button type="button" className="test-send">send it</button>
      </form>
    </dialog>
  );
}
