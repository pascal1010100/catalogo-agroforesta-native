// app/(tabs)/categories.tsx
import React from "react";
import { FlatList, ImageSourcePropType } from "react-native";
import { useRouter } from "expo-router";

import BaseScreen from "../components/layout/BaseScreen";
import SectionTitle from "../components/ui/SectionTitle";
import CategoryCard from "../components/ui/CategoryCard";
import { styles } from "../../styles/styles";

type Category = {
  slug: "maquinaria" | "fertilizantes" | "herramientas" | "frutas" | "verduras" | "semillas";
  title: string;
  desc: string;
  emoji: string;
};

// PNGs en: assets/icons/categorias/*.png
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

export default function CategoriesScreen() {
  const router = useRouter();

  return (
    <BaseScreen>
      <SectionTitle>Categorías</SectionTitle>

      <FlatList
        data={CATEGORIES}
        keyExtractor={(it) => it.slug}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        renderItem={({ item }) => (
          <CategoryCard
            title={item.title}
            desc={item.desc}
            src={ICONS[item.slug]}
            emoji={item.emoji}
            onPress={() =>
              router.push({ pathname: "/categories", params: { c: item.slug } })
            }
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </BaseScreen>
  );
}
