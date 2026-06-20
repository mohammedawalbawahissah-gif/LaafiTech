import { StyleSheet, Text, View } from "react-native";
import { colors, fonts, radius } from "../theme";

const TONES = {
  pending: { bg: colors.warningTint, fg: "#8A6C1E" },
  verified: { bg: colors.successTint, fg: colors.success },
  flagged: { bg: colors.dangerTint, fg: colors.danger },
  rejected: { bg: colors.surfaceSunken, fg: colors.inkSoft },
};

export default function Badge({ status }) {
  const tone = TONES[status] || TONES.rejected;
  return (
    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
      <Text style={[styles.text, { color: tone.fg }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill, alignSelf: "flex-start" },
  text: { fontFamily: fonts.bodySemiBold, fontSize: 11, textTransform: "capitalize" },
});
