// index.js
// ─────────────────────────────────────────────────────────────────────────────
// Punto de entrada del servidor. Levanta Express y registra las rutas.
// ─────────────────────────────────────────────────────────────────────────────

require("dotenv").config();
const express = require("express");
const webhookRouter = require("./src/routes/webhook");

const app  = express();
const PORT = process.env.PORT || 3000;

// Parsear JSON (requerido por Meta)
app.use(express.json());

// Ruta principal del webhook
app.use("/webhook", webhookRouter);

// Health check — útil para saber si el servidor está vivo
app.get("/", (req, res) => res.json({ status: "ok", bot: "WhatsApp Bot", time: new Date().toISOString() }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🤖 Bot de WhatsApp corriendo en http://localhost:${PORT}`);
  console.log(`📡 Webhook URL: http://localhost:${PORT}/webhook\n`);
});
