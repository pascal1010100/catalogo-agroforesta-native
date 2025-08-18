// app/(tabs)/category/[name].tsx
import { useQuery } from "@tanstack/react-query";
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity, Image } from "react-native";
import { useApi } from "../../../lib/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCart } from "../../../stores/cart";

type Product = {
  id: string;
  name: string;
  category?: string;
  price: number;
  unit?: string;
  imageUrl?: string;
  description?: string;
};

export default function CategoryDetail() {
  const { authedFetch } = useApi();
  const { add } = useCart();
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["products"],
    queryFn: () => authedFetch<Product[]>("/products", { method: "GET" }),
  });

  if (isLoading || isRefetching) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Cargando…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ fontWeight: "700" }}>Error</Text>
        <Text selectable>{(error as Error).message}</Text>
        <TouchableOpacity onPress={() => refetch()} style={{ marginTop: 10, padding: 12, borderWidth: 1, borderRadius: 10 }}>
          <Text>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const products = (data ?? []).filter(
    (p) => (p.category ?? "").toLowerCase() === String(name ?? "").toLowerCase()
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>{name}</Text>

      {products.length === 0 ? (
        <Text>No hay productos en esta categoría.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <View style={{ padding: 14, borderWidth: 1, borderRadius: 10 }}>
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={{ width: "100%", height: 140, borderRadius: 8, marginBottom: 10, backgroundColor: "#eee" }}
                  resizeMode="cover"
                />
              ) : null}

              <Text style={{ fontWeight: "700" }}>{item.name}</Text>
              <Text style={{ marginTop: 4 }}>
                Precio: {item.price} {item.unit ? `/${item.unit}` : ""}
              </Text>
              {!!item.description && (
                <Text numberOfLines={2} style={{ marginTop: 6, color: "#666" }}>
                  {item.description}
                </Text>
              )}

              <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                <TouchableOpacity
                  onPress={() => add({
                    id: item.id,
                    name: item.name,
                    price_cents: Math.round(item.price * 100),
                    quantity: 1,
                  })}
                  style={{ flex: 1, padding: 10, borderRadius: 8, borderWidth: 1 }}
                >
                  <Text style={{ textAlign: "center" }}>Agregar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push({
                    pathname: "/(tabs)/product/[id]",
                    params: {
                      id: item.id,
                      name: item.name,
                      price: String(item.price),
                      unit: item.unit ?? "",
                      imageUrl: item.imageUrl ?? "",
                      description: item.description ?? "",
                    },
                  })}
                  style={{ flex: 1, padding: 10, borderRadius: 8, borderWidth: 1 }}
                >
                  <Text style={{ textAlign: "center" }}>Ver detalle</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
