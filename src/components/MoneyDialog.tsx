import { useDialog } from "../hooks/useDialog";
import { t } from "../i18n";
import { rich } from "../i18n/rich";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MoneyDialog({ open, onClose }: Props) {
  const ref = useDialog(open, onClose);

  return (
    <dialog id="money" aria-labelledby="money-title" ref={ref}>
      <h2 id="money-title" className="money-title">{t.money.title}</h2>
      <p className="money-lede">{rich(t.money.lede, "money-hot")}</p>
      <p className="money-note">{t.money.note}</p>
      <button type="button" className="money-close" aria-label={t.close} onClick={onClose}>×</button>
    </dialog>
  );
}
