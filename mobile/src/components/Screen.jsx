import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { colors } from "../theme";

export default function Screen({ children, scroll = true, padded = true }) {
  const Container = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={styles.safe}>
      <Container
        style={styles.flex}
        contentContainerStyle={padded ? styles.padded : undefined}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  padded: { padding: 20, paddingBottom: 40 },
});
