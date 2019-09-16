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


// meridian intersection
void normalizeLon(double& lon, double& center) {
  double i = center - 180;
  double j = center + 180;
  while (lon < i) lon += 360;
  while (lon > j) lon -= 360;
}

void ensureArgOrder(Coord& p1, Coord& p2, double& meridian) {
  normalizeLon(p1.lon, meridian);
  normalizeLon(p2.lon, meridian);

  if (p2.lon < p1.lon) {
    Coord swp = p1;
    p1 = p2;
    p2 = swp;
  }
};

Coord meridianIntersection_(Coord p1, Coord p2, double meridian, double s12,
    const std::function<void(double s12, double& lat, double& lon)>& position) {
  double left = 0;
  double right = s12;
  double middle;
  double lat, lon = p1.lon;
  double lastLon = lon;

  while (left < right && abs(meridian - lon) > 1E-8) {
    middle = (left + right) * 0.5;
    position(middle, lat, lon);
    normalizeLon(lon, meridian);

    if (abs(lon - lastLon) < 1E-9) {
      break;
    }

    if (meridian < lon) {
      right = middle;
    } else if (meridian > lon) {
      left = middle;
    } else {
      break;
    }

    lastLon = lon;
  }

  return Coord {lon, lat};
}


// Geodesic
struct GeodesicDirectResult {
  double distance;
  double initialBearing;
  double finalBearing;
};

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
  double da = line.Distance() / (numPoints - 1);

  for (int i = 0; i < numPoints; i++) {
    line.Position(i * da, flatCoords[2 * i + 1], flatCoords[2 * i]);
  }
}

void geodesicInterpolate(Coord p1, Coord p2, intptr_t ptr, int numPoints) {
  geodesicInterpolate_(p1, p2, reinterpret_cast<double *>(ptr), numPoints);
}

Coord geodesicMeridianIntersection(Coord p1, Coord p2, double meridian) {
  ensureArgOrder(p1, p2, meridian);
  const Geodesic& geodesic = Geodesic::WGS84();
  const GeodesicLine line = geodesic.InverseLine(p1.lat, p1.lon, p2.lat, p2.lon);
  return meridianIntersection_(p1, p2, meridian, line.Distance(),
      [line](double s12, double& lat, double& lon) {
        line.Position(s12, lat, lon);
      });
}


// Rhumb
struct RhumbDirectResult {
  double distance;
  double bearing;
};

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

RhumbLine getInverseRhumbLine(Coord p1, Coord p2, double& s12) {
  const Rhumb& rhumb = Rhumb::WGS84();
  double azi1;
  rhumb.Inverse(p1.lat, p1.lon, p2.lat, p2.lon, s12, azi1);
  return rhumb.Line(p1.lat, p1.lon, azi1);
}

void rhumbInterpolate_(Coord p1, Coord p2, double * flatCoords, int numPoints) {
  double s12;
  const RhumbLine line = getInverseRhumbLine(p1, p2, s12);
  double ds = s12 / (numPoints - 1);

  for (int i = 0; i < numPoints; i++) {
    line.Position(i * ds, flatCoords[2 * i + 1], flatCoords[2 * i]);
  }
}

void rhumbInterpolate(Coord p1, Coord p2, intptr_t ptr, int numPoints) {
  rhumbInterpolate_(p1, p2, reinterpret_cast<double *>(ptr), numPoints);
}

Coord rhumbMeridianIntersection(Coord p1, Coord p2, double meridian) {
  ensureArgOrder(p1, p2, meridian);
  const Rhumb& rhumb = Rhumb::WGS84();
  double s12;
  const RhumbLine line = getInverseRhumbLine(p1, p2, s12);
  return meridianIntersection_(p1, p2, meridian, s12,
      [line](double s12, double& lat, double& lon) {
        line.Position(s12, lat, lon);
      });
};


// coordinate conversion
std::string toMGRS(Coord p) {
  int zone;
  bool northp;
  double x, y;
  std::string mgrs;

  // GeographicLib will throw an error for latitudes outside +/- 90. return an INVALID string instead.
  if (abs(p.lat) > 90) {
    mgrs = "INVALID";
  } else {
    UTMUPS::Forward(p.lat, p.lon, zone, northp, x, y);
    MGRS::Forward(zone, northp, x, y, 5, mgrs);
  }

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
  function("geodesicMeridianIntersection", &geodesicMeridianIntersection);
  function("rhumbDirect", &rhumbDirect);
  function("rhumbInverse", &rhumbInverse);
  function("rhumbInterpolate", &rhumbInterpolate);
  function("rhumbMeridianIntersection", &rhumbMeridianIntersection);
  function("toMGRS", &toMGRS);
  function("toLonLat", &toLonLat);
}
