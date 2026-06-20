import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { useAuth } from "../context/AuthContext";
import Field from "../components/Field";
import Button from "../components/Button";

export default function LoginScreen() {
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await login(phone, password);
    } catch {
      setError("Incorrect phone number or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.brandDot} />
      <Text style={styles.title}>LaafiTech</Text>
      <Text style={styles.subtitle}>Agent app</Text>

      <View style={styles.form}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Field label="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="024 000 0000" />
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
        <Button title="Sign in" onPress={handleLogin} loading={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.primaryDark, padding: 28, justifyContent: "center" },
  brandDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent, marginBottom: 10 },
  title: { fontFamily: fonts.display, fontSize: 30, color: "#fff" },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: "#cfe4e0", marginBottom: 28 },
  form: { backgroundColor: colors.surface, borderRadius: 18, padding: 24 },
  error: { color: colors.danger, marginBottom: 14, fontFamily: fonts.body, fontSize: 13 },
});
