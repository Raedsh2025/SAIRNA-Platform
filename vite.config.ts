import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_API_PROXY_TARGET?.trim();

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      port: 5173,
      host: true,
      // أثناء التطوير نمرّر طلبات /api إلى الخادم الحقيقي لتفادي CORS.
      proxy: proxyTarget
        ? {
            "/api": {
              target: proxyTarget,
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
    },
    preview: {
      port: 4173,
    },
    build: {
      outDir: "dist",
      sourcemap: true,
    },
  };
});
