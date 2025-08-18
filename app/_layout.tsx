// app/_layout.tsx
import { Slot, Redirect } from "expo-router";
import {
  ClerkProvider,
  ClerkLoaded,
  ClerkLoading, // 👈 IMPORTA ESTO
  SignedIn,
  SignedOut,
} from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { makeRedirectUri } from "expo-auth-session";
import { CartProvider } from "../context/CartContext";

// Cache de token
const tokenCache = {
  getToken: (key: string) => SecureStore.getItemAsync(key),
  saveToken: (key: string, value: string) => SecureStore.setItemAsync(key, value),
};

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const clerkKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!clerkKey) {
    console.warn("Falta EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY en .env");
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // Usa tu scheme (nutria) y la ruta estándar
  const redirectUrl = makeRedirectUri({
    scheme: process.env.APP_SCHEME,
    path: "oauth-native-callback",
  });

  return (
    <ClerkProvider
      publishableKey={clerkKey}
      tokenCache={tokenCache}
      signInFallbackRedirectUrl={redirectUrl}
    >
      {/* Mientras carga Clerk */}
      <ClerkLoading>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      </ClerkLoading>

      {/* App cargada */}
      <ClerkLoaded>
        <QueryClientProvider client={queryClient}>
          <CartProvider>
            <SignedOut>
              <Redirect href="/(auth)/sign-in" />
            </SignedOut>

            <SignedIn>
              <Redirect href="/(tabs)" />
            </SignedIn>

            <Slot />
          </CartProvider>
        </QueryClientProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
