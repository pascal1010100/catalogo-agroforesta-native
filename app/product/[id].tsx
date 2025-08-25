// app/product/[id].tsx
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Image, Button, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useApi, Product } from "../../lib/api";
// ⛔️ import { useCart } from "../../context/CartContext";
// ✅ usar el mismo store que en products.tsx
import { useCart } from "../../stores/cart";

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { product } = useApi();
  // ⛔️ const { addToCart } = useCart();
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

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Cargando producto…</Text>
      </View>
    );
  }

  if (err || !data) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
        <Text style={{ fontWeight: "700", marginBottom: 8 }}>No se pudo cargar</Text>
        <Text style={{ textAlign: "center", marginBottom: 12 }}>{err ?? "Producto no encontrado"}</Text>
        <Button title="Volver" onPress={() => router.back()} />
      </View>
    );
  }

  const addQty = () => setQty((q) => q + 1);
  const subQty = () => setQty((q) => Math.max(1, q - 1));

  const handleAddToCart = () => {
    // ✅ mismo contrato que en products.tsx (price_cents + quantity)
    add({
      id: data.id,
      name: data.name,
      price_cents: Math.round((data.price ?? 0) * 100),
      quantity: qty,
    });
    Alert.alert("Carrito", `${data.name} x${qty} agregado.`);
  };

  const unit = data.unit ? ` / ${data.unit}` : "";

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      {!!data.imageUrl && (
        <Image
          source={{ uri: data.imageUrl }}
          style={{ width: "100%", height: 220, borderRadius: 12, backgroundColor: "#f2f2f2" }}
          resizeMode="cover"
        />
      )}

      <Text style={{ fontSize: 22, fontWeight: "800" }}>{data.name}</Text>
      {!!data.category && <Text style={{ color: "#666" }}>{data.category}</Text>}
      <Text style={{ fontSize: 18 }}>{`Q ${Number(data.price ?? 0).toFixed(2)}${unit}`}</Text>
      {!!data.description && <Text style={{ marginTop: 4 }}>{data.description}</Text>}

      {/* Cantidad */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
        <Button title="−" onPress={subQty} />
        <Text style={{ minWidth: 40, textAlign: "center", fontSize: 18 }}>{qty}</Text>
        <Button title="+" onPress={addQty} />
      </View>

      {/* Acciones */}
      <View style={{ gap: 8, marginTop: 12 }}>
        <Button title="Agregar al carrito" onPress={handleAddToCart} />
        {/* Si checkout está dentro de (tabs), la ruta absoluta es "/checkout" */}
        <Button title="Ir al checkout" onPress={() => router.push("/checkout")} />
        <Button title="Volver" onPress={() => router.back()} color="#888" />
      </View>
    </View>
  );
}
