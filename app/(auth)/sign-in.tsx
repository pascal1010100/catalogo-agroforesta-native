import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useSignIn, useOAuth } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { Link } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  // Email + Password (tu flujo actual)
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Google OAuth
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const [oAuthLoading, setOAuthLoading] = useState(false);

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

  const onGooglePress = async () => {
    try {
      setOAuthLoading(true);
      const redirectUrl = makeRedirectUri({
        // Debe coincidir con tu scheme en app.json
        native: "nutria://oauth-native-callback",
      });

      const { createdSessionId, setActive: setActiveOAuth } = await startOAuthFlow({
        redirectUrl,
      });

      if (createdSessionId) {
        await setActiveOAuth!({ session: createdSessionId });
        // SignedIn → tu RootLayout te manda a /(tabs)
      }
      // Si Clerk requiere verificación extra, te lo indicará en la UI.
    } catch (err: any) {
      Alert.alert("Google", err?.message ?? "No se pudo iniciar sesión con Google.");
    } finally {
      setOAuthLoading(false);
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
        style={{
          marginTop: 12,
          padding: 14,
          borderRadius: 10,
          backgroundColor: submitting ? "#888" : "#0a84ff",
        }}
      >
        <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>
          {submitting ? "Ingresando..." : "Entrar"}
        </Text>
      </TouchableOpacity>

      {/* Separador */}
      <View style={{ height: 1, backgroundColor: "#ddd", marginVertical: 12 }} />

      {/* Botón Google */}
      <TouchableOpacity
        onPress={onGooglePress}
        disabled={oAuthLoading}
        style={{
          padding: 14,
          borderRadius: 10,
          backgroundColor: oAuthLoading ? "#888" : "#111",
        }}
      >
        <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>
          {oAuthLoading ? "Conectando..." : "Continuar con Google"}
        </Text>
      </TouchableOpacity>

      {/* Link a registro */}
      <View style={{ alignItems: "center", marginTop: 10 }}>
        <Text>
          ¿No tienes cuenta?{" "}
          <Link href="/(auth)/sign-up" style={{ color: "#0a84ff", fontWeight: "600" }}>
            Regístrate
          </Link>
        </Text>
      </View>
    </View>
  );
}
