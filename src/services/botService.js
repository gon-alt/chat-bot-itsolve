// src/services/botService.js
const { getOrCreateSession, navigateTo, goBack, goHome } = require("./sessionService");
const { saveTicket, saveLead, saveCallRequest, generateTicketId } = require("./sheetsService");
const {
  TRIGGERS, AGENT_TRIGGERS, MAIN_MENU_TEXT,
  MENUS, CLOSING_TEXT, AGENT_TEXT, UNKNOWN_TEXT, BOT_WA_INFO,
} = require("../config/menu");

const { escalateToAgent, sendMessage: sendToChatwoot } = require("./chatwootService");

const BOT_WA_CLOSING = `\n\n─────────────────\n¿Querés que te contactemos para armar una propuesta?\n\n*1* · ✅ Sí, quiero que me contacten\n*2* · ❌ No, gracias`;

async function handleMessage(phone, rawText) {
  const text = rawText.trim().toLowerCase();
  const session = getOrCreateSession(phone);

  // ── COMANDOS GLOBALES ───────────────────────────────────────────────────────
  if (text === "00") {
    goHome(session);
    return [MAIN_MENU_TEXT];
  }

  if (AGENT_TRIGGERS.some((t) => text.includes(t))) {
    goHome(session);
    session.screen = "agent";
    if (!session.chatwootConvId) {
      session.chatwootConvId = await escalateToAgent(phone, `📲 Usuario solicitó hablar con un asesor.\nTeléfono: +${phone}`);
    }
    return [AGENT_TEXT];
  } 

  // TRIGGERS verificados ANTES del bloque agent para que "hola" salga del loop
  if (TRIGGERS.some((t) => text.includes(t))) {
    goHome(session);
    return [MAIN_MENU_TEXT];
  }

  // ── PANTALLA: AGENT ─────────────────────────────────────────────────────────
  if (session.screen === "agent") {
    if (session.chatwootConvId) {
      await sendToChatwoot(session.chatwootConvId, rawText, "incoming");
    }
    return [`👤 Tu mensaje fue enviado al asesor. Te respondemos a la brevedad.`];
  }

  // ── PANTALLA: MAIN ──────────────────────────────────────────────────────────
  if (session.screen === "main") {
    switch (text) {
      case "1":
        navigateTo(session, "soporte");
        return [MENUS.soporte.intro, MENUS.soporte.fields[0].ask];
      case "2":
        navigateTo(session, "presupuesto_submenu");
        return [MENUS.presupuesto.submenuText];
      case "3":
        navigateTo(session, "consultas");
        return [MENUS.consultas.text];
      case "4":
        navigateTo(session, "planes");
        return [MENUS.planes.text];
      default:
        return [UNKNOWN_TEXT];
    }
  }

  // ── PANTALLA: SUBMENÚ PRESUPUESTO ───────────────────────────────────────────
  if (session.screen === "presupuesto_submenu") {
    if (text === "0") {
      goBack(session);
      return [MAIN_MENU_TEXT];
    }

    // Caso especial: Bot WA muestra info antes del formulario
    if (text === "3") {
      navigateTo(session, "bot_wa_info");
      session.formData.tipo_presupuesto = "Bot de WhatsApp";
      return [BOT_WA_INFO + BOT_WA_CLOSING];
    }

    const opcion = MENUS.presupuesto.submenuOptions[text];
    if (!opcion) return [`❌ Opción inválida.\n\n${MENUS.presupuesto.submenuText}`];

    navigateTo(session, "presupuesto");
    session.formData.tipo_presupuesto = opcion;
    return [MENUS.presupuesto.intro, MENUS.presupuesto.fields[0].ask];
  }

  // ── PANTALLA: BOT WA INFO ───────────────────────────────────────────────────
  if (session.screen === "bot_wa_info") {
    if (text === "1") {
      navigateTo(session, "presupuesto");
      return [MENUS.presupuesto.intro, MENUS.presupuesto.fields[0].ask];
    }
    if (text === "2") {
      goHome(session);
      return [`👍 ¡Entendido! Si necesitás algo más escribí *hola*.`];
    }
    return [`Por favor respondé *1* para continuar o *2* para volver al menú.${BOT_WA_CLOSING}`];
  }

  // ── PANTALLA: FORMULARIO SOPORTE ────────────────────────────────────────────
  if (session.screen === "soporte") {
    return await handleForm(session, phone, text, rawText, MENUS.soporte, async (data) => {
      const ticketId = generateTicketId();
      await saveTicket(phone, data, ticketId);
      return MENUS.soporte.onComplete(data, ticketId);
    });
  }

  // ── PANTALLA: FORMULARIO PRESUPUESTO ────────────────────────────────────────
  if (session.screen === "presupuesto") {
    return await handleForm(session, phone, text, rawText, MENUS.presupuesto, async (data) => {
      await saveLead(phone, data);
      return MENUS.presupuesto.onComplete(data);
    });
  }

  // ── PANTALLA: CONSULTAS GENERALES ───────────────────────────────────────────
  if (session.screen === "consultas") {
    if (text === "0") {
      return [MENUS.consultas.text];
    }
    const option = MENUS.consultas.options[text];
    if (!option) return [`❌ Opción inválida.\n\n${MENUS.consultas.text}`];

    const responseText = option.text + CLOSING_TEXT;
    navigateTo(session, "closing");
    session.closingOrigin = `Consulta: ${option.label}`;
    session.closingBack = "consultas";
    return [responseText];
  }

  // ── PANTALLA: PLANES ────────────────────────────────────────────────────────
  if (session.screen === "planes") {
    if (text === "0") {
      return [MENUS.planes.text];
    }
    const option = MENUS.planes.options[text];
    if (!option) return [`❌ Opción inválida.\n\n${MENUS.planes.text}`];

    const responseText = option.text + CLOSING_TEXT;
    navigateTo(session, "closing");
    session.closingOrigin = `Plan: ${option.label}`;
    session.closingBack = "planes";
    return [responseText];
  }

  // ── PANTALLA: CIERRE FINAL ──────────────────────────────────────────────────
  if (session.screen === "closing") {
    if (text === "0") {
      const back = session.closingBack;
      if (back && MENUS[back]) {
        navigateTo(session, back);
        return [MENUS[back].text];
      }
      goBack(session);
      return [MAIN_MENU_TEXT];
    }
    if (text === "1") {
      await saveCallRequest(phone, session.closingOrigin || "bot");
      goHome(session);
      session.screen = "agent";
      if (!session.chatwootConvId) {
        session.chatwootConvId = await escalateToAgent(
          phone,
          `📋 *Solicitud de contacto*\nOrigen: ${session.closingOrigin || "bot"}\nTeléfono: +${phone}`
        );
      }
      return [
        `✅ *¡Perfecto!* Gonzalo se va a comunicar con vos a la brevedad.\n\n📌 Te respondemos según la prioridad de tu caso.\n\nSi necesitás algo más escribí *hola*.`,
      ];
    }
    if (text === "2") {
      goHome(session);
      return [`👍 ¡Entendido! Si necesitás algo más, escribí *hola* para volver al menú.`];
    }
    return [`Por favor respondé *1* para que te contactemos o *2* para finalizar.${CLOSING_TEXT}`];
  }

  return [UNKNOWN_TEXT];
}

// ── FORMULARIOS PASO A PASO ──────────────────────────────────────────────────
async function handleForm(session, phone, text, rawText, menuConfig, onComplete) {
  const fields = menuConfig.fields;
  const step = session.formStep;

  if (text === "0") {
    if (step === 0) {
      goBack(session);
      return [MAIN_MENU_TEXT];
    }
    session.formStep -= 1;
    const prevField = fields[session.formStep];
    return [`↩️ Volvemos al paso anterior.\n\n${prevField.ask}`];
  }

  const currentField = fields[step];

  if (currentField.options) {
    const chosen = currentField.options[text];
    if (!chosen) {
      return [`❌ Opción inválida. Por favor respondé con un número válido.\n\n${currentField.ask}`];
    }
    session.formData[currentField.key] = chosen;
  } else {
    const raw = rawText.trim();
    if (currentField.numeric) {
      if (!/^\d+$/.test(raw)) {
        return [`❌ Por favor ingresá un número válido.\n\n${currentField.ask}`];
      }
      session.formData[currentField.key] = raw;
    } else {
      if (!raw || raw.length < 2) {
        return [`❌ Respuesta demasiado corta. Por favor ingresá un valor válido.\n\n${currentField.ask}`];
      }
      session.formData[currentField.key] = rawInputOf(raw);
    }
  }

  session.formStep += 1;

  if (session.formStep < fields.length) {
    const nextField = fields[session.formStep];
    return [nextField.ask];
  }

  const completionMessage = await onComplete(session.formData);
  goHome(session);
  session.screen = "closing";
  session.closingOrigin = menuConfig.label;
  return [completionMessage + CLOSING_TEXT];
}

function rawInputOf(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

module.exports = { handleMessage };
