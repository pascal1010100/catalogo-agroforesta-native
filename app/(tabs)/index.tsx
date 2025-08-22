// app/(tabs)/index.tsx
import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  SafeAreaView,
  Keyboard,
  Image,
  ImageSourcePropType,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useApi } from "../../lib/api";
import { useCart } from "../../stores/cart";
import SearchBar from "../components/SearchBar";

type Category = {
  slug: "maquinaria" | "fertilizantes" | "herramientas" | "frutas" | "verduras" | "semillas";
  title: string;
  desc: string;
  emoji: string; // fallback si no existe PNG
};

// Coloca estos PNG en: assets/icons/categorias/*.png
const ICONS: Record<Category["slug"], ImageSourcePropType> = {
  maquinaria: require("../../assets/icons/categorias/maquinaria.png"),
  fertilizantes: require("../../assets/icons/categorias/fertilizantes.png"),
  herramientas: require("../../assets/icons/categorias/herramientas.png"),
  frutas: require("../../assets/icons/categorias/frutas.png"),
  verduras: require("../../assets/icons/categorias/verduras.png"),
  semillas: require("../../assets/icons/categorias/semillas.png"),
};

const CATEGORIES: Category[] = [
  { slug: "maquinaria", title: "Maquinaria", desc: "Agrícola de última generación.", emoji: "🚜" },
  { slug: "fertilizantes", title: "Fertilizantes", desc: "Para todo tipo de cultivos.", emoji: "🧪" },
  { slug: "herramientas", title: "Herramientas", desc: "Resistentes y confiables.", emoji: "🛠️" },
  { slug: "frutas", title: "Frutas", desc: "Frescas y de temporada.", emoji: "🍎" },
  { slug: "verduras", title: "Verduras", desc: "Orgánicas y saludables.", emoji: "🥦" },
  { slug: "semillas", title: "Semillas", desc: "Certificadas para siembra.", emoji: "🌱" },
];

export default function Home() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { health } = useApi();

  const { items, add } = useCart();
  const totalItems = useMemo(
    () => (items ?? []).reduce((acc, it) => acc + (it.quantity ?? 0), 0),
    [items]
  );

  const [query, setQuery] = useState("");
  const inputRef = useRef<TextInput>(null);

  const goSearch = () => {
    const q = query.trim();
    if (!q) return router.push("/products");
    Keyboard.dismiss();
    router.push({ pathname: "/products", params: { q } });
  };

  const goCheckout = () => router.push("/checkout");
  const goOrders = () => router.push("/orders");
  const goProfile = () => router.push("/profile");
  const goCart = () => router.push("/cart");

  // Demo robusto (casteo para evitar choques de tipos del store)
  const addDemo = () => {
    const i1 = { id: "demo-1", title: "Producto demo 1", price_cents: 1500, quantity: 1, image_url: "" } as any;
    const i2 = { id: "demo-2", title: "Producto demo 2", price_cents: 2300, quantity: 1, image_url: "" } as any;
    const i3 = { id: "demo-3", title: "Producto demo 3", price_cents: 900,  quantity: 1, image_url: "" } as any;
    add(i1); add(i2); add(i3);
  };

  const renderCategory = ({ item }: { item: Category }) => {
    const src = ICONS[item.slug];
    return (
      <Pressable
        onPress={() => router.push({ pathname: "/categories", params: { c: item.slug } })}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        {src ? (
          <Image source={src} style={styles.cardImg} resizeMode="contain" />
        ) : (
          <Text style={styles.cardIcon} accessibilityLabel={`${item.title} icono`}>{item.emoji}</Text>
        )}
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc}>{item.desc}</Text>
      </Pressable>
    );
  };

  // Verificación segura de health.ok
  const apiDisconnected =
    health &&
    typeof health === "object" &&
    "ok" in (health as Record<string, unknown>) &&
    (health as { ok?: boolean }).ok === false;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brand}>
            <Text style={styles.brandLeaf}>🟢</Text> Agroforesta
          </Text>
          <View style={styles.sessionPill}>
            <Text style={styles.sessionText}>{isLoaded ? (isSignedIn ? "Sesión" : "Invitado") : "…"}</Text>
          </View>
        </View>

        {/* Search (componente) */}
        <SearchBar
          ref={inputRef}
          value={query}
          onChangeText={setQuery}
          onSubmit={goSearch}
        />

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.title}>Catálogo Nativo</Text>
          <Text style={styles.subtitle}>Explora por categorías o busca productos.</Text>
        </View>

        {/* Acciones rápidas */}
        <View style={styles.quickRow}>
          <QuickChip label={`Checkout (${totalItems})`} onPress={goCheckout} />
          <QuickChip label="Pedidos" onPress={goOrders} />
          <QuickChip label="Perfil" onPress={goProfile} />
          <QuickChip label="Agregar demo" onPress={addDemo} />
        </View>

        {/* Grid de categorías */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Nuestras categorías</Text>
        </View>
        <FlatList
          data={CATEGORIES}
          keyExtractor={(it) => it.slug}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          renderItem={renderCategory}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        />

        {/* FAB carrito */}
        <Pressable onPress={goCart} style={styles.fab} accessibilityRole="button">
          <Text style={styles.fabIcon}>🛒</Text>
          {totalItems > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
          )}
        </Pressable>

        {/* Aviso API */}
        {apiDisconnected && (
          <View style={styles.apiWarn}>
            <Text style={styles.apiWarnText}>API desconectada</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function QuickChip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}>
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

// 🎨 Paleta clara (similar al sitio)
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f2f6f3" },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  brand: { color: "#1e2e24", fontSize: 20, fontWeight: "700" },
  brandLeaf: { marginRight: 6, fontSize: 16 },
  sessionPill: {
    backgroundColor: "#e6f4ea",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  sessionText: { color: "#2e7d32", fontWeight: "700", fontSize: 12 },

  // 🔻 Estilos de búsqueda fueron movidos al componente SearchBar

  hero: { marginTop: 14, marginBottom: 12 },
  title: { color: "#1f2d22", fontSize: 22, fontWeight: "800" },
  subtitle: { color: "#567a68", marginTop: 4, fontSize: 13 },

  quickRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8, marginBottom: 12 },
  chip: {
    backgroundColor: "#eef7f1",
    borderColor: "#cfe6d7",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipPressed: { opacity: 0.8 },
  chipText: { color: "#1f4c37", fontWeight: "700", fontSize: 12 },

  sectionHead: { marginTop: 6, marginBottom: 6 },
  sectionTitle: { color: "#1f4c37", fontSize: 16, fontWeight: "800" },

  gridContent: { paddingBottom: 120 },
  gridRow: { gap: 12 },
  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderColor: "#dfeee6",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    minHeight: 130,
    justifyContent: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: { opacity: 0.95 },
  cardImg: { width: 56, height: 56, marginBottom: 8, alignSelf: "flex-start" },
  cardIcon: { fontSize: 28, marginBottom: 8 }, // fallback emoji
  cardTitle: { color: "#1f2d22", fontWeight: "800", fontSize: 16, marginBottom: 4 },
  cardDesc: { color: "#5c7e6c", fontSize: 12, lineHeight: 16 },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2e7d32",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: { fontSize: 24, color: "white" },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#2e7d32",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#2e7d32", fontSize: 12, fontWeight: "800" },

  apiWarn: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 96,
    backgroundColor: "#fdeaea",
    borderColor: "#f7b4b4",
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  apiWarnText: { color: "#7a2f2f", textAlign: "center", fontWeight: "700" },
});
