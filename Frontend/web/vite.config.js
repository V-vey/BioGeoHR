// import path from "path";
// import { fileURLToPath } from "url";
// import react, { reactCompilerPreset } from "@vitejs/plugin-react";
// import babel from "@rolldown/plugin-babel";
// import { defineConfig } from "vite";
// import tailwindcss from "@tailwindcss/vite";

// // Define __dirname manually for ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // https://vite.dev
// export default defineConfig({
//   plugins: [
//     react(),
//     babel({ presets: [reactCompilerPreset()] }),
//     tailwindcss(),
//   ],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
// });

import path from "path";
import { fileURLToPath } from "url";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Where "npm run dev" forwards /api to. Keep it the same as API_ORIGIN in src/resources/api.jsx.
const API_TARGET =
  process.env.VITE_API_TARGET ?? "https://froth-limes-skid.ngrok-free.dev";
  // process.env.VITE_API_TARGET ?? "http://localhost:8000";

export default defineConfig({
  plugins: [
    react({
      babel: {
        presets: [reactCompilerPreset()],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // the website calls /api on its own address; Vite passes it on to the API, so the login cookie is
    // first-party (see src/resources/api.jsx)
    proxy: {
      "/api": {
        target: API_TARGET,
        changeOrigin: true,
        headers: { "ngrok-skip-browser-warning": "true" },
      },
    },
  },
});
