import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getBooking } from "@/src/utils/api";
import { makeStyles, useTheme } from "@/src/utils/theme";

const useStyles = makeStyles((colors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  map: { flex: 1, overflow: "hidden" },
  mapRoad: { position: "absolute", backgroundColor: colors.surface, opacity: 0.6 },
  header: { position: "absolute", left: 20, right: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  close: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  status: { backgroundColor: colors.surface, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 7 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  statusText: { color: colors.onSurface, fontSize: 12, fontWeight: "800" },
  pin: { position: "absolute", width: 38, height: 38, borderRadius: 19, backgroundColor: colors.brandPrimary, alignItems: "center", justifyContent: "center", borderWidth: 4, borderColor: colors.surface },
  pinStart: { top: "32%", left: "22%" },
  pinEnd: { top: "18%", right: "20%", backgroundColor: colors.success },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 20, paddingTop: 12, gap: 16 },
  grabber: { width: 42, height: 4, backgroundColor: colors.borderStrong, borderRadius: 3, alignSelf: "center" },
  eta: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  etaLabel: { color: colors.muted, fontSize: 13, fontWeight: "700" },
  etaValue: { color: colors.onSurface, fontSize: 28, fontWeight: "800", marginTop: 4 },
  etaHint: { color: colors.brandPrimary, fontSize: 13, fontWeight: "800" },
  driver: { backgroundColor: colors.surfaceSecondary, borderRadius: 20, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  driverAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.brandSecondary, alignItems: "center", justifyContent: "center" },
  driverInitial: { color: colors.onBrandSecondary, fontSize: 18, fontWeight: "800" },
  driverName: { color: colors.onSurface, fontSize: 15, fontWeight: "800" },
  driverSub: { color: colors.muted, fontSize: 12, marginTop: 4 },
  rating: { marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { color: colors.onSurface, fontSize: 13, fontWeight: "800" },
  actions: { flexDirection: "row", gap: 10 },
  action: { flex: 1, minHeight: 48, borderRadius: 16, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  actionText: { color: colors.onSurfaceSecondary, fontSize: 13, fontWeight: "800" },
  route: { color: colors.muted, fontSize: 12, textAlign: "center", paddingBottom: 2 },
}));

export default function TripScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const booking = useQuery({ queryKey: ["booking", bookingId], queryFn: () => getBooking(String(bookingId)), enabled: Boolean(bookingId) });
  if (booking.isLoading || !booking.data) return <View style={[styles.root, { justifyContent: "center", alignItems: "center" }]}><Text style={{ color: colors.muted }}>Connecting to your driver...</Text></View>;
  const ride = booking.data;
  return (
    <View style={styles.root} testID="trip-screen">
      <View style={styles.map}>
        <LinearGradient colors={[colors.brandTertiary, colors.surfaceSecondary]} style={StyleSheet.absoluteFill} />
        <View style={[styles.mapRoad, { width: "120%", height: 22, transform: [{ rotate: "-28deg" }], top: "48%", left: "-10%" }]} />
        <View style={[styles.mapRoad, { width: "110%", height: 14, transform: [{ rotate: "32deg" }], top: "28%", left: "-4%" }]} />
        <View style={[styles.mapRoad, { width: "90%", height: 11, transform: [{ rotate: "70deg" }], top: "44%", left: "6%" }]} />
        <Text style={{ position: "absolute", top: "42%", left: "32%", color: colors.onSurfaceSecondary, fontSize: 12, fontWeight: "800", opacity: 0.6 }}>SUNSET BLVD</Text>
        <View style={[styles.pin, styles.pinStart]}><Ionicons name="radio-button-on" size={16} color={colors.onBrandPrimary} /></View>
        <View style={[styles.pin, styles.pinEnd]}><Ionicons name="location" size={17} color={colors.onSuccess} /></View>
        <View style={[styles.header, { top: insets.top + 12 }]}><Pressable testID="trip-close-button" accessibilityLabel="Close live trip" accessibilityRole="button" onPress={() => router.back()} style={styles.close}><Ionicons name="chevron-down" size={22} color={colors.onSurface} /></Pressable><View style={styles.status}><View style={styles.statusDot} /><Text style={styles.statusText}>Driver confirmed</Text></View></View>
      </View>
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 14 }]}>
        <View style={styles.grabber} />
        <View style={styles.eta}><View><Text style={styles.etaLabel}>{ride.status === "completed" ? "Trip complete" : "Maya is arriving in"}</Text><Text style={styles.etaValue}>{ride.status === "completed" ? "Thanks for riding" : ride.eta}</Text></View><Text style={styles.etaHint}>On time ✦</Text></View>
        <View style={styles.driver}><View style={styles.driverAvatar}><Text style={styles.driverInitial}>MC</Text></View><View><Text style={styles.driverName}>{ride.driver.name}</Text><Text style={styles.driverSub}>{ride.driver.vehicle} · {ride.driver.plate}</Text></View><View style={styles.rating}><Ionicons name="star" size={15} color={colors.brandSecondary} /><Text style={styles.ratingText}>{ride.driver.rating}</Text></View></View>
        <View style={styles.actions}><Pressable onPress={() => Alert.alert("Message Maya", "Your driver will see your message in the ride chat.")} style={styles.action}><Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.brandPrimary} /><Text style={styles.actionText}>Message</Text></Pressable><Pressable onPress={() => Alert.alert("Need help?", "JoyRide support is here for you.")} style={styles.action}><Ionicons name="help-circle-outline" size={18} color={colors.brandPrimary} /><Text style={styles.actionText}>Help</Text></Pressable></View>
        <Text style={styles.route}>{ride.pickup}  →  {ride.dropoff}</Text>
      </View>
    </View>
  );
}