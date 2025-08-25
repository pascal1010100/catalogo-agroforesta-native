import React from "react";
import { View, Text, ViewProps } from "react-native";
import { styles } from "../../../styles/styles";

type Props = ViewProps & { children: React.ReactNode };

export default function SectionTitle({ children, style, ...rest }: Props) {
  return (
    <View style={[styles.sectionHead, style]} {...rest}>
      <Text style={styles.sectionTitle}>{children}</Text>
    </View>
  );
}
