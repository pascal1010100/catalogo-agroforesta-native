// app/product/[id].tsx
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Image, Pressable, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useApi, Product } from "../../lib/api";
import { useCart } from "../../stores/cart";

import BaseScreen from "../components/layout/BaseScreen";
import SectionTitle from "../components/ui/SectionTitle";
import { styles } from "../../styles/styles";

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { product } = useApi();
  const { add } = useCart();

  const [data, setData] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await product(id!);
        if (!cancelled) {
          setData(p);
          setErr(null);
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, product]);

  const addQty = () => setQty((q) => q + 1);
  const subQty = () => setQty((q) => Math.max(1, q - 1));

  const handleAddToCart = () => {
    if (!data) return;
    add({
      id: data.id,
      name: data.name,
      price_cents: Math.round((data.price ?? 0) * 100),
      quantity: qty,
      image_url: data.imageUrl ?? "",
    } as any);
    Alert.alert("Carrito", `${data.name} x${qty} agregado.`);
  };

  if (loading) {
    return (
      <BaseScreen>
        <SectionTitle>Producto</SectionTitle>
        <View style={styles.card}>
          <ActivityIndicator />
          <Text style={[styles.cardDesc, { marginTop: 8 }]}>Cargando producto…</Text>
        </View>
      </BaseScreen>
    );
  }

  if (err || !data) {
    return (
      <BaseScreen>
        <SectionTitle>Producto</SectionTitle>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No se pudo cargar</Text>
          <Text style={styles.cardDesc}>{err ?? "Producto no encontrado"}</Text>

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

  const unit = data.unit ? ` / ${data.unit}` : "";
  const price = Number.isFinite(data.price) ? Number(data.price) : 0;
  const priceLabel = `Q ${price.toFixed(2)}${unit}`;

  return (
    <BaseScreen>
      <SectionTitle>{data.name}</SectionTitle>

      <ScrollView contentContainerStyle={styles.gridContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {!!data.imageUrl && (
            <Image
              source={{ uri: data.imageUrl }}
              style={{ width: "100%", height: 220, borderRadius: 12, marginBottom: 12, backgroundColor: "#eef2ee" }}
              resizeMode="cover"
            />
          )}

          <Text style={[styles.cardTitle, { marginBottom: 6 }]}>{data.name}</Text>
          {!!data.category && <Text style={[styles.cardDesc, { marginBottom: 4 }]}>{data.category}</Text>}
          <Text style={[styles.cardDesc, { fontWeight: "700", marginBottom: 8 }]}>{priceLabel}</Text>

          {!!data.description && (
            <Text style={[styles.cardDesc, { lineHeight: 20 }]}>{data.description}</Text>
          )}

          {/* Cantidad */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 }}>
            <Pressable onPress={subQty} style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}>
              <Text style={styles.chipText}>−</Text>
            </Pressable>

            <Text style={[styles.cardTitle, { minWidth: 40, textAlign: "center", marginBottom: 0 }]}>
              {qty}
            </Text>

            <Pressable onPress={addQty} style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}>
              <Text style={styles.chipText}>+</Text>
            </Pressable>
          </View>

          {/* Acciones */}
          <View style={{ marginTop: 14, gap: 10 }}>
            <Pressable
              onPress={handleAddToCart}
              style={({ pressed }) => [
                styles.chip,
                pressed && styles.chipPressed,
                { justifyContent: "center", backgroundColor: "#2e7d32", borderColor: "#2e7d32", paddingVertical: 12 },
              ]}
            >
              <Text style={[styles.chipText, { color: "#fff", textAlign: "center" }]}>
                Agregar al carrito
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/checkout")}
              style={({ pressed }) => [
                styles.chip,
                pressed && styles.chipPressed,
                { justifyContent: "center", paddingVertical: 12 },
              ]}
            >
              <Text style={[styles.chipText, { textAlign: "center" }]}>Ir al checkout</Text>
            </Pressable>

            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.chip,
                pressed && styles.chipPressed,
                { justifyContent: "center", paddingVertical: 12 },
              ]}
            >
              <Text style={[styles.chipText, { textAlign: "center" }]}>Volver</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </BaseScreen>
  );
}
