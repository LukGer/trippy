import { describe, expect, it } from "bun:test";
import { Trip } from "../src/trip/trip";

describe("trip", () => {
  it("create", async () => {
    const tripId = await Trip.create({
      name: "My trip",
      startDate: new Date("2022-01-01"),
      endDate: new Date("2022-01-10"),
      members: [
        { userId: "1", isAdmin: true },
        { userId: "2", isAdmin: false },
      ],
    });

    expect(await Trip.fromId(tripId)).toBeDefined();
  });
});
