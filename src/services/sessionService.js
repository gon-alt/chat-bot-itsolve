// src/services/sessionService.js
// ─────────────────────────────────────────────────────────────────────────────
// Maneja el estado de cada conversación en memoria.
// Cada sesión guarda: en qué pantalla está el usuario, los datos del formulario
// en curso y el historial de navegación para poder volver atrás.
// ─────────────────────────────────────────────────────────────────────────────

const TIMEOUT_MS = (parseInt(process.env.SESSION_TIMEOUT_HOURS) || 4) * 60 * 60 * 1000;

// Map: phoneNumber → session
const sessions = new Map();

/**
 * Estructura de una sesión:
 * {
 *   screen:      string,   // pantalla actual: 'main' | 'soporte' | 'presupuesto' | 'consultas' | 'planes' | 'closing' | 'agent'
 *   history:     string[], // pila de pantallas anteriores para poder volver con "0"
 *   formStep:    number,   // índice del campo actual del formulario en curso
 *   formData:    object,   // datos recolectados del formulario
 *   lastActivity: number,  // timestamp del último mensaje
 * }
 */

function getSession(phone) {
  const session = sessions.get(phone);
  if (!session) return null;

  // Verificar si la sesión expiró
  if (Date.now() - session.lastActivity > TIMEOUT_MS) {
    sessions.delete(phone);
    return null;
  }

  session.lastActivity = Date.now();
  return session;
}

function createSession(phone) {
  const session = {
    screen: "main",
    history: [],
    formStep: 0,
    formData: {},
    lastActivity: Date.now(),
  };
  sessions.set(phone, session);
  return session;
}

function getOrCreateSession(phone) {
  return getSession(phone) || createSession(phone);
}

/**
 * Navega a una nueva pantalla guardando la actual en el historial.
 */
function navigateTo(session, screen) {
  session.history.push(session.screen);
  session.screen = screen;
  session.formStep = 0;
  session.formData = {};
}

/**
 * Vuelve a la pantalla anterior (comando "0").
 * Devuelve la pantalla a la que volvió.
 */
function goBack(session) {
  if (session.history.length === 0) {
    session.screen = "main";
    return "main";
  }
  session.screen = session.history.pop();
  session.formStep = 0;
  session.formData = {};
  return session.screen;
}

/**
 * Vuelve al menú principal (comando "00").
 */
function goHome(session) {
  session.screen = "main";
  session.history = [];
  session.formStep = 0;
  session.formData = {};
}

function deleteSession(phone) {
  sessions.delete(phone);
}

module.exports = { getOrCreateSession, navigateTo, goBack, goHome, deleteSession };
