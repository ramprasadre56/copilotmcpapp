import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "path";

// Get the app name from env or default to weather
const appName = process.env.APP_NAME || "weather";

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  root: path.resolve(__dirname, `src/apps/${appName}`),
  build: {
    outDir: path.resolve(__dirname, `dist/apps/${appName}`),
    emptyOutDir: true,
  },
});
