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


// meridian intersection
void normalizeLon(double& lon, double& center) {
  double i = center - 180;
  double j = center + 180;
  while (lon < i) lon += 360;
  while (lon > j) lon -= 360;
}

void swap(double& n1, double& n2) {
  double swp = n1;
  n1 = n2;
  n2 = swp;
}

void ensureArgOrder(double& lon1, double& lat1, double& lon2, double& lat2,  double& meridian) {
  normalizeLon(lon1, meridian);
  normalizeLon(lon2, meridian);

  if (lon2 < lon1) {
    swap(lon1, lon2);
    swap(lat1, lat2);
  }
};

void meridianIntersection_(double meridian, double s12, double& lon, double& lat,
    const std::function<void(double s12, double& lat, double& lon)>& position) {
  double left = 0;
  double right = s12;
  double middle;
  lon = -99999;
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
}


// Geodesic
void geodesicInverse(double lon1, double lat1, double lon2, double lat2, intptr_t ptr) {
  const Geodesic& geodesic = Geodesic::WGS84();
  double * result = reinterpret_cast<double *>(ptr);
  geodesic.Inverse(lat1, lon1, lat2, lon2, result[0], result[1], result[2]);
}

void geodesicDirect(double lon1, double lat1, double azi1, double s12, intptr_t ptr) {
  const Geodesic& geodesic = Geodesic::WGS84();
  double * result = reinterpret_cast<double *>(ptr);
  geodesic.Direct(lat1, lon1, azi1, s12, result[1], result[0]);
}

void geodesicInterpolate(double lon1, double lat1, double lon2, double lat2, intptr_t ptr, int numPoints) {
  const Geodesic& geodesic = Geodesic::WGS84();
  const GeodesicLine line = geodesic.InverseLine(lat1, lon1, lat2, lon2);
  double * result = reinterpret_cast<double *>(ptr);
  double da = line.Distance() / (numPoints - 1);

  for (int i = 0; i < numPoints; i++) {
    line.Position(i * da, result[2 * i + 1], result[2 * i]);
  }
}


void geodesicMeridianIntersection(double lon1, double lat1, double lon2, double lat2, double meridian, intptr_t ptr) {
  ensureArgOrder(lon1, lat1, lon2, lat2, meridian);
  const Geodesic& geodesic = Geodesic::WGS84();
  double * result = reinterpret_cast<double *>(ptr);
  const GeodesicLine line = geodesic.InverseLine(lat1, lon1, lat2, lon2);
  meridianIntersection_(meridian, line.Distance(), result[0], result[1],
      [line](double s12, double& lat, double& lon) {
        line.Position(s12, lat, lon);
      });
}


// Rhumb
void rhumbInverse(double lon1, double lat1, double lon2, double lat2, intptr_t ptr) {
  const Rhumb& rhumb = Rhumb::WGS84();
  double * result = reinterpret_cast<double *>(ptr);
  rhumb.Inverse(lat1, lon1, lat2, lon2, result[0], result[1]);
}

void rhumbDirect(double lon1, double lat1, double azi1, double s12, intptr_t ptr) {
  const Rhumb& rhumb = Rhumb::WGS84();
  double * result = reinterpret_cast<double *>(ptr);
  rhumb.Direct(lat1, lon1, azi1, s12, result[1], result[0]);
}

RhumbLine getInverseRhumbLine(double lon1, double lat1, double lon2, double lat2, double& s12) {
  const Rhumb& rhumb = Rhumb::WGS84();
  double azi1;
  rhumb.Inverse(lat1, lon1, lat2, lon2, s12, azi1);
  return rhumb.Line(lat1, lon1, azi1);
}

void rhumbInterpolate(double lon1, double lat1, double lon2, double lat2, intptr_t ptr, int numPoints) {
  double s12;
  const RhumbLine line = getInverseRhumbLine(lon1, lat1, lon2, lat2, s12);
  double * result = reinterpret_cast<double *>(ptr);
  double ds = s12 / (numPoints - 1);

  for (int i = 0; i < numPoints; i++) {
    line.Position(i * ds, result[2 * i + 1], result[2 * i]);
  }
}


void rhumbMeridianIntersection(double lon1, double lat1, double lon2, double lat2, double meridian, intptr_t ptr) {
  ensureArgOrder(lon1, lat1, lon2, lat2, meridian);
  const Rhumb& rhumb = Rhumb::WGS84();
  double s12;
  const RhumbLine line = getInverseRhumbLine(lon1, lat1, lon2, lat2, s12);
  double * result = reinterpret_cast<double *>(ptr);
  meridianIntersection_(meridian, s12, result[0], result[1],
      [line](double s12, double& lat, double& lon) {
        line.Position(s12, lat, lon);
      });
};


// coordinate conversion
std::string toMGRS(double lon, double lat) {
  int zone;
  bool northp;
  double x, y;
  std::string mgrs;

  // GeographicLib will throw an error for latitudes outside +/- 90. return an INVALID string instead.
  if (abs(lat) > 90) {
    mgrs = "INVALID";
  } else {
    UTMUPS::Forward(lat, lon, zone, northp, x, y);
    MGRS::Forward(zone, northp, x, y, 5, mgrs);
  }

  return mgrs;
};

void toLonLat(std::string mgrs, intptr_t ptr) {
  int zone, prec;
  bool northp;
  double x, y;
  MGRS::Reverse(mgrs, zone, northp, x, y, prec);
  double * result = reinterpret_cast<double *>(ptr);
  UTMUPS::Reverse(zone, northp, x, y, result[1], result[0]);
};


EMSCRIPTEN_BINDINGS(GeographicLib) {
  function("geodesicDirect_", &geodesicDirect);
  function("geodesicInverse_", &geodesicInverse);
  function("geodesicInterpolate_", &geodesicInterpolate);
  function("geodesicMeridianIntersection_", &geodesicMeridianIntersection);
  function("rhumbDirect_", &rhumbDirect);
  function("rhumbInverse_", &rhumbInverse);
  function("rhumbInterpolate_", &rhumbInterpolate);
  function("rhumbMeridianIntersection_", &rhumbMeridianIntersection);
  function("toMGRS_", &toMGRS);
  function("toLonLat_", &toLonLat);
}
