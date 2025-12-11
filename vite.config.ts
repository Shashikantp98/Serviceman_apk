import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {
  //   host: "192.168.29.42", // Allow access from other devices
  //   port: 5174, // Or any open port
  // },
});
