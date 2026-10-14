import { useDialog } from "../hooks/useDialog";
import { SLIDES } from "../data/site";
import { t } from "../i18n";

interface Props {
  index: number | null; // which slide to enlarge; null = closed (defaults show)
  onClose: () => void;
}

/* The image preview dialog. main.js filled in src/alt/caption on open and
   left the last picture in the hidden markup afterwards; the React version
   renders the defaults when closed and the chosen slide's data when open —
   the visible behaviour is identical. */

const DEFAULTS = SLIDES[0];

export default function PreviewDialog({ index, onClose }: Props) {
  const ref = useDialog(index !== null, onClose);
  const slide = index !== null ? SLIDES[index] : DEFAULTS;

  return (
    <dialog id="preview" ref={ref}>
      <button id="close-preview" type="button" aria-label={t.preview.closeLabel} onClick={onClose}>{t.preview.close} ×</button>
      <img src={slide.src} alt={t.slides[slide.id].alt} />
      <p id="preview-caption">{index !== null ? t.slides[slide.id].title : t.preview.defaultCaption}</p>
    </dialog>
  );
}
