// app/(tabs)/index.tsx
import { useEffect, useRef, useState } from "react";
import { View, Text, Alert, ActivityIndicator, Button } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useApi } from "../../lib/api";
import { useRouter } from "expo-router";
import { useCart } from "../../context/CartContext";

/**
 * Evitamos alertas duplicadas y añadimos:
 * - Botón "Ver catálogo"
 * - Botón "Agregar demo al carrito"
 * - Botón "Ir al checkout (N)"
 */
export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const { health, products, createOrder } = useApi();
  const { addToCart, totalItems } = useCart();
  const router = useRouter();

  const [sending, setSending] = useState(false);

  // Evitar alertas duplicadas
  const hasShownHealth = useRef(false);
  const hasShownProducts = useRef(false);

  // 1) Probar /health una sola vez al montar
  useEffect(() => {
    let cancelled = false;
    if (hasShownHealth.current) return;

    (async () => {
      try {
        const h = await health();
        if (!cancelled) {
          hasShownHealth.current = true;
          console.log("HEALTH:", h);
          Alert.alert("API", `Health ok: ${h.ok ? "true" : "false"}`);
        }
      } catch (e: any) {
        if (!cancelled) {
          console.error("API ERROR /health:", e);
          Alert.alert("API error", e?.message ?? String(e));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [health]);

  // 2) Probar /products sólo cuando Clerk esté listo y haya sesión (y una sola vez)
  useEffect(() => {
    let cancelled = false;
    if (!isLoaded || !isSignedIn || hasShownProducts.current) return;

    (async () => {
      try {
        const list = await products();
        if (!cancelled) {
          hasShownProducts.current = true;
          console.log("PRODUCTS:", list);
          Alert.alert("API protegida", `Productos recibidos: ${list.length}`);
        }
      } catch (e: any) {
        if (!cancelled) {
          console.error("API ERROR /products:", e);
          Alert.alert("API error", e?.message ?? String(e));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, products]);

  // 3) Botón demo: agrega 2 productos al carrito para poder probar el checkout
  function handleAddDemo() {
    addToCart({ id: "p1", name: "Cacao en grano", price: 19.9, qty: 1 });
    addToCart({ id: "p2", name: "Café orgánico", price: 14.5, qty: 2 });
    Alert.alert("Carrito", "Agregados productos de demo.");
  }

  // 4) (Sigue disponible) Botón: crear pedido de prueba directo (opcional)
  async function handleTestOrder() {
    try {
      if (!isLoaded) return Alert.alert("Clerk", "Cargando sesión...");
      if (!isSignedIn) return Alert.alert("Clerk", "Inicia sesión primero.");
      setSending(true);

      const res = await createOrder({
        items: [
          { id: "p1", name: "Cacao en grano", price_cents: 1990, quantity: 1 },
          { id: "p2", name: "Café orgánico",  price_cents: 1450, quantity: 2 },
        ],
        customer: { name: "Demo", phone: "555-000" },
      });

      const anyRes: any = res;
      const id = anyRes?.orderId ?? anyRes?.id ?? "";
      router.push({ pathname: "/order-success", params: { id } });
    } catch (e: any) {
      Alert.alert("Error al crear pedido", e?.message ?? String(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 10, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "600" }}>Inicio</Text>
      <Text>Expo Router funcionando ✅</Text>
      <Text>Carrito: {totalItems} item(s)</Text>
      {!isLoaded && <ActivityIndicator />}

      <View style={{ height: 12 }} />

      {/* Nuevo: botón para ir al catálogo */}
      <Button title="Ver catálogo" onPress={() => router.push("/products")} />

      <View style={{ height: 8 }} />

      <Button title="Agregar demo al carrito" onPress={handleAddDemo} />

      <View style={{ height: 8 }} />

      <Button
        title={`Ir al checkout${totalItems ? ` (${totalItems})` : ""}`}
        onPress={() => router.push("/checkout")}
        disabled={totalItems === 0}
      />

      <View style={{ height: 8 }} />

      <Button
        title={sending ? "Enviando..." : "Crear pedido de prueba (directo)"}
        onPress={handleTestOrder}
        disabled={sending}
      />
    </View>
  );
}
