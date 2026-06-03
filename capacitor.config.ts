import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.thermalstat.skeleton",
  appName: "热统骨架",
  // Capacitor wraps the Vite production build in dist/.
  webDir: "dist",
  android: {
    // Keep the WebView background aligned with the app theme color.
    backgroundColor: "#f7f9f7",
  },
};

export default config;
