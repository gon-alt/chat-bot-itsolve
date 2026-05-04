// src/services/botService.js
// ─────────────────────────────────────────────────────────────────────────────
// Núcleo del bot. Recibe un mensaje de texto, decide qué responder según
// la sesión actual del usuario y retorna los textos a enviar.
// ─────────────────────────────────────────────────────────────────────────────

const { getOrCreateSession, navigateTo, goBack, goHome } = require("./sessionService");
const { saveTicket, saveLead, saveCallRequest, generateTicketId } = require("./sheetsService");
const {
  TRIGGERS, AGENT_TRIGGERS, MAIN_MENU_TEXT,
  MENUS, CLOSING_TEXT, AGENT_TEXT, UNKNOWN_TEXT,
} = require("../config/menu");

/**
 * Punto de entrada principal.
 * @returns {Promise<string[]>} Array de mensajes a enviar en orden.
 */
async function handleMessage(phone, rawText) {
  const text = rawText.trim().toLowerCase();
  const session = getOrCreateSession(phone);

  // ── COMANDOS GLOBALES ───────────────────────────────────────────────────────

  // "00" → menú principal desde cualquier lugar
  if (text === "00") {
    goHome(session);
    return [MAIN_MENU_TEXT];
  }

  // "asesor" o "hablar" → derivar a agente humano
  if (AGENT_TRIGGERS.some((t) => text.includes(t))) {
    goHome(session);
    session.screen = "agent";
    return [AGENT_TEXT];
  }

  // ── PANTALLA: AGENT (el usuario está siendo atendido) ──────────────────────
  if (session.screen === "agent") {
    return [`👤 Ya estás en contacto con nuestro equipo. Si querés volver al bot escribí *hola*.\n\n_Horario de atención: Lun-Vie 9-18 hs / Sáb 9-13 hs._`];
  }

  // ── PANTALLA: MAIN ─────────────────────────────────────────────────────────
  if (session.screen === "main") {
    // Disparadores del menú
    if (TRIGGERS.some((t) => text.includes(t))) {
      return [MAIN_MENU_TEXT];
    }

    // Opciones del menú principal
    switch (text) {
      case "1":
        navigateTo(session, "soporte");
        return [MENUS.soporte.intro, MENUS.soporte.fields[0].ask];
      case "2":
        navigateTo(session, "presupuesto");
        return [MENUS.presupuesto.intro, MENUS.presupuesto.fields[0].ask];
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

  // ── PANTALLA: FORMULARIO DE SOPORTE ────────────────────────────────────────
  if (session.screen === "soporte") {
    return await handleForm(session, phone, text, MENUS.soporte, async (data) => {
      const ticketId = generateTicketId();
      await saveTicket(phone, data, ticketId);
      return MENUS.soporte.onComplete(data, ticketId);
    });
  }

  // ── PANTALLA: FORMULARIO DE PRESUPUESTO ────────────────────────────────────
  if (session.screen === "presupuesto") {
    return await handleForm(session, phone, text, MENUS.presupuesto, async (data) => {
      await saveLead(phone, data);
      return MENUS.presupuesto.onComplete(data);
    });
  }

  // ── PANTALLA: CONSULTAS GENERALES ──────────────────────────────────────────
  if (session.screen === "consultas") {
    if (text === "0") {
      goBack(session);
      return [MAIN_MENU_TEXT];
    }
    const option = MENUS.consultas.options[text];
    if (!option) return [`❌ Opción inválida.\n\n${MENUS.consultas.text}`];

    const responseText = option.text + CLOSING_TEXT;
    navigateTo(session, "closing");
    session.closingOrigin = `Consulta: ${option.label}`;
    return [responseText];
  }

  // ── PANTALLA: PLANES ────────────────────────────────────────────────────────
  if (session.screen === "planes") {
    if (text === "0") {
      goBack(session);
      return [MAIN_MENU_TEXT];
    }
    const option = MENUS.planes.options[text];
    if (!option) return [`❌ Opción inválida.\n\n${MENUS.planes.text}`];

    const responseText = option.text + CLOSING_TEXT;
    navigateTo(session, "closing");
    session.closingOrigin = `Plan: ${option.label}`;
    return [responseText];
  }

  // ── PANTALLA: CIERRE FINAL ──────────────────────────────────────────────────
  if (session.screen === "closing") {
    if (text === "0") {
      goBack(session);
      return [MAIN_MENU_TEXT];
    }
    if (text === "1") {
      // Sí quiere que lo llamen
      await saveCallRequest(phone, session.closingOrigin || "bot");
      goHome(session);
      session.screen = "agent";
      return [
        `✅ *¡Perfecto!* Un asesor se va a comunicar con vos a la brevedad.\n\n🕐 Horario: Lun-Vie 9-18 hs / Sáb 9-13 hs\n\nSi necesitás algo más escribí *hola*.`,
      ];
    }
    if (text === "2") {
      // No quiere que lo llamen
      goHome(session);
      return [`👍 ¡Entendido! Si necesitás algo más, escribí *hola* para volver al menú.`];
    }
    return [`Por favor respondé *1* para que te llamemos o *2* para finalizar.${CLOSING_TEXT}`];
  }

  // Fallback final
  return [UNKNOWN_TEXT];
}

// ─────────────────────────────────────────────────────────────────────────────
// Manejo genérico de formularios paso a paso
// ─────────────────────────────────────────────────────────────────────────────
async function handleForm(session, phone, text, menuConfig, onComplete) {
  const fields = menuConfig.fields;
  const step = session.formStep;

  // Volver atrás dentro del formulario
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

  // Validar si el campo tiene opciones fijas (como Prioridad)
  if (currentField.options) {
    const chosen = currentField.options[text];
    if (!chosen) {
      return [`❌ Opción inválida. Por favor respondé con un número válido.\n\n${currentField.ask}`];
    }
    session.formData[currentField.key] = chosen;
  } else {
    if (!text || text.length < 2) {
      return [`❌ Respuesta demasiado corta. Por favor ingresá un valor válido.\n\n${currentField.ask}`];
    }
    session.formData[currentField.key] = rawInputOf(text);
  }

  session.formStep += 1;

  // ¿Hay más campos?
  if (session.formStep < fields.length) {
    const nextField = fields[session.formStep];
    return [nextField.ask];
  }

  // Formulario completo
  const completionMessage = await onComplete(session.formData);
  goHome(session);
  session.screen = "closing";
  session.closingOrigin = menuConfig.label;
  return [completionMessage + CLOSING_TEXT];
}

/**
 * Capitaliza la primera letra del input libre del usuario.
 */
function rawInputOf(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

module.exports = { handleMessage };
