import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

// Set status bar for native platforms
if (Capacitor.isNativePlatform()) {
  // Set overlay first to ensure proper rendering
  StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {
    console.log("StatusBar.setOverlaysWebView not available");
  });
  
  // Style.Light = light background with DARK/BLACK icons (what we want for #DEDFFC)
  StatusBar.setStyle({ style: Style.Light }).catch(() => {
    console.log("StatusBar.setStyle not available");
  });
  
  // Set background color for Android (iOS uses CSS background)
  StatusBar.setBackgroundColor({ color: "#DEDFFC" }).catch(() => {
    console.log("StatusBar.setBackgroundColor not available");
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
