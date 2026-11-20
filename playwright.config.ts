import { defineConfig, devices } from "@playwright/test";

const projects = [
  { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  { name: "webkit", use: { ...devices["Desktop Safari"] } },
];

// Firefox is opt-in while its locally installed Nightly build cannot create a
// headless profile on this Mac. It remains easy to enable on CI or another machine.
if (process.env["PLAYWRIGHT_INCLUDE_FIREFOX"] === "true") {
  projects.splice(1, 0, { name: "firefox", use: { ...devices["Desktop Firefox"] } });
}

export default defineConfig({
  testDir: "./e2e",
  // The Vite development server serves TanStack's generated client modules;
  // keep this small suite serial so parallel browsers do not race that server.
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env["CI"]),
  retries: process.env["CI"] ? 2 : 0,
  reporter: process.env["CI"] ? [["html", { open: "never" }], ["list"]] : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
  },
  projects,
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env["CI"],
    timeout: 30_000,
    // A public dummy site key is enough because the widget itself is mocked
    // below; no real Turnstile request or secret is used in browser tests.
    env: { VITE_TURNSTILE_SITE_KEY: "1x00000000000000000000AA" },
  },
});
