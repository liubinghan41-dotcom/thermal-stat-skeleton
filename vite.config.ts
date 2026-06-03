import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Relative base so the build also works when opened from a sub-path or
// wrapped inside a Capacitor WebView (assets are served from file://).
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "热统骨架",
        short_name: "热统骨架",
        description: "教材页优先的热力学与统计力学知识图谱（离线可用）",
        lang: "zh-CN",
        dir: "ltr",
        start_url: ".",
        scope: ".",
        display: "standalone",
        orientation: "any",
        background_color: "#f7f9f7",
        theme_color: "#f7f9f7",
        categories: ["education", "reference", "science"],
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Precache the whole shell, the bundled dataset and the KaTeX fonts
        // so every view (math included) works fully offline after first load.
        globPatterns: ["**/*.{js,css,html,svg,png,ico,json,woff,woff2,ttf}"],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        navigateFallback: "index.html",
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
