import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tsconfigPaths(),
    tanstackStart({
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
      server: { entry: "server" },
    }),
    nitro({
      preset: "cloudflare-module",
      cloudflare: {
        nodeCompat: true,
        deployConfig: true,
        wrangler: {
          compatibility_flags: ["nodejs_compat_populate_process_env"],
          // Dashboard-managed Worker values must survive `wrangler deploy`.
          keep_vars: true,
        },
      },
    } as never),
    react(),
  ],
});
