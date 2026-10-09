import { Image } from "react-native";

// LaafiTech's Bloom Ledger mark (same artwork as the app icon and splash
// screen), for brand placements that previously had no real logo — just
// a small colored dot standing in for one.
export default function LogoMark({ size = 56, style }) {
  return (
    <Image
      source={require("../../assets/logo.png")}
      style={[{ width: size, height: size, borderRadius: size * 0.22 }, style]}
      accessibilityLabel="LaafiTech"
    />
  );
}
