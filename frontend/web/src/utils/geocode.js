// Free reverse-geocoding via OpenStreetMap's Nominatim API -- no API key
// required. Used to turn a captured GPS point into a human-readable place
// name instead of showing raw coordinates to reviewers.
//
// Nominatim's usage policy (https://operations.osmfoundation.org/policies/nominatim/)
// asks for a descriptive identifying header on requests and no more than
// ~1 request/second from a given client, both of which are fine for this
// one-off, user-triggered lookup.
const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/reverse";

/**
 * Reverse geocode a lat/lng pair into a short, readable place name.
 * Returns null (rather than throwing) on any failure -- the map and raw
 * coordinates are always still shown, so a flaky network shouldn't block
 * the form.
 */
export async function reverseGeocode(lat, lng) {
  try {
    const url = `${NOMINATIM_BASE_URL}?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`;
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

  // Prefer the smallest meaningful settlement-level name, then region.
  const place = a.village || a.town || a.suburb || a.neighbourhood || a.city || a.county;
  const region = a.state || a.region;

  const parts = [place, region].filter(Boolean);
  return parts.length ? parts.join(", ") : data.display_name || null;
}
