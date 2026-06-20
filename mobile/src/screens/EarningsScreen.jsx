import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, fonts } from "../theme";
import client from "../api/client";
import Screen from "../components/Screen";
import Card from "../components/Card";
import Badge from "../components/Badge";

export default function EarningsScreen() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      client
        .get("/payouts/")
        .then((res) => active && setPayouts(res.data.results ?? res.data))
        .finally(() => active && setLoading(false));
      return () => {
        active = false;
      };
    }, [])
  );

  const pendingTotal = payouts.filter((p) => p.status === "pending").reduce((sum, p) => sum + Number(p.amount), 0);
  const paidTotal = payouts.filter((p) => p.status === "completed").reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <Screen>
      <Text style={styles.title}>My earnings</Text>

      <View style={styles.statRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Pending</Text>
          <Text style={styles.statValue}>GHS {pendingTotal.toFixed(2)}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Paid out</Text>
          <Text style={styles.statValue}>GHS {paidTotal.toFixed(2)}</Text>
        </Card>
      </View>

      <Text style={[styles.label, { marginTop: 24, marginBottom: 8 }]}>History</Text>
      {loading && <Text style={styles.helper}>Loading...</Text>}
      {!loading && payouts.length === 0 && <Text style={styles.helper}>No payouts yet.</Text>}
      {payouts.map((p) => (
        <Card key={p.id} style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={styles.rowLabel}>GHS {p.amount}</Text>
              <Text style={styles.rowSub}>{p.period_start} → {p.period_end} · {p.method?.replace("_", " ") || "—"}</Text>
            </View>
            <Badge status={p.status === "completed" ? "verified" : p.status === "failed" ? "flagged" : "pending"} />
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.display, fontSize: 22, color: colors.ink, marginBottom: 16 },
  statRow: { flexDirection: "row", gap: 12 },
  statCard: { flex: 1 },
  statLabel: { fontFamily: fonts.bodySemiBold, fontSize: 11, textTransform: "uppercase", color: colors.inkSoft, marginBottom: 6 },
  statValue: { fontFamily: fonts.mono, fontSize: 20, color: colors.primaryDark },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.inkSoft, textTransform: "uppercase" },
  helper: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft },
  rowLabel: { fontFamily: fonts.mono, fontSize: 16, color: colors.ink },
  rowSub: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, marginTop: 2, textTransform: "capitalize" },
});
