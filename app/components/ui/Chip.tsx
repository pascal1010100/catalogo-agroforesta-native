import React from "react";
import { Pressable, Text, ViewStyle } from "react-native";
import { styles } from "../../../styles/styles";

type Props = {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
};

export default function Chip({ label, onPress, style }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, pressed && styles.chipPressed, style]}>
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}
