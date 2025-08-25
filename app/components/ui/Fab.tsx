import React from "react";
import { Pressable, Text, View } from "react-native";
import { styles } from "../../../styles/styles";

type Props = { onPress: () => void; count?: number };

export default function Fab({ onPress, count = 0 }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.fab} accessibilityRole="button" hitSlop={8}>
      <Text style={styles.fabIcon}>🛒</Text>
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
    </Pressable>
  );
}
