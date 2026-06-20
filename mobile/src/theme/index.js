// Design tokens shared in spirit with the web dashboards (laafitech-admin,
// laafitech-funder) -- same palette and type roles, adapted for native UI.

export const colors = {
  bg: "#FAF7F2",
  surface: "#FFFFFF",
  surfaceSunken: "#F1ECE3",
  ink: "#21201C",
  inkSoft: "#5C5750",
  line: "#E4DDD0",

  primary: "#0F6E63",
  primaryDark: "#0A4F47",
  primaryTint: "#E3EFED",

  accent: "#C4622D",
  accentTint: "#F7E6DC",

  brand: "#B23568",

  warning: "#C7A23A",
  warningTint: "#F7EED3",

  danger: "#B3261E",
  dangerTint: "#F9E3E1",

  success: "#1F7A4D",
  successTint: "#E1F0E7",

  white: "#FFFFFF",
};

export const fonts = {
  display: "Fraunces_600SemiBold",
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
