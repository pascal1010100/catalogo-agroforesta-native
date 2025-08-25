// app/(tabs)/categories/_layout.tsx
import { Stack } from "expo-router";

export default function CategoriesStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />   {/* pantalla principal de la pestaña */}
      <Stack.Screen name="[slug]" />  {/* detalle; no aparece como tab */}
    </Stack>
  );
}
