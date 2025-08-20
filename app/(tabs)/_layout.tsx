// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";
import { useCart } from "../../stores/cart";

function CartIcon({ color, focused }: { color: string; focused: boolean }) {
  const { items } = useCart();
  const count = items.reduce((acc, it) => acc + (it.quantity ?? 0), 0);

  return (
    <View style={{ width: 26, height: 26, justifyContent: "center", alignItems: "center" }}>
      <Ionicons name={focused ? "cart" : "cart-outline"} size={22} color={color} />
      {count > 0 && (
        <View
          style={{
            position: "absolute",
            top: -2,
            right: -6,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            paddingHorizontal: 4,
            backgroundColor: "#ff3b30",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 10, fontWeight: "700" }}>{count}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,          // puedes volverlo true si lo prefieres
        tabBarActiveTintColor: "#0a84ff",
        tabBarInactiveTintColor: "#8e8e93",
        tabBarHideOnKeyboard: true,
        sceneStyle: { flex: 1 },     // clave: asegura layout flexible
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="products"
        options={{
          title: "Catálogo",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "pricetags" : "pricetags-outline"} size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="categories"
        options={{
          title: "Categorías",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "list" : "list-outline"} size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "Carrito",
          tabBarIcon: ({ color, focused }) => <CartIcon color={color} focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: "Pedidos",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "reader" : "reader-outline"} size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
