import { useDialog } from "../hooks/useDialog";
import { DONATION_URL } from "../data/site";
import { t } from "../i18n";
import { rich } from "../i18n/rich";

interface Props {
  open: boolean;
  onClose: () => void;
}

/* The money dialog, opened by the nav's "give us money": the pitch, then the
   donation link as an accent button labelled with the address itself (the
   same in every language), then the mail-us-cash aside. */

// "buymeacoffee.com/newgamestudio", splittable after the host's slash so the
// button can take two lines in the narrowest phone dialogs instead of overflowing.
const [DONATION_HOST, ...DONATION_PATH] = DONATION_URL.replace(/^https?:\/\//, "").split("/");

export default function MoneyDialog({ open, onClose }: Props) {
  const ref = useDialog(open, onClose);

  return (
    <dialog id="money" aria-labelledby="money-title" ref={ref}>
      <h2 id="money-title" className="money-title">{t.money.title}</h2>
      <p className="money-lede">{rich(t.money.lede, "money-hot")}</p>
      <a className="button money-link" href={DONATION_URL} target="_blank" rel="noopener noreferrer">
        <span>{DONATION_HOST}{DONATION_PATH.length > 0 && <>/<wbr />{DONATION_PATH.join("/")}</>}</span>
        <span aria-hidden="true">↗</span>
      </a>
      <p className="money-note">{t.money.note}</p>
      <button type="button" className="money-close" aria-label={t.close} onClick={onClose}>×</button>
    </dialog>
  );
}
