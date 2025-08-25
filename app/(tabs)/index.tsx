// app/(tabs)/index.tsx
import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  SafeAreaView,
  Keyboard,
  ImageSourcePropType,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useApi } from "../../lib/api";
import { useCart } from "../../stores/cart";
import SearchBar from "../components/SearchBar";
import Chip from "../components/ui/Chip";
import Fab from "../components/ui/Fab";
import CategoryCard from "../components/ui/CategoryCard";
import { styles } from "../../styles/styles";

type Category = {
  slug: "maquinaria" | "fertilizantes" | "herramientas" | "frutas" | "verduras" | "semillas";
  title: string;
  desc: string;
  emoji: string;
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

  // Demo robusto
  const addDemo = () => {
    const i1 = { id: "demo-1", title: "Producto demo 1", price_cents: 1500, quantity: 1, image_url: "" } as any;
    const i2 = { id: "demo-2", title: "Producto demo 2", price_cents: 2300, quantity: 1, image_url: "" } as any;
    const i3 = { id: "demo-3", title: "Producto demo 3", price_cents: 900,  quantity: 1, image_url: "" } as any;
    add(i1); add(i2); add(i3);
  };

  const renderCategory = ({ item }: { item: Category }) => {
    const src = ICONS[item.slug];
    return (
      <CategoryCard
        title={item.title}
        desc={item.desc}
        src={src}
        emoji={item.emoji}
        onPress={() => router.push({ pathname: "/categories", params: { c: item.slug } })}
      />
    );
  };

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

        {/* Search */}
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
          <Chip label={`Checkout (${totalItems})`} onPress={goCheckout} />
          <Chip label="Pedidos" onPress={goOrders} />
          <Chip label="Perfil" onPress={goProfile} />
          <Chip label="Agregar demo" onPress={addDemo} />
        </View>

        {/* Categorías */}
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
        <Fab onPress={goCart} count={totalItems} />

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
