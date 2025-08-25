import React from "react";
import { SafeAreaView, StatusBar, View, ViewProps } from "react-native";
import { styles } from "../../../styles/styles";

type Props = ViewProps & { children: React.ReactNode };

export default function BaseScreen({ children, style, ...rest }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.container, style]} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
}
