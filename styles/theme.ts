// styles/theme.ts
export const theme = {
  colors: {
    bg: "#f2f6f3",
    text: "#1f2d22",
    textMuted: "#567a68",
    brand: "#2e7d32",
    brandOn: "#ffffff",
    brandLite: "#e6f4ea",
    surface: "#ffffff",
    surfaceBorder: "#dfeee6",
    chipBg: "#eef7f1",
    chipBorder: "#cfe6d7",
    warnBg: "#fdeaea",
    warnBorder: "#f7b4b4",
    warnText: "#7a2f2f",
  },
  spacing: {
    xs: 4, sm: 6, md: 8, lg: 12, xl: 14, xxl: 16, xxxl: 20,
  },
  radius: { sm: 8, md: 12, lg: 16, full: 999 },
  font: { xs: 12, sm: 13, md: 16, lg: 20, xl: 22, badge: 12, fabIcon: 24 },
  shadow: {
    card: { color: "#000", opacity: 0.06, offset: { width: 0, height: 6 }, radius: 8, elevation: 2 },
    fab:  { color: "#000", opacity: 0.2,  offset: { width: 0, height: 6 }, radius: 8, elevation: 8 },
  },
};
