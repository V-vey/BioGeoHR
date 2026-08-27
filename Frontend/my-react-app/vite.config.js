import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url"; // 1. Add this import

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // 2. Map the "@" symbol directly to your "src" folder
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
