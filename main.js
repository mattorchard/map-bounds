const wgs84 = require("wgs84-util");

const BEARINGS = {
  NORTH: 0,
  EAST: 90,
  SOUTH: 180,
  WEST: 270,
};

const clampLatitude = (latitude, isPositive) => {
  if (isPositive) return latitude >= 0 ? latitude : 90;
  else return latitude <= 0 ? latitude : -90;
};

const clampLongitude = (longitude, isPositive) => {
  if (isPositive) return longitude >= 0 ? longitude : 180;
  else return longitude <= 0 ? longitude : -180;
};

/**
 * @param {Object} center (GeoJson Point)
 * @param {number} distance
 * @param {"clamp" | "throw" | "ignore"} wrapAround
 */
module.exports.getBounds = (center, distance, wrapAround = "clamp") => {
  const [, maxLatitude] = wgs84.destination(center, BEARINGS.NORTH, distance)
    .point.coordinates;

  const [maxLongitude] = wgs84.destination(center, BEARINGS.EAST, distance)
    .point.coordinates;

  const [, minLatitude] = wgs84.destination(center, BEARINGS.SOUTH, distance)
    .point.coordinates;

  const [minLongitude] = wgs84.destination(center, BEARINGS.WEST, distance)
    .point.coordinates;

  // If either coordinate is lower then it's pair then we've passed a world border
  const hasWrapped = minLongitude > maxLongitude || minLatitude > maxLatitude;

  if (wrapAround === "ignore" || !hasWrapped)
    return { minLongitude, minLatitude, maxLongitude, maxLatitude };

  if (wrapAround === "throw")
    new Error(`Bounding box has wrapped around world boundaries`);

  if (wrapAround === "clamp") {
    const [centerLongitude, centerLatitude] = center.coordinates;
    const isLatitudePositive = centerLatitude >= 0;
    const isLongitudePositive = centerLongitude >= 0;
    return {
      minLongitude: clampLongitude(minLongitude, isLongitudePositive),
      minLatitude: clampLatitude(minLatitude, isLatitudePositive),
      maxLongitude: clampLongitude(maxLongitude, isLongitudePositive),
      maxLatitude: clampLatitude(maxLatitude, isLatitudePositive),
    };
  }

  throw new Error(`Invalid value specified for wrapAround "${wrapAround}"`);
};
