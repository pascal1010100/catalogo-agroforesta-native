// app/(tabs)/products.tsx
import React, { useMemo, useState } from "react";
import { View, Text, ActivityIndicator, FlatList, RefreshControl, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import BaseScreen from "../components/layout/BaseScreen";
import SectionTitle from "../components/ui/SectionTitle";
import ProductCard from "../components/ui/ProductCard";
import SearchBar from "../components/SearchBar";
import { styles } from "../../styles/styles";

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

function moneyQ(q: number) {
  return `Q ${q.toFixed(2)}`;
}

export default function Products() {
  const router = useRouter();
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
      image_url: p.imageUrl ?? "",
    } as any);
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
      if (sortBy === "name") return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      const ap = Number.isFinite(a.price) ? a.price : 0;
      const bp = Number.isFinite(b.price) ? b.price : 0;
      return ap - bp;
    });

    return filtered;
  }, [products, query, sortBy]);

  if (isLoading || isRefetching) {
    return (
      <BaseScreen>
        <SectionTitle>Catálogo</SectionTitle>
        <View style={styles.card}>
          <ActivityIndicator />
          <Text style={[styles.cardDesc, { marginTop: 8 }]}>Cargando productos…</Text>
        </View>
      </BaseScreen>
    );
  }

  if (error) {
    const msg = (error as Error)?.message ?? "Error desconocido";
    return (
      <BaseScreen>
        <SectionTitle>Catálogo</SectionTitle>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No se pudo cargar el catálogo</Text>
          <Text selectable style={styles.cardDesc}>{msg}</Text>

          <Pressable
            onPress={() => refetch()}
            style={({ pressed }) => [styles.chip, pressed && styles.chipPressed, { alignSelf: "flex-start", marginTop: 10 }]}
          >
            <Text style={styles.chipText}>Reintentar</Text>
          </Pressable>
        </View>
      </BaseScreen>
    );
  }

  return (
    <BaseScreen>
      <SectionTitle>Catálogo</SectionTitle>

      {/* Controles */}
      <View style={[styles.quickRow, { marginBottom: 10, alignItems: "center" }]}>
        <View style={{ flex: 1 }}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onSubmit={() => {}}
            placeholder="Buscar por nombre o descripción…"
          />
        </View>

        <Pressable
          onPress={() => setSortBy(sortBy === "name" ? "price" : "name")}
          style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
        >
          <Text style={styles.chipText}>{sortBy === "name" ? "↕️ Nombre" : "↕️ Precio"}</Text>
        </Pressable>
      </View>

      {/* Lista */}
      <FlatList
        data={visible}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <ProductCard
            title={item.name}
            priceQ={`Precio: ${moneyQ(Number.isFinite(item.price) ? item.price : 0)}${item.unit ? ` / ${item.unit}` : ""}`}
            desc={item.description}
            imageUrl={item.imageUrl}
            onAdd={() => onAdd(item)}
            onDetail={() => router.push(`/product/${item.id}`)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={() => (
          <View style={{ padding: 24, alignItems: "center" }}>
            <Text style={styles.cardDesc}>No hay productos para mostrar.</Text>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={{ flex: 1 }}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        initialNumToRender={8}
        windowSize={10}
        removeClippedSubviews
      />
    </BaseScreen>
  );
}
