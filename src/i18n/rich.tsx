import { Fragment, type ReactNode } from "react";

/* Renders a translated string's light markup: [brackets] become a <span>
   (with className, or bare where the CSS styles `.fools-title span`) and \n
   becomes a <br />. That is the whole syntax. */
export function rich(text: string, className?: string): ReactNode {
  return text.split("\n").map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line.split(/\[([^\]]*)\]/).map((part, j) =>
        j % 2 === 1 ? <span className={className} key={j}>{part}</span> : part)}
    </Fragment>
  ));
}
