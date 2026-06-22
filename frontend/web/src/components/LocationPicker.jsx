import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { reverseGeocode } from "../utils/geocode";

// Vite serves the default Leaflet marker images as bundled assets rather
// than the relative paths Leaflet's CSS expects out of the box -- without
// this, markers silently render as broken images.
const pinIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/**
 * GPS capture + map preview + reverse-geocoded place name, replacing a bare
 * "5.5545, -0.1902" readout with something a reviewer can actually
 * recognize at a glance. Coordinates remain the source of truth and are
 * still shown (in mono, small) underneath the place name.
 *
 * value:    { lat, lng, name } | null
 * onChange: (value) => void
 */
export default function LocationPicker({ value, onChange }) {
  const [locating, setLocating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState("");

  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const captureLocation = () => {
    setError("");
    if (!navigator.geolocation) {
      setError("Your browser doesn't support location capture.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocating(false);
        onChange({ lat, lng, name: "" });

        setGeocoding(true);
        const name = await reverseGeocode(lat, lng);
        setGeocoding(false);
        onChange({ lat, lng, name: name || "" });
      },
      (err) => {
        let msg = "Couldn't get your location. Check browser permissions and try again.";
        if (err.code === err.TIMEOUT) msg = "Location timed out — move to an open area and try again.";
        if (err.code === err.PERMISSION_DENIED) msg = "Location access denied — allow it in your browser settings.";
        setError(msg);
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,  // always get a fresh fix, never serve a stale cached position
      }
    );
  };

  // Initialize the map once a coordinate exists.
  useEffect(() => {
    if (!value || !mapElRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapElRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([value.lat, value.lng], 16);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(mapRef.current);
      markerRef.current = L.marker([value.lat, value.lng], { icon: pinIcon }).addTo(mapRef.current);
    } else {
      mapRef.current.setView([value.lat, value.lng], 16);
      markerRef.current?.setLatLng([value.lat, value.lng]);
    }

    // Leaflet sizes itself off the container at mount time; invalidate
    // at multiple intervals to handle both CSS transitions and lazy layout.
    const t1 = setTimeout(() => mapRef.current?.invalidateSize(), 100);
    const t2 = setTimeout(() => mapRef.current?.invalidateSize(), 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [value]);

  useEffect(() => () => mapRef.current?.remove(), []);

  return (
    <div className="location-picker">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button type="button" className="btn btn-ghost" onClick={captureLocation} disabled={locating}>
          {locating ? "Locating..." : value ? "Recapture location" : "Capture location"}
        </button>
        {geocoding && <span className="sub">Looking up place name...</span>}
      </div>

      {error && <p className="sub" style={{ color: "var(--danger, #c0392b)" }}>{error}</p>}

      {value && (
        <>
          <div className="location-picker-map" ref={mapElRef} />
          <div className="location-picker-name">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            <div>
              <div>{value.name || (geocoding ? "Looking up place name..." : "Place name unavailable")}</div>
              <div className="location-picker-coords mono">{value.lat.toFixed(5)}, {value.lng.toFixed(5)}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
