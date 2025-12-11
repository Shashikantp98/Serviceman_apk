import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.instasevak.sevak",
  appName: "InstaSevak",
  webDir: "dist",
  plugins: {
    StatusBar: {
      backgroundColor: "#DEDFFC",
      style: "DARK",
      overlaysWebView: false,
    },
  },
  // server: {
  //   cleartext: true,
  //   url: "http://192.168.29.42:5174", // Allow access from other devices
  // },
};

export default config;
