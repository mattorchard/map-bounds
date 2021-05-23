# Map Bounding Box Estimator
Uses [WGS-84 util](https://www.npmjs.com/package/wgs84-util) to estimate the bounds of a square at a given lat/lng center point.

The wrapAround option specifies what should occur when the bounds cross over the poles or 180th meridian.
By default `clamp` is chosen, and the points will not exceed the boundary.
This guarantees the minimums are smaller than the maximums.
The `ignore` option will return the true value.
The `throw` value will throw when this condition is met.


As this method is based on the `wgs84.destination()` function the implementation is based on
[Vincenty's formulae](https://en.wikipedia.org/wiki/Vincenty's_formulae#Direct_Problem)
and is internally adapted from
[Chris Veness's](http://www.movable-type.co.uk/scripts/latlong-vincenty.html)
movable type scripts.