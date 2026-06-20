import { useCallback, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, fonts, radius } from "../theme";
import client from "../api/client";
import Screen from "../components/Screen";
import Card from "../components/Card";
import Badge from "../components/Badge";

export default function HistoryScreen() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      client
        .get("/distributions/", { params: { ordering: "-timestamp" } })
        .then((res) => active && setRecords(res.data.results ?? res.data))
        .finally(() => active && setLoading(false));
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <Screen>
      <Text style={styles.title}>Distribution history</Text>

      {loading && <Text style={styles.helper}>Loading...</Text>}
      {!loading && records.length === 0 && <Text style={styles.helper}>No distributions logged yet.</Text>}

      {records.map((r) => (
        <Card key={r.id} style={styles.row}>
          {r.photo_url ? <Image source={{ uri: r.photo_url }} style={styles.thumb} /> : <View style={styles.thumbPlaceholder} />}
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>{r.quantity} units · {r.recipient_type.replace("_", " ")}</Text>
            <Text style={styles.rowSub}>{new Date(r.timestamp).toLocaleString()}</Text>
            {r.ai_anomaly_flags?.length > 0 && (
              <Text style={styles.flagText}>{r.ai_anomaly_flags.length} flag(s) under review</Text>
            )}
          </View>
          <Badge status={r.verification_status} />
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.display, fontSize: 22, color: colors.ink, marginBottom: 16 },
  helper: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft },
  row: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  thumb: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.surfaceSunken },
  thumbPlaceholder: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.surfaceSunken },
  rowLabel: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink, textTransform: "capitalize" },
  rowSub: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  flagText: { fontFamily: fonts.body, fontSize: 11, color: colors.accent, marginTop: 2 },
});
