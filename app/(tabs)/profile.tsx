// app/(tabs)/profile.tsx
import React from "react";
import { View, Text, Alert, ActivityIndicator, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { useUser, useAuth } from "@clerk/clerk-expo";

import BaseScreen from "../components/layout/BaseScreen";
import SectionTitle from "../components/ui/SectionTitle";
import { styles } from "../../styles/styles";
import { useCart } from "../../stores/cart";

export default function Profile() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut, getToken } = useAuth();
  const { clear } = useCart();

  if (!isLoaded) {
    return (
      <BaseScreen>
        <SectionTitle>Perfil</SectionTitle>
        <View style={styles.card}>
          <ActivityIndicator />
          <Text style={[styles.cardDesc, { marginTop: 8 }]}>Cargando perfil…</Text>
        </View>
      </BaseScreen>
    );
  }

  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    "—";

  const onSignOut = async () => {
    try {
      await signOut();
      clear();
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
    <BaseScreen>
      <SectionTitle>Perfil</SectionTitle>

      {/* Tarjeta principal con avatar */}
      <View style={[styles.card, { alignItems: "center" }]}>
        <Image
          source={{ uri: user?.imageUrl ?? "https://i.pravatar.cc/200" }}
          style={{ width: 84, height: 84, borderRadius: 42, marginBottom: 10 }}
        />
        <Text style={[styles.cardTitle, { textAlign: "center" }]}>
          {user?.fullName ?? "—"}
        </Text>
        <Text style={[styles.cardDesc, { textAlign: "center" }]}>{email}</Text>
      </View>

      {/* Sección de información */}
      <View style={styles.card}>
        <Row label="ID de usuario" value={user?.id ?? "—"} />
        <Divider />
        <Row label="Estado de sesión" value="Activa" />
      </View>

      {/* Acciones rápidas */}
      <View style={[styles.card, { paddingTop: 6, paddingBottom: 6 }]}>
        <ActionRow
          label="Ver token (preview)"
          emoji="🔑"
          onPress={showTokenPreview}
        />
        <Divider />
        <ActionRow
          label="Editar perfil"
          emoji="✏️"
          onPress={() => router.push("/profile")}
        />
      </View>

      {/* Botones principales */}
      <View style={{ marginTop: 10 }}>
        <Pressable
          onPress={() => router.push("/orders")}
          style={({ pressed }) => [
            styles.chip,
            pressed && styles.chipPressed,
            {
              justifyContent: "center",
              backgroundColor: "#2e7d32",
              borderColor: "#2e7d32",
              paddingVertical: 12,
            },
          ]}
          accessibilityRole="button"
        >
          <Text style={[styles.chipText, { color: "#fff", textAlign: "center" }]}>
            Ver mis pedidos
          </Text>
        </Pressable>

        <Pressable
          onPress={onSignOut}
          style={({ pressed }) => [
            styles.chip,
            pressed && styles.chipPressed,
            {
              justifyContent: "center",
              backgroundColor: "#d32f2f",
              borderColor: "#d32f2f",
              paddingVertical: 12,
              marginTop: 10,
            },
          ]}
          accessibilityRole="button"
        >
          <Text style={[styles.chipText, { color: "#fff", textAlign: "center" }]}>
            Cerrar sesión
          </Text>
        </Pressable>
      </View>
    </BaseScreen>
  );
}

/* ---------- UI helpers (locales al archivo) ---------- */

function Divider() {
  return <View style={{ height: 1, backgroundColor: "#dfeee6", marginVertical: 8 }} />;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 2 }}>
      <Text style={[styles.cardDesc, { fontWeight: "700", color: "#1f2d22" }]}>{label}</Text>
      <Text style={styles.cardDesc}>{value}</Text>
    </View>
  );
}

function ActionRow({
  label,
  emoji,
  onPress,
}: {
  label: string;
  emoji: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
        pressed && { opacity: 0.75 },
      ]}
    >
      <Text style={{ fontSize: 18, marginRight: 8 }}>{emoji}</Text>
      <Text style={[styles.cardTitle, { fontSize: 14, marginBottom: 0, flex: 1 }]}>{label}</Text>
      <Text style={{ fontSize: 16, color: "#5c7e6c" }}>›</Text>
    </Pressable>
  );
}
