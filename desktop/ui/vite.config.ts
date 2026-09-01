import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The webhapp UI is served from a file:// style origin inside Electron, so every
// asset reference must be relative.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: { outDir: "dist", emptyOutDir: true },
});
