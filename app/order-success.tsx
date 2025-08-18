// app/order-success.tsx
import { View, Text, Button } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function OrderSuccess() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12, padding: 24 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>¡Pedido enviado! 🎉</Text>
      <Text style={{ fontSize: 16, textAlign: "center" }}>
        {id ? `ID de pedido: ${id}` : "Pedido creado correctamente."}
      </Text>
      <Button title="Volver al inicio" onPress={() => router.replace("/")} />
    </View>
  );
}
