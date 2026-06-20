import { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, fonts } from "../theme";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import Screen from "../components/Screen";
import Card from "../components/Card";
import Button from "../components/Button";

export default function InventoryScreen() {
  const { agent, refreshAgent } = useAuth();
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      client
        .get("/allocations/")
        .then((res) => active && setAllocations(res.data.results ?? res.data))
        .finally(() => active && setLoading(false));
      return () => {
        active = false;
      };
    }, [])
  );

  const requestRestock = async () => {
    if (allocations.length === 0) {
      Alert.alert("No allocation found", "You don't have an active stock allocation to flag for restock yet. Contact your LaafiTech admin.");
      return;
    }
    setRequesting(true);
    try {
      const latest = allocations[0];
      await client.patch(`/allocations/${latest.id}/`, { restock_requested: true });
      Alert.alert("Requested", "Your restock request has been sent to LaafiTech admin.");
      await refreshAgent();
    } catch {
      Alert.alert("Couldn't send request", "Check your connection and try again.");
    } finally {
      setRequesting(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>My inventory</Text>

      <Card style={{ marginBottom: 16 }}>
        <Text style={styles.label}>Current balance</Text>
        <Text style={styles.value}>{agent?.current_inventory_balance ?? 0} units</Text>
      </Card>

      <Button title={requesting ? "Sending..." : "Request restock"} onPress={requestRestock} loading={requesting} />

      <Text style={[styles.label, { marginTop: 24, marginBottom: 8 }]}>Allocation history</Text>
      {loading && <Text style={styles.helper}>Loading...</Text>}
      {!loading && allocations.length === 0 && <Text style={styles.helper}>No allocations yet.</Text>}
      {allocations.map((a) => (
        <Card key={a.id} style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={styles.rowLabel}>Batch #{a.batch}</Text>
            <Text style={styles.rowValue}>{a.quantity_remaining} / {a.quantity_allocated} left</Text>
          </View>
          {a.restock_requested && <Text style={styles.pending}>Restock requested</Text>}
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.display, fontSize: 22, color: colors.ink, marginBottom: 16 },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.inkSoft, textTransform: "uppercase" },
  value: { fontFamily: fonts.mono, fontSize: 26, color: colors.primaryDark, marginTop: 6 },
  helper: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft },
  rowLabel: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink },
  rowValue: { fontFamily: fonts.mono, fontSize: 13, color: colors.inkSoft },
  pending: { fontFamily: fonts.body, fontSize: 12, color: colors.accent, marginTop: 6 },
});
