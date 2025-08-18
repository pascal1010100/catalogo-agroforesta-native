// app/products.tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Button,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useApi, Product } from "../lib/api";
import { useCart } from "../context/CartContext";

export default function ProductsScreen() {
  const router = useRouter();
  const { products } = useApi();
  const { addToCart, totalItems } = useCart();

  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await products();
        if (!cancelled) {
          setList(data);
          setError(null);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? String(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [products]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Cargando productos…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
        <Text style={{ fontWeight: "700", marginBottom: 8 }}>Error</Text>
        <Text style={{ textAlign: "center", marginBottom: 12 }}>{error}</Text>
        <Button title="Volver" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: "700" }}>Productos</Text>
        <Button
          title={`Checkout${totalItems ? ` (${totalItems})` : ""}`}
          onPress={() => router.push("/checkout")}
          disabled={totalItems === 0}
        />
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View
            style={{
              borderWidth: 1,
              borderColor: "#eee",
              borderRadius: 12,
              overflow: "hidden",
              backgroundColor: "white",
            }}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={{ width: "100%", height: 160, backgroundColor: "#f2f2f2" }}
              resizeMode="cover"
            />
            <View style={{ padding: 12, gap: 6 }}>
              <Text style={{ fontSize: 16, fontWeight: "700" }}>{item.name}</Text>
              <Text style={{ color: "#666" }}>{item.category}</Text>
              <Text style={{ fontSize: 16 }}>{`Q ${item.price.toFixed(2)} / ${item.unit}`}</Text>

              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
                <TouchableOpacity
                  onPress={() => {
                    addToCart({ id: item.id, name: item.name, price: item.price, qty: 1 });
                    Alert.alert("Carrito", `${item.name} agregado.`);
                  }}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    backgroundColor: "#0a7",
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "700" }}>Agregar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push(`/product/${item.id}`)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    backgroundColor: "#eee",
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontWeight: "600" }}>Detalles</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <View style={{ position: "absolute", left: 12, right: 12, bottom: 12 }}>
        <Button title="Volver" onPress={() => router.back()} />
      </View>
    </View>
  );
}
