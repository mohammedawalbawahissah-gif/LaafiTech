// Small stroke-style icon set for the rail navigation. Hand-rolled (no icon
// dependency) to match the existing line-icon weight used elsewhere in the
// design system. 24x24 viewBox, 1.6 stroke, round caps/joins.

const PATHS = {
  dashboard: (
    <>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.4" />
      <rect x="13" y="3.5" width="7.5" height="4.5" rx="1.4" />
      <rect x="13" y="10.5" width="7.5" height="10" rx="1.4" />
      <rect x="3.5" y="13.5" width="7.5" height="7" rx="1.4" />
    </>
  ),
  verify: (
    <>
      <path d="M12 3.5 19 6.3v5.4c0 4.6-3 7.9-7 8.8-4-.9-7-4.2-7-8.8V6.3z" />
      <path d="m9 12.2 2.1 2.1L15.5 10" />
    </>
  ),
  agents: (
    <>
      <circle cx="8.5" cy="8" r="3" />
      <path d="M3.5 19.5c0-3 2.3-5 5-5s5 2 5 5" />
      <circle cx="16.5" cy="9" r="2.4" />
      <path d="M14.8 20c.4-2.2 1.9-3.6 3.7-3.9 1.9.3 3.5 1.9 4 4.4" />
    </>
  ),
  inventory: (
    <>
      <path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4z" />
      <path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9" />
    </>
  ),
  payouts: (
    <>
      <rect x="2.5" y="6.5" width="19" height="13" rx="2" />
      <circle cx="12" cy="13" r="3" />
      <path d="M2.5 10h3M18.5 16h3" />
    </>
  ),
  schools: (
    <>
      <path d="M12 3.5 21 8l-9 4.5L3 8z" />
      <path d="M6.5 10.3v5.6c0 1.6 2.5 3.1 5.5 3.1s5.5-1.5 5.5-3.1v-5.6M21 8v6" />
    </>
  ),
  impact: (
    <>
      <path d="M3.5 20.5h17" />
      <rect x="5.5" y="13" width="3.4" height="7.5" rx="0.8" />
      <rect x="10.3" y="8.5" width="3.4" height="12" rx="0.8" />
      <rect x="15.1" y="4.5" width="3.4" height="16" rx="0.8" />
    </>
  ),
  deliveries: (
    <>
      <rect x="2.5" y="7" width="11" height="9.5" rx="1.2" />
      <path d="M13.5 10h3.6l3.4 3.4v3.1h-7" />
      <circle cx="7" cy="18.5" r="1.8" />
      <circle cx="17" cy="18.5" r="1.8" />
    </>
  ),
  procure: (
    <>
      <path d="M3 4.5h2.4l1.1 11.6a2 2 0 0 0 2 1.9h8a2 2 0 0 0 2-1.7l1.3-7.8H6.1" />
      <circle cx="9.5" cy="20" r="1.4" />
      <circle cx="17" cy="20" r="1.4" />
    </>
  ),
  orders: (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h3.5" />
    </>
  ),
  home: (
    <>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9.5h12V10" />
      <path d="M10 19.5v-5h4v5" />
    </>
  ),
  log: (
    <>
      <rect x="4.5" y="3.5" width="15" height="17" rx="2" />
      <path d="M9 8.5h6M12 13v3.5M10.3 14.7h3.4" />
    </>
  ),
  earnings: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2.2" />
      <path d="M3 10h18" />
      <circle cx="7" cy="14.3" r="1.1" />
    </>
  ),
  history: (
    <>
      <circle cx="12" cy="12.5" r="8.2" />
      <path d="M12 7.8V12.5l3.4 2" />
      <path d="M5.3 4.2 3.7 7.6l3.6.7" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8.2" r="3.6" />
      <path d="M4.8 19.7c.9-3.7 3.7-5.9 7.2-5.9s6.3 2.2 7.2 5.9" />
    </>
  ),
  tracker: (
    <>
      <rect x="3.5" y="4.5" width="17" height="16" rx="2" />
      <path d="M3.5 9h17M8 3v3M16 3v3" />
      <path d="M12 12.2c1.4 1.3 2.1 2.3 2.1 3.4a2.1 2.1 0 1 1-4.2 0c0-1.1.7-2.1 2.1-3.4Z" />
    </>
  ),
  shop: (
    <>
      <path d="M3.5 8.5 4.8 4h14.4l1.3 4.5" />
      <path d="M3.5 8.5h17v9.8a1.7 1.7 0 0 1-1.7 1.7H5.2a1.7 1.7 0 0 1-1.7-1.7z" />
      <path d="M8.3 8.5v2a3.7 3.7 0 0 0 7.4 0v-2" />
    </>
  ),
  logout: (
    <>
      <path d="M9 20H5.5A1.5 1.5 0 0 1 4 18.5v-13A1.5 1.5 0 0 1 5.5 4H9" />
      <path d="M15.5 16.5 20 12l-4.5-4.5M20 12H9" />
    </>
  ),
};

export default function NavIcon({ name, ...props }) {
  const body = PATHS[name];
  if (!body) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {body}
    </svg>
  );
}
