import { useEffect, useRef } from "react";

/* Native <dialog> wiring shared by the money modal, the preview and the
   playtest questionnaire. The open prop drives showModal()/close(); Escape
   and the native close come back through onClose. The outside-click close is
   ported from the old main.js: a click that lands on the dialog element
   itself (i.e. the ::backdrop area) AND outside the dialog's box closes it. */
export function useDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  /* showModal() blocks clicks behind the dialog but not scrolling — lock the
     page for as long as any dialog is open. Save/restore keeps it balanced
     under StrictMode's double effects and across stacked dialogs. */
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    dlg.addEventListener("close", onClose);
    return () => dlg.removeEventListener("close", onClose);
  }, [onClose]);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    const onOutsideClick = (event: MouseEvent) => {
      if (event.target !== dlg) return;
      const box = dlg.getBoundingClientRect();
      const outside = event.clientX < box.left || event.clientX > box.right ||
                      event.clientY < box.top || event.clientY > box.bottom;
      if (outside) dlg.close();
    };
    dlg.addEventListener("click", onOutsideClick);
    return () => dlg.removeEventListener("click", onOutsideClick);
  }, []);

  return ref;
}
