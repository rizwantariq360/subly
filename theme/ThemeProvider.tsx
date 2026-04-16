import { VariableContextProvider } from "nativewind";
import { useColorScheme } from "react-native";

const theme = {
  light: {
    "--color-background": "#fffaf0",
    "--color-foreground": "#0f172a",
    "--color-card": "#ffffff",
    "--color-muted": "#f1ead9",
    "--color-muted-foreground": "rgba(15, 23, 42, 0.65)",
    "--color-primary": "#0f172a",
    "--color-accent": "#f97316",
    "--color-border": "rgba(15, 23, 42, 0.12)",
    "--color-success": "#22c55e",
    "--color-destructive": "#ef4444",
    "--color-subscription": "#2dd4bf",
  },

  dark: {
    "--color-background": "#0b1220",
    "--color-foreground": "#e5e7eb",
    "--color-card": "#111827",
    "--color-muted": "#1f2937",
    "--color-muted-foreground": "rgba(229, 231, 235, 0.7)",
    "--color-primary": "#e5e7eb",
    "--color-accent": "#fb923c",
    "--color-border": "rgba(255, 255, 255, 0.08)",
    "--color-success": "#22c55e",
    "--color-destructive": "#f87171",
    "--color-subscription": "#14b8a6",
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme() ?? "light";

  return (
    <VariableContextProvider value={theme[colorScheme]}>
      {children}
    </VariableContextProvider>
  );
}
