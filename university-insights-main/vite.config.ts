// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const apiProxy = {
  target: "http://localhost:4000",
  changeOrigin: true,
  bypass: (req: any) => {
    // If it's a browser page navigation request, let Vite/TanStack Start serve the SPA
    if (req.headers?.accept?.includes("text/html")) {
      return req.url;
    }
  },
};

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    server: {
      allowedHosts: true,
      proxy: {
        "/api": apiProxy,
        "/auth": apiProxy,
        "/assessments": apiProxy,
        "/methodology": apiProxy,
        "/assessor": apiProxy,
        "/reports": apiProxy,
        "/evidence": apiProxy,
        "/questions": apiProxy,
        "/profile": apiProxy,
        "/institutional-data": apiProxy,
        "/enquiries": apiProxy,
        "/admin/login": apiProxy,
        "/admin/api": apiProxy,
        "/uploads": apiProxy,
        "/health": apiProxy,
        "/benchmarking": apiProxy,
        "/entitlements": apiProxy,
      },
    },
  },
});
