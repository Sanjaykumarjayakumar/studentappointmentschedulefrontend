import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// In development the React app proxies /api to your Express server,
// so you never hit CORS problems. Change BACKEND_URL in .env if needed.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backend = env.BACKEND_URL || "http://localhost:5000";
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: { "/api": { target: backend, changeOrigin: true } },
    },
  };
});
