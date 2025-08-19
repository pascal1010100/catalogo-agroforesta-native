// app/(tabs)/index.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ActivityIndicator, Button, Alert } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useApi } from "../../lib/api";
import { useRouter } from "expo-router";
import { useCart } from "../../stores/cart"; // ✅ unificado al store

const DEBUG = false; // ⬅️ pon en true si quieres ver logs puntuales

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const { health, products, createOrder } = useApi();
  const { items, add, /* clear, total_cents */ } = useCart();
  const router = useRouter();

  const [sending, setSending] = useState(false);

  // Derivar totalItems del store (en caso no exista totalItems ya calculado)
  const totalItems = useMemo(
    () => (items ?? []).reduce((acc, it) => acc + (it.quantity ?? 0), 0),
    [items]
  );

  // Evitar llamadas duplicadas
  const hasShownHealth = useRef(false);
  const hasShownProducts = useRef(false);

  // 1) Probar /health UNA sola vez al montar (sin alerts en UI)
  useEffect(() => {
    let cancelled = false;
    if (hasShownHealth.current) return;

    (async () => {
      try {
        const h = await health();
        if (!cancelled) {
          hasShownHealth.current = true;
          if (DEBUG) console.log("HEALTH:", h);
        }
      } catch (e: any) {
        if (!cancelled) {
          // En producción, evita alertas ruidosas:
          if (DEBUG) console.error("API ERROR /health:", e);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [health]);

  // 2) Probar /products una sola vez cuando la sesión esté lista (sin alerts)
  useEffect(() => {
    let cancelled = false;
    if (!isLoaded || !isSignedIn || hasShownProducts.current) return;

    (async () => {
      try {
        const list = await products();
        if (!cancelled) {
          hasShownProducts.current = true;
          if (DEBUG) console.log("PRODUCTS(len):", list?.length ?? 0, list);
        }
      } catch (e: any) {
        if (!cancelled) {
          if (DEBUG) console.error("API ERROR /products:", e);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [isLoaded, isSignedIn, products]);

  // 3) Botón demo: agrega productos al carrito (usa el contrato del store)
  function handleAddDemo() {
    add({ id: "p1", name: "Cacao en grano", price_cents: 1990, quantity: 1 });
    add({ id: "p2", name: "Café orgánico",  price_cents: 1450, quantity: 2 });
    Alert.alert("Carrito", "Se agregaron productos de demo.");
  }

  // 4) (Opcional solo debug) Crear pedido directo para pruebas
  async function handleTestOrder() {
    if (!DEBUG) return; // ⬅️ desactivado por defecto para no romper el flujo normal
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

      {/* Ir al catálogo */}
      <Button title="Ver catálogo" onPress={() => router.push("/products")} />

      <View style={{ height: 8 }} />

      <Button title="Agregar demo al carrito" onPress={handleAddDemo} />

      <View style={{ height: 8 }} />

      <Button
        title={`Ir al checkout${totalItems ? ` (${totalItems})` : ""}`}
        onPress={() => router.push("/checkout")}
        disabled={totalItems === 0}
      />

      {DEBUG && (
        <>
          <View style={{ height: 8 }} />
          <Button
            title={sending ? "Enviando..." : "Crear pedido de prueba (directo)"}
            onPress={handleTestOrder}
            disabled={sending}
          />
        </>
      )}
    </View>
  );
}
