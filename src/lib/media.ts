/* Shared by every self-driven animation: reduce motion means none. A module
   singleton, read live (`.matches`) exactly like the old main.js did — never
   snapshot it into state, or a mid-visit preference change would be missed. */

export const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
