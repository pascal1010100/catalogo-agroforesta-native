// app/categories/[slug].tsx
import React, { useMemo } from "react";
import { View, Text, ActivityIndicator, FlatList, RefreshControl } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import BaseScreen from "../../components/layout/BaseScreen";
import SectionTitle from "../../components/ui/SectionTitle";
import ProductCard from "../../components/ui/ProductCard";
import { styles } from "../../../styles/styles";

import { useApi } from "../../../lib/api";
import { useCart } from "../../../stores/cart";

type Product = {
  id: string;
  name: string;
  price: number;
  unit?: string;
  imageUrl?: string;
  description?: string;
  category?: string; // por si viene en el payload
};

const CATEGORY_TITLES: Record<string, string> = {
  maquinaria: "Maquinaria",
  fertilizantes: "Fertilizantes",
  herramientas: "Herramientas",
  frutas: "Frutas",
  verduras: "Verduras",
  semillas: "Semillas",
};

function moneyQ(q: number) {
  return `Q ${q.toFixed(2)}`;
}

export default function CategoryProductsScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { authedFetch } = useApi();
  const { add } = useCart();

  const title = CATEGORY_TITLES[slug ?? ""] ?? "Categoría";

  // Preferimos pedir filtrado al backend; si no soporta ?category=, abajo hacemos fallback local
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["categoryProducts", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      try {
        const byCat = await authedFetch<Product[]>(`/products?category=${encodeURIComponent(String(slug))}`, {
          method: "GET",
        });
        return byCat;
      } catch {
        // fallback: trae todos (si el backend no soporta el filtro) y filtra localmente
        const all = await authedFetch<Product[]>(`/products`, { method: "GET" });
        return all.filter((p) => (p.category ?? "").toLowerCase() === String(slug).toLowerCase());
      }
    },
  });

  const products = data ?? [];

  const list = useMemo(
    () =>
      (products ?? []).map((p) => ({
        id: p.id,
        name: p.name ?? "Producto",
        price: Number.isFinite(p.price) ? Number(p.price) : 0,
        unit: p.unit,
        imageUrl: p.imageUrl ?? "",
        description: p.description ?? "",
      })),
    [products]
  );

  if (isLoading || isRefetching) {
    return (
      <BaseScreen>
        <SectionTitle>{title}</SectionTitle>
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
        <SectionTitle>{title}</SectionTitle>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No se pudo cargar</Text>
          <Text style={styles.cardDesc}>{msg}</Text>
        </View>
      </BaseScreen>
    );
  }

  return (
    <BaseScreen>
      <SectionTitle>{title}</SectionTitle>

      {list.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sin productos</Text>
          <Text style={styles.cardDesc}>No encontramos productos en esta categoría.</Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.gridContent}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
          renderItem={({ item }) => (
            <ProductCard
              title={item.name}
              priceQ={`Precio: ${moneyQ(item.price)}${item.unit ? ` / ${item.unit}` : ""}`}
              desc={item.description}
              imageUrl={item.imageUrl}
              onAdd={() =>
                add({
                  id: item.id,
                  name: item.name,
                  price_cents: Math.round(item.price * 100),
                  quantity: 1,
                  image_url: item.imageUrl ?? "",
                } as any)
              }
              onDetail={() => router.push(`/product/${item.id}`)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </BaseScreen>
  );
}
