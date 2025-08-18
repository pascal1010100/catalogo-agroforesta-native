// lib/api.ts
import { useAuth } from "@clerk/clerk-expo";

/** ===== Tipos ===== */
export type Product = {
  id: string;
  name: string;
  category: string;
  price: number; // en unidades (Q), lo devuelve tu API de demo
  unit: string;
  imageUrl: string;
  description: string;
};

export type OrderItem = {
  id: string;
  name: string;
  price_cents: number; // entero en centavos
  quantity: number;    // entero
};

export type OrderCreatePayload = {
  items: OrderItem[];
  customer?: { name?: string; phone?: string };
};

export type OrderCreateResponse = {
  ok: true;
  orderId: string;
  createdAt: string;
};

/** ===== Utils seguras ===== */
export function toCents(price: number | string): number {
  if (typeof price === "number") return Math.round(price * 100);
  // Limpia símbolos de moneda y separadores (Q, $, comas, espacios)
  const clean = price.replace(/[^\d.,-]/g, "");
  // Si tiene coma y punto, asumimos coma como miles y punto como decimal -> quitamos comas.
  const normalized = clean.includes(".")
    ? clean.replace(/,/g, "")
    : clean.replace(/\./g, "").replace(",", "."); // si solo hay coma, úsala como decimal
  const num = parseFloat(normalized);
  if (Number.isNaN(num)) return 0;
  return Math.round(num * 100);
}

/** Mapea items del carrito del cliente { id, name, price, qty } a { price_cents, quantity } */
export function mapCartToOrderItems(
  cart: Array<{ id: string; name: string; price: number | string; qty: number }>
): OrderItem[] {
  return cart.map((it) => ({
    id: it.id,
    name: it.name,
    price_cents: toCents(it.price),
    quantity: Math.max(0, Math.floor(it.qty || 0)),
  }));
}

/** ===== Hook principal ===== */
export function useApi(baseUrl = process.env.EXPO_PUBLIC_API_URL!) {
  const { getToken } = useAuth();
  const BASE = (baseUrl ?? "").replace(/\/$/, ""); // sin slash final

  /** Fetch con (opcional) auth obligatoria */
  const authedFetch = async <T = any>(
    path: string,
    init: RequestInit = {},
    opts?: { requireAuth?: boolean }
  ): Promise<T> => {
    const url = `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
    const headers = new Headers(init.headers || {});
    headers.set("Accept", "application/json");

    let token: string | null = null;
    try {
      token = await getToken();
    } catch {
      token = null;
    }

    if (opts?.requireAuth && !token) {
      throw new Error("No hay sesión: inicia sesión para continuar.");
    }
    if (token) headers.set("Authorization", `Bearer ${token}`);

    // Sólo setear Content-Type si hay body
    const hasBody = init.body !== undefined && init.body !== null;
    if (hasBody && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const res = await fetch(url, { ...init, headers });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`${init.method || "GET"} ${path} ${res.status}: ${text || res.statusText}`);
    }
    // 204 no content
    if (res.status === 204) return undefined as T;

    return (await res.json()) as T;
  };

  /** ===== Endpoints ===== */

  // Público
  const health = async () => {
    const res = await fetch(`${BASE}/health`, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`GET /health ${res.status}: ${text || res.statusText}`);
    }
    return (await res.json()) as { ok: boolean; [k: string]: any };
  };

  // Protegidos
  const products = () =>
    authedFetch<Product[]>("/products", { method: "GET" }, { requireAuth: true });

  const product = (id: string) =>
    authedFetch<Product>(`/products/${id}`, { method: "GET" }, { requireAuth: true });

  const categories = () =>
    authedFetch<{ id: string; name: string }[]>(
      "/categories",
      { method: "GET" },
      { requireAuth: true }
    );

  const orders = () =>
    authedFetch<any[]>("/orders", { method: "GET" }, { requireAuth: true });

  const createOrder = (payload: OrderCreatePayload) =>
    authedFetch<OrderCreateResponse>(
      "/orders",
      { method: "POST", body: JSON.stringify(payload) },
      { requireAuth: true }
    );

  return {
    // bajo nivel
    authedFetch,
    // utils
    toCents,
    mapCartToOrderItems,
    // endpoints
    health,
    products,
    product,
    categories,
    orders,
    createOrder,
  };
}
