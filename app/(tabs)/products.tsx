// app/(tabs)/products.tsx
import { useQuery } from "@tanstack/react-query";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
  TextInput,
} from "react-native";
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { useApi } from "../../lib/api";
import { useCart } from "../../stores/cart";

type Product = {
  id: string;
  name: string;
  price: number;
  unit?: string;
  imageUrl?: string;
  description?: string;
};

type SortBy = "name" | "price";

export default function Products() {
  const { authedFetch } = useApi();
  const { add } = useCart();

  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("name");

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["products"],
    queryFn: () => authedFetch<Product[]>("/products", { method: "GET" }),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const onAdd = (p: Product) => {
    const price = Number.isFinite(p.price) ? p.price : 0;
    add({
      id: p.id,
      name: p.name,
      price_cents: Math.round(price * 100),
      quantity: 1,
    });
    Alert.alert("Agregado", `${p.name} se añadió al carrito`);
  };

  const products = data ?? [];

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = q
      ? products.filter((p) => {
          const n = p.name?.toLowerCase() ?? "";
          const d = p.description?.toLowerCase() ?? "";
          return n.includes(q) || d.includes(q);
        })
      : products.slice();

    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      }
      const ap = Number.isFinite(a.price) ? a.price : 0;
      const bp = Number.isFinite(b.price) ? b.price : 0;
      return ap - bp;
    });

    return filtered;
  }, [products, query, sortBy]);

  if (isLoading || isRefetching) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Cargando productos…</Text>
      </View>
    );
  }

  if (error) {
    const msg = (error as Error)?.message ?? "Error desconocido";
    return (
      <View style={{ flex: 1, padding: 16, gap: 10, justifyContent: "center" }}>
        <Text style={{ fontWeight: "700", fontSize: 16 }}>Error</Text>
        <Text selectable style={{ color: "#555" }}>{msg}</Text>
        <TouchableOpacity
          onPress={() => refetch()}
          style={{ padding: 12, borderWidth: 1, borderRadius: 10, alignSelf: "flex-start" }}
        >
          <Text>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Encabezado */}
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>Catálogo</Text>

      {/* Controles */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por nombre o descripción…"
          returnKeyType="search"
          style={{
            flex: 1,
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        />
        <TouchableOpacity
          onPress={() => setSortBy(sortBy === "name" ? "price" : "name")}
          style={{
            paddingHorizontal: 12,
            borderWidth: 1,
            borderRadius: 8,
            justifyContent: "center",
          }}
        >
          <Text>{sortBy === "name" ? "↕️ Nombre" : "↕️ Precio"}</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
  data={visible}
  keyExtractor={(p) => p.id}
  renderItem={({ item }) => (
    <View style={{ padding: 14, borderWidth: 1, borderRadius: 10 }}>
      {!!item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={{ width: "100%", height: 140, borderRadius: 8, marginBottom: 10, backgroundColor: "#eee" }}
          resizeMode="cover"
        />
      )}

      <Text style={{ fontWeight: "700" }}>{item.name}</Text>
      <Text style={{ marginTop: 4 }}>
        Precio: {Number.isFinite(item.price) ? item.price : 0}
        {item.unit ? ` / ${item.unit}` : ""}
      </Text>

      {!!item.description && (
        <Text numberOfLines={2} style={{ marginTop: 6, color: "#666" }}>
          {item.description}
        </Text>
      )}

      <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
        <TouchableOpacity
          onPress={() => onAdd(item)}
          style={{ flex: 1, padding: 10, borderRadius: 8, borderWidth: 1 }}
        >
          <Text style={{ textAlign: "center" }}>Agregar</Text>
        </TouchableOpacity>

        <Link href={`/product/${item.id}`} asChild>
          <TouchableOpacity style={{ flex: 1, padding: 10, borderRadius: 8, borderWidth: 1 }}>
            <Text style={{ textAlign: "center" }}>Ver detalle</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  )}
  ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
  ListEmptyComponent={() => (
    <View style={{ padding: 24, alignItems: "center" }}>
      <Text style={{ color: "#666" }}>No hay productos para mostrar.</Text>
    </View>
  )}
  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}

  /* 👇 claves anti-bloqueo */
  style={{ flex: 1 }}
  contentContainerStyle={{ paddingBottom: 120, paddingTop: 4, flexGrow: 1 }}
  showsVerticalScrollIndicator={false}
  keyboardDismissMode="on-drag"
  keyboardShouldPersistTaps="handled"
  nestedScrollEnabled

  /* performance */
  initialNumToRender={8}
  windowSize={10}
  removeClippedSubviews
/>

    </View>
  );
}
