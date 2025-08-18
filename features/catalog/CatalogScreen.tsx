// features/catalog/CatalogScreen.tsx
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { Link } from "expo-router";

export type Product = {
  id: string;
  name: string;
  price_cents: number;
  imageUrl: string;
  category?: string;
  description?: string;
};

// MOCK de productos (puedes moverlo a otro archivo si prefieres)
export const products: Product[] = [
  {
    id: "1",
    name: "Motoguadaña Brudden",
    price_cents: 250000,
    imageUrl:
      "https://images.unsplash.com/photo-1606813902750-3f3b0b56fbd2?q=80&w=1200&auto=format",
    category: "Herramientas",
    description: "Potente y ligera para maleza densa.",
  },
  {
    id: "2",
    name: "Fungicida Orgánico",
    price_cents: 12000,
    imageUrl:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format",
    category: "Insumos",
    description: "Control preventivo de hongos, apto agroecológico.",
  },
  {
    id: "3",
    name: "Bomba de mochila 20L",
    price_cents: 38000,
    imageUrl:
      "https://images.unsplash.com/photo-1586201375665-9d7855b86f07?q=80&w=1200&auto=format",
    category: "Herramientas",
    description: "Lanza regulable y correas acolchadas.",
  },
];

export default function CatalogScreen() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
        Catálogo
      </Text>

      <FlatList
        data={products}
        keyExtractor={(p) => p.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <Link href={`/product/${item.id}`} asChild>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                gap: 12,
                alignItems: "center",
                padding: 8,
                borderWidth: 1,
                borderRadius: 12,
              }}
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: 76, height: 76, borderRadius: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "600" }}>{item.name}</Text>
                <Text>Q {(item.price_cents / 100).toFixed(2)}</Text>
              </View>
              <Text style={{ opacity: 0.6 }}>Ver</Text>
            </TouchableOpacity>
          </Link>
        )}
      />
    </View>
  );
}
