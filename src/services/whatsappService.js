// src/services/whatsappService.js
// ─────────────────────────────────────────────────────────────────────────────
// Abstrae el envío de mensajes a través de la Meta WhatsApp Cloud API.
// Si en el futuro cambian a Twilio u otro proveedor, solo hay que editar
// este archivo.
// ─────────────────────────────────────────────────────────────────────────────

const axios = require("axios");

const BASE_URL = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`;

const headers = {
  Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
  "Content-Type": "application/json",
};

/**
 * Envía un mensaje de texto simple a un número de WhatsApp.
 * @param {string} to   - Número en formato internacional sin + (ej: 5491112345678)
 * @param {string} text - Texto del mensaje (soporta *negrita* y _cursiva_ de WhatsApp)
 */
async function sendText(to, text) {
  try {
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { body: text, preview_url: false },
    };

    const res = await axios.post(BASE_URL, payload, { headers });
    console.log(`[WA] Mensaje enviado a ${to} | ID: ${res.data?.messages?.[0]?.id}`);
  } catch (err) {
    const detail = err.response?.data?.error?.message || err.message;
    console.error(`[WA] Error enviando a ${to}:`, detail);
  }
}

/**
 * Marca un mensaje como leído (muestra el doble check azul).
 * @param {string} messageId - ID del mensaje entrante a marcar
 */
async function markAsRead(messageId) {
  try {
    await axios.post(
      BASE_URL,
      { messaging_product: "whatsapp", status: "read", message_id: messageId },
      { headers }
    );
  } catch (_) {
    // No crítico, ignoramos el error
  }
}

module.exports = { sendText, markAsRead };
