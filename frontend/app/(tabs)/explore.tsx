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
  content: { paddingHorizontal: 20, gap: 22 },
  kicker: { color: colors.brandPrimary, fontSize: 13, fontWeight: "800", letterSpacing: 0.5 },
  title: { color: colors.onSurface, fontSize: 30, fontWeight: "800", marginTop: 4 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 8, maxWidth: 320 },
  feature: { height: 250, borderRadius: 28, overflow: "hidden", justifyContent: "flex-end" },
  featureCopy: { padding: 20 },
  featureTag: { alignSelf: "flex-start", backgroundColor: colors.brandSecondary, borderRadius: 16, paddingHorizontal: 11, paddingVertical: 7, marginBottom: 12 },
  featureTagText: { color: colors.onBrandSecondary, fontSize: 12, fontWeight: "800" },
  featureTitle: { color: colors.onSurfaceInverse, fontSize: 26, fontWeight: "800", maxWidth: 250 },
  featureSub: { color: colors.onSurfaceInverse, fontSize: 13, marginTop: 5, opacity: 0.86 },
  sectionTitle: { color: colors.onSurface, fontSize: 20, fontWeight: "800" },
  cards: { gap: 12 },
  card: { backgroundColor: colors.surfaceSecondary, borderRadius: 22, padding: 15, flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1, borderColor: colors.border },
  icon: { width: 52, height: 52, borderRadius: 18, backgroundColor: colors.brandTertiary, alignItems: "center", justifyContent: "center" },
  cardBody: { flex: 1 },
  cardTitle: { color: colors.onSurface, fontSize: 16, fontWeight: "800" },
  cardSub: { color: colors.muted, fontSize: 13, marginTop: 4 },
  distance: { color: colors.brandPrimary, fontSize: 12, fontWeight: "800" },
  plan: { backgroundColor: colors.onSurface, borderRadius: 20, padding: 18, flexDirection: "row", alignItems: "center", gap: 14 },
  planTitle: { color: colors.onSurfaceInverse, fontSize: 17, fontWeight: "800" },
  planSub: { color: colors.onSurfaceInverse, opacity: 0.65, fontSize: 12, marginTop: 4 },
}));

export default function ExploreScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const destinations = useQuery({ queryKey: ["destinations"], queryFn: getDestinations });
  return (
    <View style={styles.root} testID="explore-screen">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 28 }]}>
        <View><Text style={styles.kicker}>JOYFUL DISCOVERY</Text><Text style={styles.title}>Take the scenic route.</Text><Text style={styles.subtitle}>Little adventures are closer than you think. Pick a place and we’ll make getting there the best part.</Text></View>
        <Pressable onPress={() => router.push({ pathname: "/book", params: { destination: "Sunset Harbor", experience: "Sunset Harbor escape" } })} style={styles.feature}><LinearGradient colors={[colors.brandSecondary, colors.brandPrimary]} style={StyleSheet.absoluteFill} /><View style={styles.featureCopy}><View style={styles.featureTag}><Text style={styles.featureTagText}>THIS WEEKEND</Text></View><Text style={styles.featureTitle}>Golden hour at the harbor</Text><Text style={styles.featureSub}>From $18 · 12 min away</Text></View></Pressable>
        <Text style={styles.sectionTitle}>Places worth the ride</Text>
        <View style={styles.cards}>{destinations.isLoading ? <ActivityIndicator color={colors.brandPrimary} /> : (destinations.data ?? []).map((destination, index) => <Pressable key={destination.id} onPress={() => router.push({ pathname: "/book", params: { destination: destination.name, experience: destination.name } })} style={styles.card}><View style={[styles.icon, index % 2 === 1 && { backgroundColor: colors.surfaceTertiary }]}><Ionicons name={destination.icon as keyof typeof Ionicons.glyphMap} size={25} color={index % 2 === 1 ? colors.success : colors.brandPrimary} /></View><View style={styles.cardBody}><Text style={styles.cardTitle}>{destination.name}</Text><Text style={styles.cardSub}>{destination.subtitle}</Text></View><View><Text style={styles.distance}>{destination.distance}</Text><Ionicons name="chevron-forward" size={18} color={colors.muted} style={{ marginTop: 12, alignSelf: "flex-end" }} /></View></Pressable>)}</View>
        <Pressable onPress={() => router.push("/book")} style={styles.plan}><Ionicons name="map-outline" size={28} color={colors.brandSecondary} /><View style={{ flex: 1 }}><Text style={styles.planTitle}>Plan your own joy ride</Text><Text style={styles.planSub}>Choose any pickup and destination</Text></View><Ionicons name="arrow-forward" size={20} color={colors.onSurfaceInverse} /></Pressable>
      </ScrollView>
    </View>
  );
}