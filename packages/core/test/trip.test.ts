import { describe, expect, it } from "bun:test";
import { Trip } from "../src/trip/trip";

describe("trip", () => {
  it("create", async () => {
    const tripId = await Trip.create({
      name: "My trip",
      imageUrl: null,
      startDate: new Date("2022-01-01"),
      endDate: new Date("2022-01-10"),
      memberIds: ["1", "2"],
    });

    expect(await Trip.fromId(tripId)).toBeDefined();
  });
});
