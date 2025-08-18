// real-api/server.mjs
import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createLocalJWKSet, jwtVerify, decodeJwt } from "jose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Config ---
const PORT = Number(process.env.PORT || 3001);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

// --- Carga JWKS local (exportado desde Clerk) ---
const jwksPath = path.join(__dirname, "jwks.json");
const jwks = JSON.parse(fs.readFileSync(jwksPath, "utf-8"));
const JWKS = createLocalJWKSet(jwks);

// --- Middleware: verifica Bearer JWT con JWKS local e issuer del token ---
async function verifyClerkJWT(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthenticated", detail: "Missing Bearer token" });
    }
    const token = authHeader.slice(7);
    const decoded = decodeJwt(token);
    const issuerFromToken = decoded.iss;
    if (!issuerFromToken) {
      return res.status(401).json({ error: "Unauthenticated", detail: "Token without iss claim" });
    }
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: issuerFromToken,
      algorithms: ["RS256"],
    });
    req.auth = { userId: payload.sub, payload };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthenticated", detail: String(err?.message || err) });
  }
}

// --- Salud pública ---
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// --------- “Base de datos” en memoria ---------
const ordersDb = []; // { id, status, total_cents, createdAt, userId, items[] }

// --- Listar pedidos del usuario ---
app.get("/api/orders", verifyClerkJWT, (req, res) => {
  const userId = req.auth?.userId ?? null;
  const userOrders = ordersDb.filter((o) => o.userId === userId);
  res.json(userOrders);
});

// --- Crear pedido ---
app.post("/api/orders", verifyClerkJWT, (req, res) => {
  const { items } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Bad Request", detail: "items must be a non-empty array" });
  }
  for (const it of items) {
    if (!it?.id || typeof it.name !== "string") {
      return res.status(400).json({ error: "Bad Request", detail: "each item must have id and name" });
    }
    if (typeof it.price_cents !== "number" || typeof it.quantity !== "number") {
      return res.status(400).json({ error: "Bad Request", detail: "price_cents and quantity must be numbers" });
    }
  }

  const total_cents = items.reduce((sum, it) => sum + it.price_cents * it.quantity, 0);
  const order = {
    id: Date.now(), // demo ID
    status: "created",
    total_cents,
    createdAt: new Date().toISOString(),
    userId: req.auth?.userId ?? null,
    items,
  };

  ordersDb.push(order);
  return res.status(201).json(order);
});

// --- Productos (helpers) ---
function getProducts() {
  return [
    {
      id: "p1",
      name: "Cacao en grano",
      category: "Cacao y derivados",
      price: 19.9,
      unit: "kg",
      imageUrl: "https://picsum.photos/seed/cacao/800/600",
      description: "Cacao orgánico seleccionado, ideal para chocolatería artesanal.",
    },
    {
      id: "p2",
      name: "Café orgánico",
      category: "Café",
      price: 14.5,
      unit: "kg",
      imageUrl: "https://picsum.photos/seed/cafe/800/600",
      description: "Arábica de altura, tueste medio, notas a chocolate y caramelo.",
    },
    {
      id: "p3",
      name: "Miel de bosque",
      category: "Miel",
      price: 8.9,
      unit: "frasco",
      imageUrl: "https://picsum.photos/seed/miel/800/600",
      description: "Miel pura multifloral, sin aditivos, cosecha local.",
    },
    {
      id: "p4",
      name: "Aguaymanto",
      category: "Frutas",
      price: 5.5,
      unit: "bandeja",
      imageUrl: "https://picsum.photos/seed/aguaymanto/800/600",
      description: "Fruta fresca rica en antioxidantes, lista para consumo.",
    },
  ];
}

// --- Productos (lista) ---
app.get("/api/products", verifyClerkJWT, (_req, res) => {
  res.json(getProducts());
});

// --- Producto por ID (nuevo) ---
app.get("/api/products/:id", verifyClerkJWT, (req, res) => {
  const prod = getProducts().find((p) => p.id === req.params.id);
  if (!prod) return res.status(404).json({ error: "Not Found", detail: "product not found" });
  res.json(prod);
});

// --- Categorías (derivadas de productos) ---
app.get("/api/categories", verifyClerkJWT, (_req, res) => {
  const unique = [...new Set(getProducts().map((p) => p.category))];
  res.json(unique.map((name) => ({ id: name.toLowerCase(), name })));
});

// --- Error handler global ---
app.use((err, _req, res, _next) => {
  res.status(500).json({ error: "Internal error", detail: String(err?.message || err) });
});

// --- Start ---
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Real API on http://localhost:${PORT}`);
});
