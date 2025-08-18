import { Stack } from "expo-router";

export default function ProductLayout() {
  return (
    <Stack>
      {/* Esta línea indica que cada archivo dentro de /product es parte de este Stack */}
      <Stack.Screen name="[id]" options={{ title: "Producto" }} />
    </Stack>
  );
}
