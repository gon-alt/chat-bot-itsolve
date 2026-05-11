// src/routes/webhook.js
// ─────────────────────────────────────────────────────────────────────────────
// Maneja los dos endpoints que requiere la Meta WhatsApp Cloud API:
//   GET  /webhook  → verificación del webhook (solo la primera vez)
//   POST /webhook  → mensajes entrantes en tiempo real
// ─────────────────────────────────────────────────────────────────────────────

const express = require("express");
const router = express.Router();
const { sendText, markAsRead } = require("../services/whatsappService");
const { handleMessage } = require("../services/botService");

// ── GET /webhook — Verificación de Meta ──────────────────────────────────────
// Meta llama a este endpoint la primera vez que configurás el webhook.
// Devuelve el hub.challenge si el token coincide con VERIFY_TOKEN.
router.get("/", (req, res) => {
  const mode      = req.query["hub.mode"];
  const token     = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    console.log("[Webhook] Verificación exitosa ✅");
    return res.status(200).send(challenge);
  }

  console.warn("[Webhook] Verificación fallida ❌ — token incorrecto");
  res.sendStatus(403);
});

// ── POST /webhook — Mensajes entrantes ───────────────────────────────────────
router.post("/", async (req, res) => {
  // Responder 200 inmediatamente para que Meta no reintente el envío
  res.sendStatus(200);

  try {
    const body = req.body;

    // Validar que es un evento de WhatsApp
    if (body.object !== "whatsapp_business_account") return;

    const entry   = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value   = changes?.value;

    // Ignorar notificaciones de estado (mensajes enviados/leídos)
    if (value?.statuses) return;

    const messages = value?.messages;
    if (!messages?.length) return;

    const message = messages[0];

    // Solo procesamos mensajes de texto por ahora
    if (message.type !== "text") {
      await sendText(message.from, "🤖 Por ahora solo proceso mensajes de texto.\nEscribí *hola* para ver el menú.");
      return;
    }

    const phone = message.from;  // ej: "5491112345678"
    const text  = message.text.body;

    console.log(`[Webhook] Mensaje de ${phone}: "${text}"`);

    // Marcar como leído (doble check azul)
    await markAsRead(message.id);

    // Procesar con el bot y enviar respuestas
    const replies = await handleMessage(phone, text);
    for (const reply of replies) {
      await sendText(phone, reply);
    }

  } catch (err) {
    console.error("[Webhook] Error procesando mensaje:", err);
  }
});

// ── POST /chatwoot-webhook — Respuestas del asesor desde Chatwoot ─────────────
router.post("/chatwoot", async (req, res) => {
  res.sendStatus(200);
  try {
    const body = req.body;

    // Solo procesar mensajes salientes del asesor (no del bot)
    if (body.message_type !== "outgoing") return;
    if (body.conversation?.meta?.sender?.type === "agent_bot") return;

    const content = body.content;
    const phone = body.conversation?.meta?.sender?.phone_number?.replace("+", "");

    if (!phone || !content) return;

    console.log(`[Chatwoot] Asesor → ${phone}: "${content}"`);
    await sendText(phone, content);
  } catch (err) {
    console.error("[Chatwoot] Error procesando respuesta:", err);
  }
});

module.exports = router;
