import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "ir.dreamguardian.app",
  appName: "Dream Guardian",
  webDir: "dist",
  backgroundColor: "#06060f",
  android: {
    allowMixedContent: false,
  },
};

export default config;
