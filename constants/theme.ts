export const themeColors = {
  light: {
    background: "#fffaf0",
    foreground: "#0f172a",
    card: "#ffffff",
    muted: "#f1ead9",
    mutedForeground: "rgba(15, 23, 42, 0.65)",
    primary: "#0f172a",
    accent: "#f97316",
    border: "rgba(15, 23, 42, 0.12)",
    success: "#22c55e",
    destructive: "#ef4444",
    subscription: "#14b8a6",
  },
  dark: {
    background: "#0b1220",
    foreground: "#e5e7eb",
    card: "#111827",
    muted: "#1f2937",
    mutedForeground: "rgba(229, 231, 235, 0.7)",
    primary: "#e5e7eb",
    accent: "#fb923c",
    border: "rgba(255, 255, 255, 0.08)",
    success: "#22c55e",
    destructive: "#f87171",
    subscription: "#2dd4bf",
  },
} as const;

export type ThemeName = keyof typeof themeColors;
export type ThemeColors = typeof themeColors.light;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  18: 72,
  20: 80,
  24: 96,
  30: 120,
} as const;

export const components = {
  tabBar: {
    height: spacing[18],
    horizontalInset: spacing[5],
    radius: spacing[8],
    iconFrame: spacing[12],
    itemPaddingVertical: spacing[2],
  },
} as const;

export const theme = {
  themeColors,
  spacing,
  components,
} as const;
