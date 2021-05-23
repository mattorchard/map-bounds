const wgs84 = require("wgs84-util");
const { getBounds } = require("../main");

const dist = (x1, y1, x2, y2) =>
  wgs84.distanceBetween(
    { coordinates: [x1, y1] },
    { coordinates: [x2, y2] },
    false
  );

const getDiagonalDistance = ({
  minLongitude,
  minLatitude,
  maxLongitude,
  maxLatitude,
}) => dist(minLongitude, minLatitude, maxLongitude, maxLatitude);

const getPerimeter = ({
  minLongitude,
  minLatitude,
  maxLongitude,
  maxLatitude,
}) =>
  dist(minLongitude, minLatitude, maxLongitude, minLatitude) +
  dist(maxLongitude, minLatitude, maxLongitude, maxLatitude) +
  dist(maxLongitude, maxLatitude, minLongitude, maxLatitude) +
  dist(minLongitude, maxLatitude, minLongitude, minLatitude);

describe("No wraparound", () => {
  const distance = 100_000;
  const startToronto = {
    type: "Point",
    coordinates: [-79.832, 43.6532],
  };
  const startOntario = {
    type: "Point",
    coordinates: [-75, 45],
  };

  test("Basic case", () => {
    expect(getBounds(startOntario, distance)).toEqual({
      maxLatitude: 45.8997614534,
      maxLongitude: -73.731821829,
      minLatitude: 44.1000961752,
      minLongitude: -76.268178171,
    });
  });

  test("Diagonal distance", () => {
    const bounds = getBounds(startOntario, distance);
    expect(getDiagonalDistance(bounds)).toBeCloseTo(
      distance * 2 * Math.sqrt(2),
      -2
    );
  });

  test("Total perimeter", () => {
    const bounds = getBounds(startOntario, distance);
    expect(getPerimeter(bounds)).toBeCloseTo(distance * 2 * 4, -3);
  });

  test("Extreme clamps", () => {
    const radiusToEncircleCanada = 5_000_000;
    expect(getBounds(startToronto, radiusToEncircleCanada)).toEqual({
      maxLatitude: 88.507741484,
      maxLongitude: -25.8640972573,
      minLatitude: -1.4895852414,
      minLongitude: -133.7999027427,
    });
  });
});

describe("With wraparound", () => {
  const distance = 500_000;
  const startGambell = {
    type: "Point",
    coordinates: [-171.758689, 63.7482464],
  };

  test("Clamps if requested", () => {
    expect(getBounds(startGambell, distance, "clamp")).toEqual({
      minLongitude: -180, // Clamped
      maxLatitude: 68.2322731851,
      maxLongitude: -161.7148670392,
      minLatitude: 59.2614126668,
    });
  });

  test("Clamp reduces perimeter", () => {
    const bounds = getBounds(startGambell, distance, "clamp");
    expect(getPerimeter(bounds)).toBeLessThan(8 * distance);
  });

  test("Ignores if requested", () => {
    expect(getBounds(startGambell, distance, "ignore")).toEqual({
      maxLatitude: 68.2322731851,
      maxLongitude: -161.7148670392, // Smaller than min
      minLatitude: 59.2614126668,
      minLongitude: 178.1974890392, // Larger than max
    });
  });

  test("Throws on invalid behaviour requested", () => {
    // noinspection JSCheckFunctionSignatures
    expect(() => getBounds(startGambell, distance, "CLEARLY_FAKE")).toThrow(
      `Invalid value specified for wrapAround "CLEARLY_FAKE"`
    );
  });
});
