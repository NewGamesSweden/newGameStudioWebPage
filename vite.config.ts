import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Defaults are right for this site: root '.', publicDir 'public' (the images
// live there and are served/copied verbatim), build.outDir 'dist'.
export default defineConfig({
  plugins: [react()],
});
