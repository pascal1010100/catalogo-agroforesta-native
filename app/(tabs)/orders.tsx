// app/(tabs)/orders.tsx
import React, { useCallback, useState } from "react";
import { View, Text, ActivityIndicator, FlatList, RefreshControl, Pressable } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";

import BaseScreen from "../components/layout/BaseScreen";
import SectionTitle from "../components/ui/SectionTitle";
import { styles } from "../../styles/styles";

import { useApi } from "../../lib/api";

type Order = {
  id: string | number;
  status: string;
  total_cents: number;
  createdAt: string;
};

function money(q: number) {
  return `Q ${q.toFixed(2)}`;
}

export default function Orders() {
  const { authedFetch } = useApi();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["orders"],
    queryFn: () => authedFetch<Order[]>("/orders", { method: "GET" }),
  });

  // 🔄 refresca automáticamente cada vez que entras a esta pestaña
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading || isRefetching) {
    return (
      <BaseScreen>
        <SectionTitle>Pedidos</SectionTitle>
        <View style={styles.card}>
          <ActivityIndicator />
          <Text style={[styles.cardDesc, { marginTop: 8 }]}>Cargando pedidos…</Text>
        </View>
      </BaseScreen>
    );
  }

  if (error) {
    const msg = (error as Error)?.message ?? "";
    if (msg.includes("API 401")) {
      router.replace("/(auth)/sign-in");
      return (
        <BaseScreen>
          <SectionTitle>Pedidos</SectionTitle>
          <View style={styles.card}>
            <Text style={styles.cardDesc}>Redirigiendo al inicio de sesión…</Text>
          </View>
        </BaseScreen>
      );
    }
    return (
      <BaseScreen>
        <SectionTitle>Pedidos</SectionTitle>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Error</Text>
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

  const orders = data ?? [];

  return (
    <BaseScreen>
      <SectionTitle>Pedidos</SectionTitle>

      {orders.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No hay pedidos</Text>
          <Text style={styles.cardDesc}>Cuando realices una compra aparecerá aquí.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => String(o.id)}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={styles.gridContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const total = (item.total_cents ?? 0) / 100;
            const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleString() : "—";
            return (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>#{item.id}</Text>
                <Text style={styles.cardDesc}>Estado: {item.status}</Text>
                <Text style={styles.cardDesc}>Total: {money(total)}</Text>
                <Text style={styles.cardDesc}>Fecha: {dateStr}</Text>
              </View>
            );
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </BaseScreen>
  );
}
