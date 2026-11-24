import { useMemo } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

const light = {
  surface: "#FFFDF9",
  onSurface: "#1F2328",
  surfaceSecondary: "#F5F2EB",
  onSurfaceSecondary: "#2C3238",
  surfaceTertiary: "#ECE7DE",
  onSurfaceTertiary: "#3B424A",
  surfaceInverse: "#1F2328",
  onSurfaceInverse: "#FFFDF9",
  muted: "#7A8288",
  brand: "#FF6B35",
  onBrand: "#FFFFFF",
  brandPrimary: "#FF5722",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#FF9F1C",
  onBrandSecondary: "#1F2328",
  brandTertiary: "#FFE5D9",
  onBrandTertiary: "#D9381E",
  success: "#2EC4B6",
  onSuccess: "#FFFFFF",
  warning: "#FF9F1C",
  onWarning: "#1F2328",
  error: "#E71D36",
  onError: "#FFFFFF",
  info: "#3A86FF",
  onInfo: "#FFFFFF",
  border: "#E2DDD2",
  borderStrong: "#C8C0B2",
  divider: "#EFECE4",
};

export type ThemeColors = typeof light;
export const defaultScheme = "light" satisfies ColorScheme;
export const themes: { light: ThemeColors; dark?: ThemeColors } = { light };

export function setColorScheme(scheme: ColorScheme | null) {
  Appearance.setColorScheme?.(scheme ?? "unspecified");
}

setColorScheme(themes.dark ? null : defaultScheme);

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const system = useColorScheme();
  const scheme: ColorScheme = system === "dark" && themes.dark ? "dark" : defaultScheme;
  return { scheme, colors: themes[scheme] ?? themes.light };
}

export function makeStyles(factory: (colors: ThemeColors) => Record<string, any>): () => any {
  return function useStyles(): any {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}