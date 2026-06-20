import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, fonts, radius } from "../theme";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import Screen from "../components/Screen";
import Card from "../components/Card";
import Button from "../components/Button";

const NETWORKS = [
  { value: "mtn", label: "MTN MoMo" },
  { value: "vodafone", label: "Vodafone Cash" },
  { value: "airteltigo", label: "AirtelTigo Money" },
];

export default function ProfileScreen() {
  const { user, agent, logout, refreshAgent } = useAuth();
  const [network, setNetwork] = useState(agent?.momo_provider || "mtn");
  const [saving, setSaving] = useState(false);

  const saveNetwork = async (value) => {
    setNetwork(value);
    if (!agent) return;
    setSaving(true);
    try {
      // Payout routing (native MoMo vs Hubtel) on the backend is derived
      // automatically from this field -- agent doesn't need to think about it.
      await client.patch(`/agents/${agent.id}/`, { momo_provider: value });
      await refreshAgent();
    } catch {
      Alert.alert("Couldn't save", "Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Profile</Text>

      <Card style={{ marginBottom: 16 }}>
        <Text style={styles.name}>{user?.first_name} {user?.last_name}</Text>
        <Text style={styles.sub}>{user?.phone_number}</Text>
        <Text style={styles.sub}>{agent?.agent_code}</Text>
      </Card>

      <Text style={styles.label}>Mobile money network</Text>
      <Text style={styles.helper}>This determines how your payouts are sent.</Text>
      <View style={{ flexDirection: "row", gap: 8, marginVertical: 12 }}>
        {NETWORKS.map((n) => {
          const active = n.value === network;
          return (
            <TouchableOpacity
              key={n.value}
              onPress={() => saveNetwork(n.value)}
              disabled={saving}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{n.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Button title="Log out" variant="ghost" onPress={logout} style={{ marginTop: 24 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.display, fontSize: 22, color: colors.ink, marginBottom: 16 },
  name: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.ink },
  sub: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, marginTop: 2 },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.ink },
  helper: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  chip: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8 },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.inkSoft },
  chipTextActive: { color: colors.white },
});
