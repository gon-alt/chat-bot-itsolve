// src/services/sheetsService.js
// ─────────────────────────────────────────────────────────────────────────────
// Escribe filas en Google Sheets usando una Service Account.
// Hojas esperadas en el spreadsheet:
//   - "Tickets"  → soporte técnico
//   - "Leads"    → presupuestos / interesados en llamada
// ─────────────────────────────────────────────────────────────────────────────

const { google } = require("googleapis");

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

function getAuthClient() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

/**
 * Agrega una fila al final de la hoja indicada.
 */
async function appendRow(sheetName, values) {
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A1`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [values] },
    });

    console.log(`[Sheets] Fila guardada en "${sheetName}":`, values);
  } catch (err) {
    console.error(`[Sheets] Error al guardar en "${sheetName}":`, err.message);
    // No tiramos el error para que el bot siga funcionando aunque Sheets falle
  }
}

/**
 * Guarda un ticket de soporte técnico.
 */
async function saveTicket(phone, data, ticketId) {
  const now = new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });
  await appendRow("Tickets", [
    ticketId,
    now,
    phone,
    data.empresa,
    data.contacto,
    data.tipo_problema,
    data.prioridad,
    data.descripcion,
    "Abierto", // estado inicial
  ]);
}

/**
 * Guarda un lead de presupuesto.
 */
async function saveLead(phone, data) {
  const now = new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });
  await appendRow("Leads", [
    now,
    phone,
    data.empresa,
    data.rubro,
    data.empleados,
    data.necesidad,
    "Nuevo", // estado inicial
  ]);
}

/**
 * Guarda un interesado en llamada (cierre final).
 */
async function saveCallRequest(phone, origin) {
  const now = new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });
  await appendRow("Leads", [
    now,
    phone,
    "", "", "", // empresa / rubro / empleados desconocidos
    `Solicitud de llamada desde: ${origin}`,
    "Llamada pendiente",
  ]);
}

/**
 * Genera un ID de ticket simple: TICKET-YYYYMMDD-XXXX
 */
function generateTicketId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${date}-${rand}`;
}

module.exports = { saveTicket, saveLead, saveCallRequest, generateTicketId };
