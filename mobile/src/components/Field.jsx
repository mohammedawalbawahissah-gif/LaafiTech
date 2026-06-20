import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, fonts, radius } from "../theme";

export default function Field({ label, ...inputProps }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor={colors.inkSoft} {...inputProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.inkSoft, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    backgroundColor: colors.surface,
    color: colors.ink,
  },
});
