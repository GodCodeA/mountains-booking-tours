import { expect, test, type Page } from "@playwright/test";

const tour = {
  id: "f11c9863-d0aa-47ef-a891-75b91c119f01",
  slug: "ala-archa-day-hike",
  name: "Ala-Archa Day Hike",
  summary: "An alpine day close to Bishkek.",
  description: "A test tour used only by responsive browser checks.",
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

const secondTour = {
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

const viewports = [
  { name: "phone-320", width: 320, height: 720 },
  { name: "phone-375", width: 375, height: 812 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "laptop-1024", width: 1024, height: 768 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

async function mockPublicCatalog(page: Page) {
  await page.route("**/rest/v1/tours*", async (route) => {
    const slug = new URL(route.request().url()).searchParams.get("slug");
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(slug ? [tour] : [tour, secondTour]),
    });
  });
  await page.route("**/rest/v1/departures*", (route) =>
    route.fulfill({ contentType: "application/json", body: JSON.stringify([departure]) }),
  );
}

async function expectNoPageOverflow(page: Page) {
  const layout = await page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const overflowedElements = Array.from(document.querySelectorAll("body *"))
      .map((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          className: typeof element.className === "string" ? element.className : "",
          right: Math.ceil(bounds.right),
          left: Math.floor(bounds.left),
        };
      })
      .filter(({ right, left }) => right > viewportWidth + 1 || left < -1)
      .slice(0, 5);
    const overflowingBoxes = Array.from(document.querySelectorAll<HTMLElement>("body *"))
      .filter((element) => element.clientWidth > 0 && element.scrollWidth > element.clientWidth + 1)
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        className: element.className,
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        text: element.textContent?.trim().slice(0, 80),
      }))
      .slice(0, 10);
    const track = document.querySelector<HTMLElement>("[data-testid='featured-tour-track']");
    const carousel = document.querySelector<HTMLElement>("[data-testid='featured-tour-carousel']");

    window.scrollTo(10_000, 0);
    const globalScrollLeft = window.scrollX;
    window.scrollTo(0, 0);

    return {
      viewportWidth,
      documentWidth: document.documentElement.scrollWidth,
      globalScrollLeft,
      overflowedElements,
      overflowingBoxes,
      carousel: carousel
        ? {
            clientWidth: carousel.clientWidth,
            scrollWidth: carousel.scrollWidth,
            overflowX: getComputedStyle(carousel).overflowX,
          }
        : null,
      track: track
        ? {
            clientWidth: track.clientWidth,
            scrollWidth: track.scrollWidth,
            overflowX: getComputedStyle(track).overflowX,
          }
        : null,
    };
  });

  expect(layout.globalScrollLeft, `Layout: ${JSON.stringify(layout)}`).toBeLessThanOrEqual(1);
}

async function expectLocalFonts(page: Page) {
  const fonts = await page.evaluate(async () => {
    await document.fonts.ready;
    return {
      displayLoaded: document.fonts.check("400 16px Oswald"),
      sansLoaded: document.fonts.check("400 16px Manrope"),
      headingFamily: getComputedStyle(document.querySelector("h1")!).fontFamily,
      bodyFamily: getComputedStyle(document.body).fontFamily,
    };
  });

  expect(fonts.displayLoaded).toBe(true);
  expect(fonts.sansLoaded).toBe(true);
  expect(fonts.headingFamily).toContain("Oswald");
  expect(fonts.bodyFamily).toContain("Manrope");
}

test.beforeEach(async ({ page }) => {
  await mockPublicCatalog(page);
  await page.addInitScript(() => window.localStorage.removeItem("ala-too-language"));
});

test("public pages stay readable without horizontal page overflow at common widths", async ({
  page,
}) => {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect
      .poll(() => page.evaluate(() => window.localStorage.getItem("ala-too-language")))
      .toBe("en");
    await page.getByRole("button", { name: "EN", exact: true }).click();
    await expect(page.getByRole("heading", { name: /Go where the mountains lead/ })).toBeVisible();
    if (viewport.width === 320) await expectLocalFonts(page);
    await expectNoPageOverflow(page);

    if (viewport.width <= 375) {
      await page.getByRole("button", { name: "РУ", exact: true }).click();
      await expect(
        page.getByRole("heading", { name: /Идите туда, куда ведут горы/ }),
      ).toBeVisible();
      await expectNoPageOverflow(page);

      await page.getByRole("button", { name: "КЫ", exact: true }).click();
      await expect(
        page.getByRole("heading", { name: /Тоолор алып барган жакка барыңыз/ }),
      ).toBeVisible();
      await expectNoPageOverflow(page);

      await page.getByRole("button", { name: "EN", exact: true }).click();
    }

    await page.goto("/tours/ala-archa-day-hike");
    await expect(page.getByRole("heading", { name: "Ala-Archa Day Hike" })).toBeVisible();
    await expectNoPageOverflow(page);
  }
});
