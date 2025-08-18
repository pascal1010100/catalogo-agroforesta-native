// stores/cart.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type CartItem = {
  id: string;
  name: string;
  price_cents: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  setQuantity: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  totalCents: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        const exists = get().items.find((i) => i.id === item.id);
        if (exists) {
          set({
            items: get().items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },
      setQuantity: (id, qty) =>
        set({
          items: get().items
            .map((i) => (i.id === id ? { ...i, quantity: qty } : i))
            .filter((i) => i.quantity > 0),
        }),
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      clear: () => set({ items: [] }),
      totalCents: () =>
        get().items.reduce((sum, i) => sum + i.price_cents * i.quantity, 0),
    }),
    {
      name: "cart-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items }), // solo persiste los items
    }
  )
);
