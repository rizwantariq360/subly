import { themeColors, ThemeName } from "@/constants/theme";
import { useColorScheme } from "react-native";

export function useAppTheme() {
  const scheme = (useColorScheme() ?? "light") as ThemeName;

  return {
    scheme,
    colors: themeColors[scheme],
    isDark: scheme === "dark",
  };
}
