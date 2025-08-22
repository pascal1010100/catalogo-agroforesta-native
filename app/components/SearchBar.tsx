// app/components/SearchBar.tsx
import React, { forwardRef } from "react";
import {
  View,
  TextInput,
  Pressable,
  Text,
  StyleSheet,
  TextInput as RNTextInput,
} from "react-native";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder?: string;
};

const SearchBar = forwardRef<RNTextInput, Props>(
  ({ value, onChangeText, onSubmit, placeholder = "Buscar productos…" }, ref) => {
    return (
      <View style={styles.searchBox}>
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor="#7ba28e"
          returnKeyType="search"
          style={styles.searchInput}
        />
        <Pressable onPress={onSubmit} style={styles.searchBtn} accessibilityRole="button">
          <Text style={styles.searchBtnText}>Buscar</Text>
        </Pressable>
      </View>
    );
  }
);

export default SearchBar;

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#cfe6d7",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  searchInput: { flex: 1, color: "#173626", paddingVertical: 8, fontSize: 16 },
  searchBtn: {
    backgroundColor: "#2e7d32",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  searchBtnText: { color: "white", fontWeight: "700" },
});
