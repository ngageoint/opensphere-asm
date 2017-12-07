#include <string>
#include <stdint.h>
#include <emscripten/bind.h>
#include <GeographicLib/Geodesic.hpp>
#include <GeographicLib/GeodesicLine.hpp>
#include <GeographicLib/Rhumb.hpp>
#include <GeographicLib/UTMUPS.hpp>
#include <GeographicLib/MGRS.hpp>

using namespace GeographicLib;
using namespace emscripten;

struct Coord {
  double lon;
  double lat;
};

struct GeodesicDirectResult {
  double distance;
  double initialBearing;
  double finalBearing;
};

struct RhumbDirectResult {
  double distance;
  double bearing;
};

// Geodesic
GeodesicDirectResult geodesicInverse(Coord p1, Coord p2) {
  const Geodesic& geodesic = Geodesic::WGS84();
  double s12, azi1, azi2;
  geodesic.Inverse(p1.lat, p1.lon, p2.lat, p2.lon, s12, azi1, azi2);
  return GeodesicDirectResult {s12, azi1, azi2};
}

Coord geodesicDirect(Coord p1, double azi1, double s12) {
  const Geodesic& geodesic = Geodesic::WGS84();
  double lon2, lat2;
  geodesic.Direct(p1.lat, p1.lon, azi1, s12, lat2, lon2);
  return Coord {lon2, lat2};
}

void geodesicInterpolate_(Coord p1, Coord p2, double * flatCoords, int numPoints) {
  const Geodesic& geodesic = Geodesic::WGS84();
  const GeodesicLine line = geodesic.InverseLine(p1.lat, p1.lon, p2.lat, p2.lon);
  double da = line.Arc() / (numPoints - 1);

  for (int i = 0; i < numPoints; i++) {
    line.ArcPosition(i * da, flatCoords[2 * i + 1], flatCoords[2 * i]);
  }
}

void geodesicInterpolate(Coord p1, Coord p2, intptr_t ptr, int numPoints) {
  geodesicInterpolate_(p1, p2, reinterpret_cast<double *>(ptr), numPoints);
}

// Rhumb
RhumbDirectResult rhumbInverse(Coord p1, Coord p2) {
  const Rhumb& rhumb = Rhumb::WGS84();
  double s12, azi1;
  rhumb.Inverse(p1.lat, p1.lon, p2.lat, p2.lon, s12, azi1);
  return RhumbDirectResult {s12, azi1};
}

Coord rhumbDirect(Coord p1, double azi1, double s12) {
  const Rhumb& rhumb = Rhumb::WGS84();
  double lon2, lat2;
  rhumb.Direct(p1.lat, p1.lon, azi1, s12, lat2, lon2);
  return Coord {lon2, lat2};
}

void rhumbInterpolate_(Coord p1, Coord p2, double * flatCoords, int numPoints) {
  const Rhumb& rhumb = Rhumb::WGS84();
  double azi1, s12;
  rhumb.Inverse(p1.lat, p1.lon, p2.lat, p2.lon, s12, azi1);
  const RhumbLine line = rhumb.Line(p1.lat, p1.lon, azi1);
  double ds = s12 / (numPoints - 1);
  double dontcare;
  unsigned outmask = Rhumb::mask::LATITUDE | Rhumb::mask::LONGITUDE;

  for (int i = 0; i < numPoints; i++) {
    line.GenPosition(i * ds, outmask, flatCoords[2 * i + 1], flatCoords[2 * i], dontcare);
  }
}

void rhumbInterpolate(Coord p1, Coord p2, intptr_t ptr, int numPoints) {
  rhumbInterpolate_(p1, p2, reinterpret_cast<double *>(ptr), numPoints);
}

// coordinate conversion
std::string toMGRS(Coord p) {
  int zone;
  bool northp;
  double x, y;
  UTMUPS::Forward(p.lat, p.lon, zone, northp, x, y);
  std::string mgrs;
  MGRS::Forward(zone, northp, x, y, 5, mgrs);
  return mgrs;
};

Coord toLonLat(std::string mgrs) {
  int zone, prec;
  bool northp;
  double x, y;
  MGRS::Reverse(mgrs, zone, northp, x, y, prec);
  double lat, lon;
  UTMUPS::Reverse(zone, northp, x, y, lat, lon);
  return Coord {lon, lat};
};

EMSCRIPTEN_BINDINGS(GeographicLib) {
  // map Coord struct to an array
  value_array<Coord>("Coord")
    .element(&Coord::lon)
    .element(&Coord::lat);

  // map Result struct to an object
  value_object<GeodesicDirectResult>("GeodesicDirectResult")
    .field("distance", &GeodesicDirectResult::distance)
    .field("initialBearing", &GeodesicDirectResult::initialBearing)
    .field("finalBearing", &GeodesicDirectResult::finalBearing);

  value_object<RhumbDirectResult>("RhumbDirectResult")
    .field("distance", &RhumbDirectResult::distance)
    .field("bearing", &RhumbDirectResult::bearing);

  function("geodesicDirect", &geodesicDirect);
  function("geodesicInverse", &geodesicInverse);
  function("geodesicInterpolate", &geodesicInterpolate);
  function("rhumbDirect", &rhumbDirect);
  function("rhumbInverse", &rhumbInverse);
  function("rhumbInterpolate", &rhumbInterpolate);
  function("toMGRS", &toMGRS);
  function("toLonLat", &toLonLat);
}
