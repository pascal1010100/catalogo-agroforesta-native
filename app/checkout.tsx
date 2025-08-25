// app/checkout.tsx
import React, { useMemo, useState } from "react";
import { View, Text, FlatList, Alert, TextInput, Pressable } from "react-native";
import { useRouter } from "expo-router";

import BaseScreen from "../app/components/layout/BaseScreen";
import SectionTitle from "../app/components/ui/SectionTitle";
import { styles } from "../styles/styles";

import { useCart } from "../stores/cart";
import { useApi } from "../lib/api";

function formatQ(cents: number) {
  return `Q ${(cents / 100).toFixed(2)}`;
}

export default function Checkout() {
  const router = useRouter();
  const { authedFetch } = useApi();

  // store de carrito unificado
  const { items, setQuantity, remove, clear, totalCents } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);

  // Totales seguros en centavos
  const total = useMemo(() => totalCents(), [items, totalCents]);

  const mapItems = () =>
    (items ?? []).map((it) => ({
      id: it.id,
      name: (it as any).name ?? (it as any).title ?? "Producto",
      price_cents: it.price_cents ?? 0,
      quantity: it.quantity ?? 0,
    }));

  const onConfirm = async () => {
    try {
      if (!items.length) return Alert.alert("Carrito vacío", "Agrega productos antes de confirmar.");
      if (!name.trim()) return Alert.alert("Datos", "Ingresa tu nombre.");
      if (!phone.trim()) return Alert.alert("Datos", "Ingresa tu teléfono.");

      setSending(true);

      const payload = { items: mapItems(), customer: { name, phone } };
      const order = await authedFetch<{ id: string | number; total_cents: number }>(
        "/orders",
        { method: "POST", body: JSON.stringify(payload) }
      );

      clear();

      // 👇 ruta válida según tu app
      router.replace({ pathname: "/order-success", params: { id: String(order.id) } });
      // Alternativa: router.replace("/(tabs)/orders");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? String(e));
    } finally {
      setSending(false);
    }
  };

  if (!items.length) {
    return (
      <BaseScreen>
        <SectionTitle>Checkout</SectionTitle>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tu carrito está vacío</Text>
          <Text style={styles.cardDesc}>Agrega productos desde el catálogo.</Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.chip, pressed && styles.chipPressed, { alignSelf: "flex-start", marginTop: 10 }]}
          >
            <Text style={styles.chipText}>Volver</Text>
          </Pressable>
        </View>
      </BaseScreen>
    );
  }

  return (
    <BaseScreen>
      <SectionTitle>Checkout</SectionTitle>

      {/* Datos del cliente */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Datos del cliente</Text>

        <Text style={[styles.cardDesc, { marginTop: 8, marginBottom: 4 }]}>Nombre</Text>
        <TextInput
          placeholder="Tu nombre"
          value={name}
          onChangeText={setName}
          style={{
            borderWidth: 1, borderColor: "#cfe6d7", backgroundColor: "#eef7f1",
            borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
          }}
        />

        <Text style={[styles.cardDesc, { marginTop: 10, marginBottom: 4 }]}>Teléfono</Text>
        <TextInput
          placeholder="Tu teléfono"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          style={{
            borderWidth: 1, borderColor: "#cfe6d7", backgroundColor: "#eef7f1",
            borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
          }}
        />
      </View>

      {/* Lista de items */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Items ({items.reduce((a, it) => a + (it.quantity ?? 0), 0)})
        </Text>

        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => {
            const nameOrTitle = (item as any).name ?? (item as any).title ?? "Producto";
            const q = item.quantity ?? 0;
            const cents = (item.price_cents ?? 0) * q;

            return (
              <View style={{ paddingVertical: 6, flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { marginBottom: 2 }]}>{nameOrTitle}</Text>
                  <Text style={styles.cardDesc}>Cantidad: {q}</Text>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[styles.cardDesc, { fontWeight: "700" }]}>{formatQ(cents)}</Text>

                  <View style={[styles.quickRow, { marginTop: 6 }]}>
                    <Pressable
                      onPress={() => setQuantity(item.id, Math.max(1, q - 1))}
                      style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
                    >
                      <Text style={styles.chipText}>−</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setQuantity(item.id, q + 1)}
                      style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
                    >
                      <Text style={styles.chipText}>+</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => remove(item.id)}
                      style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
                    >
                      <Text style={styles.chipText}>Quitar</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          }}
          scrollEnabled={false}
        />
      </View>

      {/* Total y acciones */}
      <View style={[styles.card, { gap: 8 }]}>
        <Text style={styles.cardTitle}>Total</Text>
        <Text style={[styles.cardDesc, { fontWeight: "700", fontSize: 16 }]}>{formatQ(total)}</Text>

        <Pressable
          onPress={onConfirm}
          disabled={sending}
          style={({ pressed }) => [
            styles.chip,
            { justifyContent: "center", backgroundColor: sending ? "#ccd6cc" : "#2e7d32", borderColor: "#2e7d32", paddingVertical: 12 },
            pressed && styles.chipPressed,
          ]}
        >
          <Text style={[styles.chipText, { color: "#fff", textAlign: "center" }]}>
            {sending ? "Enviando…" : "Confirmar pedido"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.chip, pressed && styles.chipPressed, { justifyContent: "center", paddingVertical: 12 }]}
        >
          <Text style={[styles.chipText, { textAlign: "center" }]}>Cancelar</Text>
        </Pressable>
      </View>
    </BaseScreen>
  );
}
