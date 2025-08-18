// app/checkout.tsx
import { useMemo, useState } from "react";
import { View, Text, Button, TextInput, Alert, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { useCart } from "../context/CartContext";
import { useApi } from "../lib/api";

export default function Checkout() {
  const router = useRouter();
  const { cart, updateQty, removeFromCart, clearCart, totalItems } = useCart();
  const { mapCartToOrderItems, createOrder } = useApi();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);

  // Calcula totales desde los centavos (seguro)
  const { itemsCents, totalCents } = useMemo(() => {
    const mapped = mapCartToOrderItems(cart);
    const total = mapped.reduce((s, it) => s + it.price_cents * it.quantity, 0);
    return { itemsCents: mapped, totalCents: total };
  }, [cart, mapCartToOrderItems]);

  function formatQ(cents: number) {
    return `Q ${(cents / 100).toFixed(2)}`;
  }

  async function handleConfirm() {
    try {
      if (cart.length === 0) return Alert.alert("Carrito vacío", "Agrega productos antes de confirmar.");
      if (!name.trim()) return Alert.alert("Datos", "Ingresa tu nombre.");
      if (!phone.trim()) return Alert.alert("Datos", "Ingresa tu teléfono.");

      setSending(true);

      const res = await createOrder({
        items: itemsCents,
        customer: { name, phone },
      });

      const anyRes: any = res;
      const id = anyRes?.orderId ?? anyRes?.id ?? "";

      clearCart();
      router.replace({ pathname: "/order-success", params: { id } });
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? String(e));
    } finally {
      setSending(false);
    }
  }

  if (cart.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12, padding: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Carrito vacío</Text>
        <Button title="Volver" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Checkout</Text>

      {/* Datos del cliente */}
      <View style={{ gap: 8 }}>
        <Text>Nombre</Text>
        <TextInput
          placeholder="Tu nombre"
          value={name}
          onChangeText={setName}
          style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10 }}
        />
        <Text>Teléfono</Text>
        <TextInput
          placeholder="Tu teléfono"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10 }}
        />
      </View>

      {/* Lista de items */}
      <Text style={{ marginTop: 8, fontWeight: "600" }}>Items ({totalItems})</Text>
      <FlatList
        data={cart}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => {
          // Subtotal mostrado usando centavos calculados (seguro)
          const cents = (mapCartToOrderItems([item])[0]?.price_cents || 0) * (item.qty || 0);
          return (
            <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: "#eee", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ maxWidth: "60%" }}>
                <Text style={{ fontWeight: "600" }}>{item.name}</Text>
                <Text>Cantidad: {item.qty}</Text>
              </View>
              <View style={{ gap: 6, alignItems: "flex-end" }}>
                <Text>{formatQ(cents)}</Text>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  <Button title="−" onPress={() => updateQty(item.id, Math.max(1, (item.qty || 1) - 1))} />
                  <Button title="+" onPress={() => updateQty(item.id, (item.qty || 0) + 1)} />
                  <Button title="Quitar" onPress={() => removeFromCart(item.id)} />
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* Total y acciones */}
      <View style={{ marginTop: 12, gap: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Total: {formatQ(totalCents)}</Text>
        <Button title={sending ? "Enviando..." : "Confirmar pedido"} onPress={handleConfirm} disabled={sending} />
        <Button title="Cancelar" onPress={() => router.back()} color="#888" />
      </View>
    </View>
  );
}
