// Bloom Ledger design tokens -- shared in spirit with the web dashboards
// (laafitech-admin, laafitech-funder, laafitech-community), same palette
// and type roles, adapted for native UI.

export const colors = {
  bg: "#F7F3ED",
  surface: "#FFFFFF",
  surfaceSunken: "#F0E6DD",
  ink: "#1B2A4A",
  inkSoft: "#6B7A8C",
  line: "#DDD3C4",

  primary: "#E8604C",
  primaryDark: "#B5482D",
  primaryTint: "#FAECE7",

  accent: "#F4B9C2",
  accentTint: "#FBEAF0",

  brand: "#1B2A4A",
  brandSoft: "#2A3D5F",

  warning: "#854F0B",
  warningTint: "#FAEEDA",

  danger: "#A32D2D",
  dangerTint: "#FCEBEB",

  success: "#5C7A5E",
  successTint: "#EAF3DE",

  white: "#FFFFFF",
};

export const fonts = {
  display: "RobotoSlab_600SemiBold",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemiBold: "Inter_600SemiBold",
  mono: "IBMPlexMono_500Medium",
};

export const spacing = (n) => n * 4;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
};

export const shadow = {
  sm: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
};
