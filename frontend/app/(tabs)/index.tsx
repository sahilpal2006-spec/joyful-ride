import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getDestinations } from "@/src/utils/api";
import { makeStyles, useTheme } from "@/src/utils/theme";

const useStyles = makeStyles((colors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  content: { paddingHorizontal: 20, paddingTop: 14, gap: 22 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { color: colors.brandPrimary, fontSize: 13, fontWeight: "800", letterSpacing: 0.4 },
  title: { color: colors.onSurface, fontSize: 30, fontWeight: "800", marginTop: 3 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.brandSecondary, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.onBrandSecondary, fontWeight: "800", fontSize: 17 },
  map: { height: 238, borderRadius: 28, overflow: "hidden", borderWidth: 1, borderColor: colors.border },
  mapTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  location: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.surface, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 20 },
  locationText: { color: colors.onSurface, fontSize: 13, fontWeight: "700" },
  mapButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  roadOne: { position: "absolute", width: 420, height: 18, backgroundColor: colors.surface, opacity: 0.65, transform: [{ rotate: "-28deg" }], top: 128, left: -70 },
  roadTwo: { position: "absolute", width: 360, height: 12, backgroundColor: colors.surface, opacity: 0.62, transform: [{ rotate: "34deg" }], top: 84, left: 78 },
  mapLabel: { position: "absolute", color: colors.onSurfaceSecondary, fontSize: 12, fontWeight: "700", opacity: 0.7 },
  pin: { position: "absolute", width: 35, height: 35, borderRadius: 18, backgroundColor: colors.brandPrimary, alignItems: "center", justifyContent: "center", borderWidth: 4, borderColor: colors.surface },
  pinTwo: { backgroundColor: colors.success, top: 139, right: 67 },
  pinOne: { top: 88, left: 72 },
  mapCaption: { position: "absolute", bottom: 16, left: 16, right: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  captionText: { color: colors.onSurface, fontSize: 13, fontWeight: "800" },
  captionMuted: { color: colors.muted, fontSize: 12, marginTop: 3 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { color: colors.onSurface, fontSize: 20, fontWeight: "800" },
  link: { color: colors.brandPrimary, fontSize: 13, fontWeight: "800" },
  chips: { flexDirection: "row", gap: 10 },
  chip: { backgroundColor: colors.surfaceSecondary, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 11, flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.brandTertiary, borderColor: colors.brandTertiary },
  chipText: { color: colors.onSurfaceSecondary, fontSize: 13, fontWeight: "700" },
  exploreCard: { width: 215, height: 150, borderRadius: 22, overflow: "hidden", justifyContent: "flex-end" },
  exploreOverlay: { padding: 14, paddingTop: 34 },
  exploreTitle: { color: colors.onSurfaceInverse, fontSize: 17, fontWeight: "800" },
  exploreSub: { color: colors.onSurfaceInverse, fontSize: 12, opacity: 0.84, marginTop: 3 },
  arrow: { position: "absolute", top: 12, right: 12, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  quickBook: { backgroundColor: colors.brandPrimary, borderRadius: 22, minHeight: 58, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10 },
  quickBookText: { color: colors.onBrandPrimary, fontSize: 16, fontWeight: "800" },
  loading: { height: 150, justifyContent: "center" },
}));

export default function HomeScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const destinations = useQuery({ queryKey: ["destinations"], queryFn: getDestinations });

  return (
    <View style={styles.root} testID="home-screen">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 28 }]}>
        <View style={styles.header}>
          <View><Text style={styles.eyebrow}>GOOD MORNING, ALEX</Text><Text style={styles.title}>Where to next?</Text></View>
          <Pressable accessibilityRole="button" onPress={() => router.push("/profile")} style={styles.avatar}><Text style={styles.avatarText}>A</Text></Pressable>
        </View>
        <View style={styles.map}>
          <LinearGradient colors={[colors.brandTertiary, colors.surfaceSecondary]} style={StyleSheet.absoluteFill} />
          <View style={styles.roadOne} /><View style={styles.roadTwo} />
          <Text style={[styles.mapLabel, { top: 63, left: 176 }]}>PARK AVE</Text><Text style={[styles.mapLabel, { top: 166, left: 31 }]}>RIVER WALK</Text>
          <View style={[styles.pin, styles.pinOne]}><Ionicons name="car" size={16} color={colors.onBrandPrimary} /></View>
          <View style={[styles.pin, styles.pinTwo]}><Ionicons name="location" size={16} color={colors.onSuccess} /></View>
          <View style={styles.mapTop}><View style={styles.location}><Ionicons name="location" size={16} color={colors.brandPrimary} /><Text style={styles.locationText}>Downtown, San Diego</Text></View><Pressable style={styles.mapButton}><Ionicons name="locate" size={19} color={colors.onSurface} /></Pressable></View>
          <View style={styles.mapCaption}><View><Text style={styles.captionText}>8 joyful rides nearby</Text><Text style={styles.captionMuted}>Ready when you are</Text></View><Ionicons name="arrow-forward-circle" size={30} color={colors.brandPrimary} /></View>
        </View>
        <Pressable accessibilityRole="button" testID="book-ride-button" onPress={() => router.push("/book")} style={({ pressed }) => [styles.quickBook, pressed && { opacity: 0.84 }]}><Ionicons name="add-circle" size={23} color={colors.onBrandPrimary} /><Text style={styles.quickBookText}>Book a ride</Text></Pressable>
        <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Go somewhere joyful</Text><Text style={styles.link}>See all</Text></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}><Pressable style={[styles.chip, styles.chipActive]} onPress={() => router.push("/book")}><Ionicons name="car-sport" size={17} color={colors.onBrandTertiary} /><Text style={[styles.chipText, { color: colors.onBrandTertiary }]}>Ride now</Text></Pressable><Pressable style={styles.chip} onPress={() => router.push("/(tabs)/explore")}><Ionicons name="sparkles" size={17} color={colors.brandSecondary} /><Text style={styles.chipText}>Sightseeing</Text></Pressable><Pressable style={styles.chip} onPress={() => router.push("/(tabs)/explore")}><Ionicons name="bus" size={17} color={colors.success} /><Text style={styles.chipText}>Shuttle</Text></Pressable></ScrollView>
        <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Made for your day</Text><Pressable onPress={() => router.push("/(tabs)/explore")}><Text style={styles.link}>Explore</Text></Pressable></View>
        {destinations.isLoading ? <View style={styles.loading}><ActivityIndicator color={colors.brandPrimary} /></View> : <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>{(destinations.data ?? []).slice(0, 3).map((destination) => <Pressable key={destination.id} onPress={() => router.push({ pathname: "/book", params: { destination: destination.name } })} style={styles.exploreCard}><LinearGradient colors={[colors.brandSecondary, colors.brandPrimary]} style={StyleSheet.absoluteFill} /><View style={styles.arrow}><Ionicons name="arrow-up" size={16} color={colors.onSurface} /></View><View style={styles.exploreOverlay}><Text style={styles.exploreTitle}>{destination.name}</Text><Text style={styles.exploreSub}>{destination.subtitle}</Text></View></Pressable>)}</ScrollView>}
      </ScrollView>
    </View>
  );
}