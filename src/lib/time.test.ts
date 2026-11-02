import { strict as assert } from "node:assert";
import { test } from "node:test";

import { bishkekToday } from "./bishkek-time.ts";

test("uses the next calendar day after midnight in Bishkek", () => {
  // 00:30 on 3 November in Bishkek is still 18:30 UTC on 2 November.
  assert.equal(bishkekToday(new Date("2026-11-02T18:30:00Z")), "2026-11-03");
});

test("keeps the local Bishkek date before midnight", () => {
  assert.equal(bishkekToday(new Date("2026-11-02T17:30:00Z")), "2026-11-02");
});
