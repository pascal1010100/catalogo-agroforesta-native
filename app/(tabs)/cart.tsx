// app/(tabs)/cart.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import BaseScreen from "../components/layout/BaseScreen";
import SectionTitle from "../components/ui/SectionTitle";
import { styles } from "../../styles/styles";
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
  const dec = (id: string, qty: number) => setQuantity(id, Math.max(0, qty - 1)); // tu store elimina si llega a 0

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

      const order = await authedFetch<{ id: number | string; total_cents: number }>(
        "/orders",
        { method: "POST", body: JSON.stringify(payload) }
      );

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
      <BaseScreen>
        <SectionTitle>Carrito</SectionTitle>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tu carrito está vacío</Text>
          <Text style={styles.cardDesc}>Agrega productos desde el catálogo.</Text>
        </View>
      </BaseScreen>
    );
  }

  return (
    <BaseScreen>
      <SectionTitle>Carrito</SectionTitle>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.gridContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardDesc}>Precio: {moneyQ(item.price_cents / 100)}</Text>

            <View style={[styles.quickRow, { alignItems: "center", marginTop: 8 }]}>
              {/* - */}
              <Pressable
                onPress={() => dec(item.id, item.quantity)}
                style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
                accessibilityLabel="Disminuir cantidad"
              >
                <Text style={styles.chipText}>−</Text>
              </Pressable>

              {/* Cantidad */}
              <Text style={[styles.cardTitle, { minWidth: 32, textAlign: "center" }]}>
                {item.quantity}
              </Text>

              {/* + */}
              <Pressable
                onPress={() => inc(item.id, item.quantity)}
                style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
                accessibilityLabel="Aumentar cantidad"
              >
                <Text style={styles.chipText}>+</Text>
              </Pressable>

              <View style={{ flex: 1 }} />

              {/* Quitar */}
              <Pressable
                onPress={() => remove(item.id)}
                style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
              >
                <Text style={styles.chipText}>Quitar</Text>
              </Pressable>
            </View>

            <Text style={[styles.cardTitle, { marginTop: 10 }]}>
              Subtotal: {moneyQ((item.price_cents * item.quantity) / 100)}
            </Text>
          </View>
        )}
      />

      {/* Total + Checkout */}
      <View style={[styles.card, { marginTop: 12 }]}>
        <Text style={styles.cardTitle}>Total: {moneyQ(total)}</Text>

        <Pressable
          onPress={checkout}
          disabled={submitting || items.length === 0}
          style={({ pressed }) => [
            styles.chip,
            { justifyContent: "center", marginTop: 12, backgroundColor: submitting || items.length === 0 ? "#ccd6cc" : "#2e7d32" },
            pressed && { opacity: 0.9 },
          ]}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.chipText, { color: "#fff", textAlign: "center" }]}>
              Realizar pedido
            </Text>
          )}
        </Pressable>
      </View>
    </BaseScreen>
  );
}
