import React from "react";
import { Image, ImageSourcePropType, Pressable, Text } from "react-native";
import { styles } from "../../../styles/styles";

type Props = {
  title: string;
  desc: string;
  onPress: () => void;
  src?: ImageSourcePropType;   // PNG opcional
  emoji?: string;              // fallback si no hay PNG
};

export default function CategoryCard({ title, desc, onPress, src, emoji = "🧩" }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      {src ? (
        <Image source={src} style={styles.cardImg} resizeMode="contain" />
      ) : (
        <Text style={styles.cardIcon} accessibilityLabel={`${title} icono`}>{emoji}</Text>
      )}
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDesc}>{desc}</Text>
    </Pressable>
  );
}
