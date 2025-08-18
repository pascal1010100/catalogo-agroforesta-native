// context/CartContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type CartItem = {
  id: string;
  name: string;
  price: number | string; // puede venir "Q2,500" o 19.9
  qty: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  count: number;
  totalItems: number;
  hydrated: boolean; // indica si cargamos desde disco
};

const CartContext = createContext<CartContextType | null>(null);

// Clave de almacenamiento
const STORAGE_KEY = "@cart:v1";

export const CartProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Cargar carrito desde AsyncStorage al montar ---
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) {
          const parsed = JSON.parse(raw) as CartItem[];
          if (Array.isArray(parsed)) setCart(parsed);
        }
      } catch {
        // ignoramos errores de parseo
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // --- Guardar carrito (debounce) cuando cambie ---
  useEffect(() => {
    if (!hydrated) return; // evita sobreescribir con [] antes de cargar

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cart)).catch(() => {});
    }, 200); // pequeño debounce para evitar escrituras constantes

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [cart, hydrated]);

  const addToCart: CartContextType["addToCart"] = (item) => {
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.id === item.id);
      if (idx === -1) return [...prev, { ...item, qty: Math.max(1, item.qty || 1) }];
      const copy = [...prev];
      copy[idx] = { ...copy[idx], qty: copy[idx].qty + Math.max(1, item.qty || 1) };
      return copy;
    });
  };

  const removeFromCart: CartContextType["removeFromCart"] = (id) => {
    setCart((prev) => prev.filter((x) => x.id !== id));
  };

  const updateQty: CartContextType["updateQty"] = (id, qty) => {
    setCart((prev) => prev.map((x) => (x.id === id ? { ...x, qty: Math.max(0, Math.floor(qty)) } : x)));
  };

  const clearCart = () => setCart([]);

  const { count, totalItems } = useMemo(() => {
    const totalItems = cart.reduce((sum, it) => sum + (it.qty || 0), 0);
    return { count: cart.length, totalItems };
  }, [cart]);

  const value = useMemo<CartContextType>(
    () => ({ cart, addToCart, removeFromCart, updateQty, clearCart, count, totalItems, hydrated }),
    [cart, count, totalItems, hydrated]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
