import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { styles } from "../../../styles/styles";

type Props = {
  title: string;
  priceQ: string;
  desc?: string;
  imageUrl?: string;
  onAdd: () => void;
  onDetail: () => void;
};

export default function ProductCard({
  title,
  priceQ,
  desc,
  imageUrl,
  onAdd,
  onDetail,
}: Props) {
  return (
    <View style={styles.card}>
      {/* Imagen (opcional) */}
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: "100%", height: 140, borderRadius: 12, marginBottom: 10 }}
          resizeMode="cover"
        />
      ) : null}

      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDesc}>{priceQ}</Text>
      {!!desc && <Text style={[styles.cardDesc, { marginTop: 4 }]}>{desc}</Text>}

      {/* Acciones */}
      <View style={[styles.quickRow, { marginTop: 10 }]}>
        <Pressable
          onPress={onAdd}
          style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
        >
          <Text style={styles.chipText}>Agregar</Text>
        </Pressable>

        <Pressable
          onPress={onDetail}
          style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
        >
          <Text style={styles.chipText}>Ver detalle</Text>
        </Pressable>
      </View>
    </View>
  );
}
