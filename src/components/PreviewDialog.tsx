import { useDialog } from "../hooks/useDialog";
import { SLIDES } from "../data/site";

interface Props {
  index: number | null; // which slide to enlarge; null = closed (defaults show)
  onClose: () => void;
}

/* The image preview dialog. main.js filled in src/alt/caption on open and
   left the last picture in the hidden markup afterwards; the React version
   renders the defaults when closed and the chosen slide's data when open —
   the visible behaviour is identical. */

const DEFAULTS = SLIDES.find(slide => slide.src === "assets/gallery.png")!;

export default function PreviewDialog({ index, onClose }: Props) {
  const ref = useDialog(index !== null, onClose);
  const slide = index !== null ? SLIDES[index] : DEFAULTS;

  return (
    <dialog id="preview" ref={ref}>
      <button id="close-preview" type="button" aria-label="Close image preview" onClick={onClose}>Close ×</button>
      <img src={slide.src} alt={slide.alt} />
      <p id="preview-caption">{index !== null ? slide.title : "Gallery, from development to game"}</p>
    </dialog>
  );
}
