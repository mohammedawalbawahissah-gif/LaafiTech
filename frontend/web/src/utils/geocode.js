// Reverse-geocoding via OpenStreetMap's Nominatim API — no API key required.
// zoom=18 gets street/building level detail; zoom=16 was too coarse for
// northern Ghana where Nominatim knows individual quarters and hamlets.
//
// buildPlaceName is expanded to include Ghana-specific OSM address fields:
// quarter, hamlet, district — which northern Ghana (Tamale, etc.) commonly
// uses instead of the suburb/neighbourhood fields common in southern cities.

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/reverse";

/**
 * Reverse geocode a lat/lng pair into a short, readable place name.
 * Returns null on any failure — the map and raw coordinates are always
 * shown regardless, so a flaky network shouldn't block the form.
 */
export async function reverseGeocode(lat, lng) {
  try {
    const url =
      `${NOMINATIM_BASE}?format=jsonv2&lat=${lat}&lon=${lng}` +
      `&zoom=18&addressdetails=1&accept-language=en`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return buildPlaceName(data);
  } catch {
    return null;
  }
}

function buildPlaceName(data) {
  const a = data?.address;
  if (!a) return data?.display_name || null;

  // Ghana/West Africa OSM address hierarchy (most specific → least):
  //   hamlet → quarter → village → suburb → neighbourhood → town → city → district → county → state
  // Northern Ghana (Tamale region) commonly uses quarter + town/city.
  const micro =
    a.hamlet ||
    a.quarter ||
    a.neighbourhood ||
    a.suburb ||
    a.village;

  const settlement =
    a.town ||
    a.city ||
    a.municipality ||
    a.county;

  const region =
    a.district ||
    a.state_district ||
    a.state ||
    a.region;

  // Build: "Micro, Settlement, Region" — drop empty parts.
  // If micro === settlement (Nominatim sometimes repeats), deduplicate.
  const parts = [micro, settlement, region]
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i); // deduplicate

  return parts.length ? parts.join(", ") : data.display_name || null;
}
