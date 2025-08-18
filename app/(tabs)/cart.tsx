// app/(tabs)/cart.tsx
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useCart } from "../../stores/cart";
import { useApi } from "../../lib/api";

function moneyQ(q: number) {
  return `Q ${q.toFixed(2)}`;
}

export default function CartScreen() {
  const router = useRouter();
  const { authedFetch } = useApi();

  const { items, setQuantity, remove, clear, totalCents } = useCart();
  const [submitting, setSubmitting] = useState(false);

  const total = totalCents() / 100;

  const inc = (id: string, qty: number) => setQuantity(id, qty + 1);
  const dec = (id: string, qty: number) => setQuantity(id, qty - 1); // si llega a 0, tu store lo elimina

  const checkout = async () => {
    if (!items.length) return;
    try {
      setSubmitting(true);

      const payload = {
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          price_cents: i.price_cents,
          quantity: i.quantity,
        })),
      };

      const order = await authedFetch<{
        id: number | string;
        total_cents: number;
      }>("/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      clear();
      Alert.alert("Pedido creado", `#${order.id} por ${moneyQ(order.total_cents / 100)}`);
      router.push("/(tabs)/orders");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo crear el pedido.");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
        <Text style={{ fontSize: 16, color: "#666" }}>Tu carrito está vacío.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>Carrito</Text>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <View style={{ padding: 14, borderWidth: 1, borderRadius: 10 }}>
            <Text style={{ fontWeight: "700" }}>{item.name}</Text>
            <Text>Precio: {moneyQ(item.price_cents / 100)}</Text>
            <Text style={{ marginTop: 4 }}>Cantidad:</Text>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 }}>
              <TouchableOpacity
                onPress={() => dec(item.id, item.quantity)}
                style={{ paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderRadius: 8 }}
              >
                <Text>-</Text>
              </TouchableOpacity>

              <Text style={{ minWidth: 28, textAlign: "center", fontWeight: "700" }}>{item.quantity}</Text>

              <TouchableOpacity
                onPress={() => inc(item.id, item.quantity)}
                style={{ paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderRadius: 8 }}
              >
                <Text>+</Text>
              </TouchableOpacity>

              <View style={{ flex: 1 }} />

              <TouchableOpacity
                onPress={() => remove(item.id)}
                style={{ paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderRadius: 8 }}
              >
                <Text>Quitar</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ marginTop: 8, fontWeight: "700" }}>
              Subtotal: {moneyQ((item.price_cents * item.quantity) / 100)}
            </Text>
          </View>
        )}
      />

      {/* Total + Checkout */}
      <View style={{ borderTopWidth: 1, marginTop: 14, paddingTop: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: "800" }}>Total: {moneyQ(total)}</Text>

        <TouchableOpacity
          onPress={checkout}
          disabled={submitting || items.length === 0}
          style={{
            marginTop: 10,
            padding: 14,
            borderRadius: 10,
            backgroundColor: submitting || items.length === 0 ? "#999" : "#0a84ff",
          }}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>
              Realizar pedido
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
