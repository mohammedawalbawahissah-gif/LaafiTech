import { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, fonts, radius } from "../theme";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import Screen from "../components/Screen";
import Card from "../components/Card";

export default function HomeScreen({ navigation }) {
  const { user, agent, refreshAgent } = useAuth();
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      Promise.all([
        refreshAgent(),
        client.get("/distributions/", { params: { ordering: "-timestamp" } }),
      ])
        .then(([, res]) => {
          if (!active) return;
          const records = res.data.results ?? res.data;
          const today = new Date().toDateString();
          setTodayCount(records.filter((r) => new Date(r.timestamp).toDateString() === today).length);
        })
        .finally(() => active && setLoading(false));
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <Screen>
      <Text style={styles.greeting}>Welcome, {user?.first_name || "Agent"}</Text>
      <Text style={styles.sub}>{agent?.catchment_area || "Catchment area not set"}</Text>

      <View style={styles.statRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Stock balance</Text>
          <Text style={styles.statValue}>{loading ? "—" : agent?.current_inventory_balance ?? 0}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Today's logs</Text>
          <Text style={styles.statValue}>{loading ? "—" : todayCount}</Text>
        </Card>
      </View>

      <Card style={{ marginTop: 16 }}>
        <Text style={styles.statLabel}>Lifetime distributed</Text>
        <Text style={[styles.statValue, { fontSize: 22 }]}>{loading ? "—" : agent?.total_distributed_lifetime ?? 0} units</Text>
        <Text style={styles.statusLine}>
          Agent status: <Text style={{ fontFamily: fonts.bodySemiBold, textTransform: "capitalize" }}>{agent?.verification_status || "—"}</Text>
        </Text>
      </Card>

      <View style={{ height: 24 }} />

      <PrimaryAction title="Log a distribution" subtitle="Photo + GPS required" onPress={() => navigation.navigate("LogDistribution")} />
      <PrimaryAction title="Request restock" subtitle="Low on stock?" onPress={() => navigation.navigate("Inventory")} secondary />
    </Screen>
  );
}

function PrimaryAction({ title, subtitle, onPress, secondary }) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <Card style={[styles.actionCard, secondary && { backgroundColor: colors.surfaceSunken }]}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSub}>{subtitle}</Text>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  greeting: { fontFamily: fonts.display, fontSize: 24, color: colors.ink },
  sub: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, marginBottom: 20 },
  statRow: { flexDirection: "row", gap: 12 },
  statCard: { flex: 1 },
  statLabel: { fontFamily: fonts.bodySemiBold, fontSize: 11, textTransform: "uppercase", color: colors.inkSoft, marginBottom: 6 },
  statValue: { fontFamily: fonts.mono, fontSize: 28, color: colors.primaryDark },
  statusLine: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, marginTop: 8 },
  actionCard: { marginBottom: 12, borderRadius: radius.lg },
  actionTitle: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.ink },
  actionSub: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, marginTop: 2 },
});
