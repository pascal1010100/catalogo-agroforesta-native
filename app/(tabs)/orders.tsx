// app/(tabs)/orders.tsx
import { useQuery } from "@tanstack/react-query";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useApi } from "../../lib/api";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

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

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
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
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Cargando pedidos…</Text>
      </View>
    );
  }

  if (error) {
    const msg = (error as Error).message ?? "";
    if (msg.includes("API 401")) {
      router.replace("/(auth)/sign-in");
      return (
        <View style={{ padding: 16 }}>
          <Text>Redirigiendo al inicio de sesión…</Text>
        </View>
      );
    }
    return (
      <View style={{ padding: 16, gap: 8 }}>
        <Text style={{ fontWeight: "700" }}>Error</Text>
        <Text selectable>{msg}</Text>
        <TouchableOpacity onPress={() => refetch()} style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}>
          <Text>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const orders = data ?? [];

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>Pedidos</Text>

      {orders.length === 0 ? (
        <Text>No hay pedidos.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => String(o.id)}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const total = (item.total_cents ?? 0) / 100;
            return (
              <View style={{ padding: 14, borderWidth: 1, borderRadius: 10 }}>
                <Text style={{ fontWeight: "700" }}>#{item.id}</Text>
                <Text>Estado: {item.status}</Text>
                <Text>Total: {money(total)}</Text>
                <Text>
                  Fecha: {item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}
                </Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
