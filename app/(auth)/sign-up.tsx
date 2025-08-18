import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useSignIn } from "@clerk/clerk-expo";

export default function SignInScreen() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSignIn = async () => {
    if (!isLoaded) return;
    if (!email || !password) return Alert.alert("Faltan datos", "Ingresa email y contraseña.");
    try {
      setSubmitting(true);
      const res = await signIn.create({ identifier: email.trim(), password });
      if (res.createdSessionId) await setActive!({ session: res.createdSessionId });
    } catch (err: any) {
      Alert.alert("Error", err?.errors?.[0]?.message ?? "Credenciales inválidas.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Iniciar sesión</Text>

      <Text>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="tu@email.com"
        style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}
      />

      <Text>Contraseña</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="********"
        secureTextEntry
        style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}
      />

      <TouchableOpacity
        onPress={onSignIn}
        disabled={submitting}
        style={{ marginTop: 12, padding: 14, borderRadius: 10, backgroundColor: submitting ? "#888" : "#0a84ff" }}
      >
        <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>
          {submitting ? "Ingresando..." : "Entrar"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
