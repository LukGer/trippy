import { describe, it } from "bun:test";
import { Place } from "../src/place/place";

describe("place", () => {
  it("shouldFindPlaces", async () => {
    const places = await Place.searchPlace({ search: "Berlin" });

    expect(places).toBeDefined();
  });
});
