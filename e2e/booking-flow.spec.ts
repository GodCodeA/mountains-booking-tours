import { expect, test, type Page } from "@playwright/test";

const tour = {
  id: "f11c9863-d0aa-47ef-a891-75b91c119f01",
  slug: "ala-archa-day-hike",
  name: "Ala-Archa Day Hike",
  summary: "An alpine day close to Bishkek.",
  description: "A test tour used only by browser checks.",
  region: "Chuy",
  difficulty: "Easy",
  duration_days: 1,
  price_per_person: 55,
  max_group_size: 10,
  highlights: ["Waterfall"],
  included: ["Guide"],
  not_included: ["Insurance"],
  meeting_point: "Ala-Too Square, Bishkek — 07:30",
  image_key: "ala-archa",
  sort_order: 1,
};

const longerTour = {
  ...tour,
  id: "3cb77ae4-0cee-4267-9009-aa29b9f151e4",
  slug: "kel-suu-adventure",
  name: "Kel-Suu Adventure",
  difficulty: "Challenging",
  duration_days: 4,
  price_per_person: 420,
  image_key: "kel-suu",
  sort_order: 2,
};

const departure = {
  id: "7ba7d79c-8c35-4d0a-a3e1-f7e092234b1e",
  tour_id: tour.id,
  departure_date: "2026-12-18",
  departure_time: "08:00:00",
  total_spots: 10,
  spots_taken: 2,
};

async function mockPublicCatalog(page: Page) {
  await page.route(
    "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
    (route) =>
      route.fulfill({
        contentType: "application/javascript",
        body: `
        window.turnstile = {
          render: (_container, options) => {
            options.callback("e2e-turnstile-token");
            return "e2e-widget";
          },
          remove: () => undefined,
        };
      `,
      }),
  );
  await page.route("**/rest/v1/tours*", async (route) => {
    const url = new URL(route.request().url());
    const slug = url.searchParams.get("slug");
    const results = slug ? [tour] : [tour, longerTour];
    await route.fulfill({ contentType: "application/json", body: JSON.stringify(results) });
  });
  await page.route("**/rest/v1/departures*", async (route) => {
    const url = new URL(route.request().url());
    const tourId = url.searchParams.get("tour_id");
    const results = tourId?.includes(tour.id) ? [departure] : [departure];
    await route.fulfill({ contentType: "application/json", body: JSON.stringify(results) });
  });
}

test.beforeEach(async ({ page }) => {
  await mockPublicCatalog(page);
});

test("trip finder narrows the homepage to matching tours", async ({ page }) => {
  await page.goto("/");

  const finder = page.getByTestId("trip-finder");
  await expect(finder).toBeVisible();
  // SSR paints the finder before React hydrates it. Retry the first interaction
  // until its ARIA state changes rather than racing the hydration boundary.
  for (const name of ["1 day", "Easy", "Under $200"]) {
    const choice = finder.getByRole("button", { name });
    await expect(async () => {
      await choice.click();
      await expect(choice).toHaveAttribute("aria-pressed", "true");
    }).toPass();
  }

  const results = page.getByTestId("trip-finder-results");
  await expect(results.getByRole("link", { name: /Ala-Archa Day Hike/ })).toBeVisible();
  await expect(results.getByRole("link", { name: /Kel-Suu Adventure/ })).toHaveCount(0);
});

test("guest reaches the verified booking review with an available future date", async ({
  page,
}) => {
  await page.goto("/book/ala-archa-day-hike");

  await page.getByRole("button", { name: /Dec 2026/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByLabel("Full name").fill("Test Guest");
  await page.getByLabel("Email").fill("guest@example.com");
  await page.getByLabel("Phone").fill("+996 555 123 456");
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByRole("heading", { name: "Review your booking" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Security check" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Confirm booking/ })).toBeEnabled();
});
