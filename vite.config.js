import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/english-town-games/" : "/",
  server: {
    host: "localhost",
    port: 5173,
  },
  preview: {
    host: "localhost",
    port: 4173,
  },
}));
