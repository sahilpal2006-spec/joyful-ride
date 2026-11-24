import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";

import { usesNativeTabs } from "@/src/utils/navigation";
import { useTheme } from "@/src/utils/theme";

export default function TabLayout() {
  const { colors } = useTheme();
  if (usesNativeTabs) {
    return (
      <NativeTabs>
        <NativeTabs.Trigger name="index"><NativeTabs.Trigger.Icon sf="house.fill" /><NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label></NativeTabs.Trigger>
        <NativeTabs.Trigger name="explore"><NativeTabs.Trigger.Icon sf="sparkles" /><NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label></NativeTabs.Trigger>
        <NativeTabs.Trigger name="trips"><NativeTabs.Trigger.Icon sf="clock.fill" /><NativeTabs.Trigger.Label>Trips</NativeTabs.Trigger.Label></NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile"><NativeTabs.Trigger.Icon sf="person.fill" /><NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label></NativeTabs.Trigger>
      </NativeTabs>
    );
  }
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.brandPrimary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { ...(Platform.OS === "web" ? { height: 64 } : {}) },
        tabBarItemStyle: { alignSelf: "center" },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        tabBarIcon: ({ color, size }) => {
          const icon = route.name === "index" ? "home" : route.name === "explore" ? "sparkles" : route.name === "trips" ? "time" : "person";
          return <Ionicons name={icon as keyof typeof Ionicons.glyphMap} color={color as string} size={size} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="explore" options={{ title: "Explore" }} />
      <Tabs.Screen name="trips" options={{ title: "Trips" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}