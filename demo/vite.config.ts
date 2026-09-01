import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

/**
 * The demo is a static, read-only site: three routes, no server functions, no
 * API handlers, no database, no writes. These headers say so, and stop the page
 * reaching for anything it does not need.
 *
 * `script-src 'unsafe-inline'` is required by TanStack Start's hydration
 * barrier script. The clauses doing the real work here are `default-src 'self'`
 * — which is what would have contained the third-party script this site used to
 * load — and `frame-ancestors 'none'`.
 *
 * Google Fonts is the one external origin: the stylesheet comes from
 * fonts.googleapis.com and the font files it references from fonts.gstatic.com.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "object-src 'none'",
].join("; ");

const SECURITY_HEADERS = {
  "Content-Security-Policy": CSP,
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
};

export default defineConfig(({ command, isPreview }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 8081,
    strictPort: true,
  },
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    ...(command === "build" || isPreview
      ? [
          nitro({
            // Deploy target. Vercel by default; set SERVER_PRESET=node-server for
            // a plain Node build that runs on Render, an Oracle/AWS VM, or locally.
            preset: process.env.SERVER_PRESET ?? "vercel",
            routeRules: {
              "/**": { headers: SECURITY_HEADERS },
            },
          }),
        ]
      : []),
    viteReact(),
  ],
}));
