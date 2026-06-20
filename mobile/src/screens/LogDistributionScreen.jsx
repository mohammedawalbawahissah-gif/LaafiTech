import { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { colors, fonts, radius } from "../theme";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import Screen from "../components/Screen";
import Card from "../components/Card";
import Field from "../components/Field";
import Button from "../components/Button";

const RECIPIENT_TYPES = [
  { value: "individual", label: "Individual" },
  { value: "school", label: "School" },
  { value: "community_group", label: "Community group" },
];

const PAYMENT_TYPES = [
  { value: "cash", label: "Cash" },
  { value: "momo", label: "Mobile money" },
  { value: "subsidized", label: "Subsidized" },
  { value: "free", label: "Free (funded)" },
];

export default function LogDistributionScreen({ navigation }) {
  const { agent, refreshAgent } = useAuth();
  const [recipientType, setRecipientType] = useState("individual");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("0");
  const [paymentType, setPaymentType] = useState("cash");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const captureLocation = async () => {
    setError("");
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission is required to log a distribution.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    } catch {
      setError("Couldn't get your location. Try again outdoors or near a window.");
    } finally {
      setLocating(false);
    }
  };

  const capturePhoto = async () => {
    setError("");
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      setError("Camera permission is required to log a distribution.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: false });
    if (!result.canceled) setPhoto(result.assets[0]);
  };

  const handleSubmit = async () => {
    setError("");
    if (!quantity || Number(quantity) <= 0) return setError("Enter a valid quantity.");
    if (!location) return setError("Capture your location before submitting.");
    if (!photo) return setError("Take a proof-of-distribution photo before submitting.");

    setSubmitting(true);
    try {
      // 1. Upload photo (in production: direct Cloudinary unsigned upload,
      // returning a URL to attach below). Placeholder upload step shown here.
      const photoUrl = await uploadPhoto(photo);

      // 2. Create the distribution record -- backend runs AI verification-assist
      // automatically on save (duplicate photo / GPS plausibility / volume checks).
      await client.post("/distributions/", {
        agent: agent.id,
        recipient_type: recipientType,
        quantity: Number(quantity),
        unit_price: Number(unitPrice) || 0,
        payment_type: paymentType,
        gps_lat: location.lat,
        gps_lng: location.lng,
        photo_url: photoUrl,
        notes,
      });

      await refreshAgent();
      Alert.alert("Logged", "Distribution submitted for verification.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      setError(e.response?.data?.detail || "Couldn't submit. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Log a distribution</Text>
      <Text style={styles.subtitle}>Photo and GPS are required for verification.</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Card style={{ marginBottom: 16 }}>
        <Text style={styles.label}>Recipient type</Text>
        <ChipRow options={RECIPIENT_TYPES} value={recipientType} onChange={setRecipientType} />
      </Card>

      <Field label="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="number-pad" placeholder="e.g. 10" />
      <Field label="Unit price (GHS, 0 if free/subsidized)" value={unitPrice} onChangeText={setUnitPrice} keyboardType="decimal-pad" placeholder="0.00" />

      <Card style={{ marginBottom: 16 }}>
        <Text style={styles.label}>Payment type</Text>
        <ChipRow options={PAYMENT_TYPES} value={paymentType} onChange={setPaymentType} />
      </Card>

      <Field label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="Any context for the reviewer" />

      <CaptureRow
        label="Location"
        done={!!location}
        doneText={location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : ""}
        actionText={locating ? "Locating..." : location ? "Recapture" : "Capture location"}
        onPress={captureLocation}
        loading={locating}
      />

      <View style={{ marginBottom: 20 }}>
        <Text style={styles.label}>Proof photo</Text>
        {photo ? (
          <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
        ) : (
          <Text style={styles.helperText}>No photo yet</Text>
        )}
        <TouchableOpacity style={styles.captureBtn} onPress={capturePhoto}>
          <Text style={styles.captureBtnText}>{photo ? "Retake photo" : "Take photo"}</Text>
        </TouchableOpacity>
      </View>

      <Button title="Submit distribution" onPress={handleSubmit} loading={submitting} />
    </Screen>
  );
}

function ChipRow({ options, value, onChange }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

function CaptureRow({ label, done, doneText, actionText, onPress, loading }) {
  return (
    <Card style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text style={styles.label}>{label}</Text>
          {done ? <Text style={styles.helperText}>{doneText}</Text> : <Text style={styles.helperText}>Not captured</Text>}
        </View>
        <TouchableOpacity style={styles.captureBtnSmall} onPress={onPress} disabled={loading}>
          <Text style={styles.captureBtnText}>{actionText}</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

// Placeholder upload: in production this should perform an unsigned upload
// directly to Cloudinary (see CLOUDINARY_URL on the backend) and return the
// resulting secure_url. Swapping this implementation does not touch any
// other part of the flow.
async function uploadPhoto(photoAsset) {
  return photoAsset.uri;
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.display, fontSize: 22, color: colors.ink },
  subtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, marginBottom: 16 },
  error: { color: colors.danger, fontFamily: fonts.body, fontSize: 13, marginBottom: 12 },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.inkSoft },
  helperText: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, marginTop: 4 },
  chip: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8 },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.inkSoft },
  chipTextActive: { color: colors.white },
  captureBtn: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: "center",
  },
  captureBtnSmall: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  captureBtnText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.primaryDark },
  photoPreview: { width: "100%", height: 180, borderRadius: radius.md, marginTop: 8, backgroundColor: colors.surfaceSunken },
});
