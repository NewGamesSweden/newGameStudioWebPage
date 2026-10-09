import { useDialog } from "../hooks/useDialog";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MoneyDialog({ open, onClose }: Props) {
  const ref = useDialog(open, onClose);

  return (
    <dialog id="money" aria-labelledby="money-title" ref={ref}>
      <h2 id="money-title" className="money-title">Gallery is free</h2>
      <p className="money-lede">but if you’re <span className="money-hot">rich as hell</span>,<br />we’d like <span className="money-hot">several million euros</span> please</p>
      <p className="money-note">donation link coming soon. You can still mail us cash or other valuables</p>
      <button type="button" className="money-close" aria-label="Close" onClick={onClose}>×</button>
    </dialog>
  );
}
