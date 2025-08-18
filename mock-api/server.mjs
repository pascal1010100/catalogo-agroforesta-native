// mock-api/server.mjs
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Tu app llamará GET /api/orders -> respondemos datos de ejemplo
app.get("/api/orders", (req, res) => {
  res.json([
    { id: 101, status: "paid", total: 120.5, createdAt: new Date().toISOString() },
    { id: 102, status: "processing", total: 75.0, createdAt: new Date().toISOString() },
  ]);
});

// IMPORTANTE: escuchar en 0.0.0.0 para que el simulador acceda por IP
app.listen(3000, "0.0.0.0", () => {
  console.log("Mock API running on http://192.168.1.24:3000");
});
