// app/(tabs)/categories.tsx
import { useQuery } from "@tanstack/react-query";
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity } from "react-native";
import { useApi } from "../../lib/api";
import { useRouter } from "expo-router";

type Category = { id: string; name: string };

export default function Categories() {
  const { authedFetch } = useApi();
  const router = useRouter();

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["categories"],
    queryFn: () => authedFetch<Category[]>("/categories", { method: "GET" }),
  });

  if (isLoading || isRefetching) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Cargando categorías…</Text>
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

  const categories = data ?? [];

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>Categorías</Text>

      <FlatList
        data={categories}
        keyExtractor={(c) => c.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push({ pathname: "/(tabs)/category/[name]", params: { name: item.name } })}
            style={{ padding: 14, borderWidth: 1, borderRadius: 10 }}
          >
            <Text style={{ fontWeight: "700" }}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
