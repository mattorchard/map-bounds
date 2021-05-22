const wgs84 = require("wgs84-util");

describe("destination", () => {
  test("Externally validated sample", () => {
    const start = {
      type: "Point",
      coordinates: [-75, 45],
    };
    const bearing = 135; // South East
    const distance = 100_000; // 100 KM

    const end = wgs84.destination(start, bearing, distance);
    expect(end.point).toEqual({
      type: "Point",
      coordinates: [-74.1130055918, 44.360216579],
    });
  });
});