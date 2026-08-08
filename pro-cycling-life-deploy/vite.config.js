import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" utilise des chemins relatifs dans le build final — ça fonctionne automatiquement
// sur GitHub Pages, que ton dépôt s'appelle "pro-cycling-life" ou autre chose, sans rien à
// configurer manuellement. Si tu déploies ailleurs (Netlify, Vercel...), ça marche aussi tel quel.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
