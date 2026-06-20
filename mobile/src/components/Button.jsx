import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors, fonts, radius } from "../theme";

const VARIANTS = {
  primary: { bg: colors.primary, fg: colors.white, border: colors.primary },
  danger: { bg: colors.danger, fg: colors.white, border: colors.danger },
  ghost: { bg: "transparent", fg: colors.inkSoft, border: colors.line },
};

export default function Button({ title, onPress, variant = "primary", loading = false, disabled = false, style }) {
  const v = VARIANTS[variant];
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        styles.base,
        { backgroundColor: v.bg, borderColor: v.border },
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={v.fg} /> : <Text style={[styles.text, { color: v.fg }]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { fontFamily: fonts.bodySemiBold, fontSize: 15 },
  disabled: { opacity: 0.5 },
});
