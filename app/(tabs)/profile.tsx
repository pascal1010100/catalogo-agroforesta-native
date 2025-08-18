// app/(tabs)/profile.tsx
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useCart } from "../../stores/cart";

export default function Profile() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut, getToken } = useAuth();
  const { clear } = useCart();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Cargando perfil…</Text>
      </View>
    );
  }

  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    "—";

  const onSignOut = async () => {
    try {
      await signOut();
      clear(); // limpia el carrito al cerrar sesión
      router.replace("/(auth)/sign-in");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo cerrar sesión");
    }
  };

  const showTokenPreview = async () => {
    try {
      const t = await getToken();
      Alert.alert("Token (preview)", t ? `${t.slice(0, 24)}…` : "(sin token)");
    } catch {
      Alert.alert("Token", "(no disponible)");
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "800" }}>Perfil</Text>

      <View style={{ padding: 14, borderWidth: 1, borderRadius: 10, gap: 6 }}>
        <Text style={{ fontSize: 16 }}>
          Nombre: <Text style={{ fontWeight: "700" }}>{user?.fullName ?? "—"}</Text>
        </Text>
        <Text style={{ fontSize: 16 }}>
          Email: <Text style={{ fontWeight: "700" }}>{email}</Text>
        </Text>
        <Text style={{ fontSize: 12, color: "#666" }}>
          User ID: {user?.id ?? "—"}
        </Text>
      </View>

      <TouchableOpacity
        onPress={showTokenPreview}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}
      >
        <Text style={{ textAlign: "center" }}>Ver token (preview)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onSignOut}
        style={{ padding: 14, borderRadius: 10, backgroundColor: "#ff3b30" }}
      >
        <Text style={{ textAlign: "center", color: "white", fontWeight: "700" }}>
          Cerrar sesión
        </Text>
      </TouchableOpacity>
    </View>
  );
}
