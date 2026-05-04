// src/config/menu.js
// ─────────────────────────────────────────────────────────────────────────────
// Toda la lógica de CONTENIDO vive acá. Para cambiar textos o agregar opciones
// solo hay que editar este archivo, sin tocar la lógica del bot.
// ─────────────────────────────────────────────────────────────────────────────

const TRIGGERS = ["hola", "inicio", "menu", "menú", "start", "holi", "buenas", "buenos días", "buenas tardes", "buenas noches"];

const AGENT_TRIGGERS = ["asesor", "asesor humano", "hablar", "persona", "humano", "agente"];

const MAIN_MENU_TEXT = `¡Hola! 👋 Bienvenido a *Soporte Técnico*.
¿En qué podemos ayudarte hoy?

*1* · 🛠️ Soporte técnico
*2* · 💬 Solicitar presupuesto
*3* · ❓ Consultas generales
*4* · 📋 Ver planes mensuales

_Escribí el número de tu opción._
_En cualquier momento escribí *asesor* para hablar con alguien._`;

const MENUS = {
  soporte: {
    label: "Soporte técnico",
    intro: `🛠️ *Soporte técnico*\n\nVamos a generar un ticket. Te voy a hacer algunas preguntas rápidas.\n\n_Escribí *0* para volver o *00* para el menú principal._`,
    type: "form",
    formKey: "ticket",
    fields: [
      { key: "empresa",       label: "Empresa",              ask: "¿A qué *empresa* representás?" },
      { key: "contacto",      label: "Nombre de contacto",   ask: "¿Cuál es tu *nombre completo*?" },
      { key: "tipo_problema", label: "Tipo de problema",     ask: "¿Qué tipo de problema tenés? Describilo brevemente." },
      {
        key: "prioridad", label: "Prioridad",
        ask: `¿Cuál es la *prioridad* del problema?\n\n*1* · 🔴 Alta\n*2* · 🟡 Media\n*3* · 🟢 Baja`,
        options: { "1": "Alta", "2": "Media", "3": "Baja" },
      },
      { key: "descripcion", label: "Descripción técnica", ask: "Por último, describí con detalle el problema técnico." },
    ],
    onComplete: (data, ticketId) =>
      `✅ *Ticket generado correctamente*\n\n📌 N° de ticket: *#${ticketId}*\n🏢 Empresa: ${data.empresa}\n👤 Contacto: ${data.contacto}\n⚡ Prioridad: ${data.prioridad}\n\nUn técnico se comunicará con vos a la brevedad.`,
  },

  presupuesto: {
    label: "Solicitar presupuesto",
    intro: `💬 *Solicitar presupuesto*\n\nExcelente! Vamos a armar tu consulta comercial.\n\n_Escribí *0* para volver o *00* para el menú principal._`,
    type: "form",
    formKey: "lead",
    fields: [
      { key: "empresa",   label: "Empresa",               ask: "¿A qué *empresa* representás?" },
      { key: "rubro",     label: "Rubro",                 ask: "¿Cuál es el *rubro* de la empresa?" },
      { key: "empleados", label: "Cantidad de empleados", ask: "¿Cuántos *empleados* tiene la empresa aproximadamente?" },
      { key: "necesidad", label: "Necesidad principal",   ask: "¿Cuál es su *necesidad principal*? (Ej: soporte IT, seguridad, backups…)" },
    ],
    onComplete: (data) =>
      `✅ *¡Gracias por tu consulta!*\n\n🏢 Empresa: ${data.empresa}\n🏭 Rubro: ${data.rubro}\n👥 Empleados: ${data.empleados}\n\nUn asesor comercial va a preparar una *propuesta personalizada* y se contactará en las próximas 24 hs hábiles. 🚀`,
  },

  consultas: {
    label: "Consultas generales",
    type: "submenu",
    text: `❓ *Consultas generales*\n\n¿Sobre qué tema querés información?\n\n*1* · 💻 Soporte remoto\n*2* · 🚗 Visitas técnicas\n*3* · 📱 Automatización de WhatsApp\n*4* · 🌐 Monitoreo de red\n*5* · 💾 Backup empresarial\n*6* · 🔧 Mantenimiento preventivo\n\n*0* · Volver  |  *00* · Menú principal`,
    options: {
      "1": { label: "Soporte remoto",             text: `💻 *Soporte remoto*\n\nBrindamos soporte técnico remoto para resolver problemas de software, configuraciones, accesos y más.\n\n✅ Disponible de lunes a viernes\n✅ Conexión segura\n✅ Resolución en el mismo día (según plan)` },
      "2": { label: "Visitas técnicas",           text: `🚗 *Visitas técnicas*\n\nNuestro equipo se desplaza a tu empresa para resolver problemas de hardware, redes y servidores.\n\n✅ Cobertura en GBA y CABA\n✅ Incluido en planes Pro y Premium\n✅ Coordinación en menos de 24 hs` },
      "3": { label: "Automatización de WhatsApp", text: `📱 *Automatización de WhatsApp*\n\nImplementamos bots personalizados para WhatsApp Business:\n\n✅ Menús interactivos\n✅ Formularios automáticos\n✅ Integración con Google Sheets / CRM\n✅ Handoff a agente humano` },
      "4": { label: "Monitoreo de red",           text: `🌐 *Monitoreo de red*\n\nVigilamos tu infraestructura en tiempo real:\n\n✅ Alertas automáticas ante caídas\n✅ Dashboard de estado 24/7\n✅ Reportes mensuales\n✅ Incluido en planes Pro y Premium` },
      "5": { label: "Backup empresarial",         text: `💾 *Backup empresarial*\n\nProtegemos los datos de tu empresa:\n\n✅ Backup diario en la nube\n✅ Retención configurable\n✅ Restauración rápida\n✅ Disponible desde el Plan Básico` },
      "6": { label: "Mantenimiento preventivo",  text: `🔧 *Mantenimiento preventivo*\n\nEvitá problemas antes de que ocurran:\n\n✅ Revisión periódica de equipos\n✅ Actualización de software\n✅ Limpieza y optimización\n✅ Informe mensual de estado` },
    },
  },

  planes: {
    label: "Ver planes mensuales",
    type: "submenu",
    text: `📋 *Planes mensuales*\n\n¿Cuál querés conocer?\n\n*1* · 🥉 Plan Básico\n*2* · 🥈 Plan Pro\n*3* · 🥇 Plan Premium\n\n*0* · Volver  |  *00* · Menú principal`,
    options: {
      "1": { label: "Plan Básico",   text: `🥉 *Plan Básico*\n\n✅ Resolución en el día\n✅ Atención personalizada\n✅ Backup de archivos\n❌ Sin visitas presenciales\n\nIdeal para pequeñas empresas que necesitan soporte esencial.` },
      "2": { label: "Plan Pro",      text: `🥈 *Plan Pro*\n\n✅ Respuesta en menos de *4 horas*\n✅ Backup permanente en la nube\n✅ Visitas presenciales incluidas\n✅ Monitoreo de red\n\nIdeal para empresas en crecimiento.` },
      "3": { label: "Plan Premium",  text: `🥇 *Plan Premium*\n\n✅ Respuesta en menos de *1 hora*\n✅ Visitas presenciales *ilimitadas*\n✅ Monitoreo de red *24/7*\n✅ Atención automática por WhatsApp\n\nPara empresas que necesitan disponibilidad total.` },
    },
  },
};

const CLOSING_TEXT = `\n\n─────────────────\n¿Querés que un asesor te contacte para coordinar una llamada?\n\n*1* · ✅ Sí, quiero que me llamen\n*2* · ❌ No, gracias`;

const AGENT_TEXT = `👤 *Conectando con un asesor...*\n\nEn breve un miembro de nuestro equipo se va a comunicar con vos.\n\n🕐 Lunes a viernes: 9:00 – 18:00 hs\n🕐 Sábados: 9:00 – 13:00 hs`;

const UNKNOWN_TEXT = `🤖 No entendí tu mensaje.\n\nEscribí *hola* para ver el menú o *asesor* para hablar con alguien.`;

module.exports = { TRIGGERS, AGENT_TRIGGERS, MAIN_MENU_TEXT, MENUS, CLOSING_TEXT, AGENT_TEXT, UNKNOWN_TEXT };
