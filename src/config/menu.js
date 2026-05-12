// src/config/menu.js
const TRIGGERS = ["hola", "inicio", "menu", "menú", "start", "holi", "buenas", "buenos días", "buenas tardes", "buenas noches"];
const AGENT_TRIGGERS = ["asesor", "asesor humano", "hablar", "persona", "humano", "agente"];

const MAIN_MENU_TEXT = `¡Hola! 👋 Bienvenido a *IT Solve*.\n¿En qué podemos ayudarte hoy?\n\n*1* · 🛠️ Soporte técnico\n*2* · 💬 Solicitar presupuesto\n*3* · ❓ Consultas generales\n*4* · 📋 Ver planes mensuales\n\n_Escribí el número de tu opción._\n_En cualquier momento escribí *asesor* para hablar con alguien._`;

const BOT_WA_INFO = `🤖 *Bot de WhatsApp para tu negocio*\n\nAutomatizamos tu WhatsApp para que tu negocio responda solo, aunque vos no estés.\n\n✅ Menú interactivo adaptado a tu negocio\n✅ Respuestas automáticas fuera de horario\n✅ Captación de datos de clientes potenciales\n✅ Derivación a persona real cuando hace falta\n✅ Sin aplicaciones extra — funciona en tu WhatsApp actual\n\n_Servicio de configuración única + mantenimiento mensual opcional._`;

const MENUS = {
  soporte: {
    label: "Soporte técnico",
    intro: `🛠️ *Soporte técnico*\n\nVamos a generar un ticket. Te voy a hacer algunas preguntas rápidas.\n\n_Escribí *0* para volver o *00* para el menú principal._`,
    type: "form",
    formKey: "ticket",
    fields: [
      { key: "empresa",       label: "Empresa",            ask: "¿A qué *empresa* representás?" },
      { key: "contacto",      label: "Nombre de contacto", ask: "¿Cuál es tu *nombre completo*?" },
      { key: "telefono",      label: "Teléfono/WhatsApp",  ask: "¿Cuál es tu *número de WhatsApp o teléfono* para contactarte?" },
      { key: "tipo_problema", label: "Tipo de problema",   ask: "¿Qué tipo de problema tenés? Describilo brevemente." },
      {
        key: "prioridad", label: "Prioridad",
        ask: `¿Cuál es la *prioridad* del problema?\n\n*1* · 🔴 Alta\n*2* · 🟡 Media\n*3* · 🟢 Baja`,
        options: { "1": "Alta", "2": "Media", "3": "Baja" },
      },
      { key: "descripcion", label: "Descripción técnica", ask: "Por último, describí con detalle el problema técnico." },
    ],
    onComplete: (data, ticketId) =>
      `✅ *Ticket generado correctamente*\n\n📌 N° de ticket: *#${ticketId}*\n🏢 Empresa: ${data.empresa}\n👤 Contacto: ${data.contacto}\n📞 Teléfono: ${data.telefono}\n⚡ Prioridad: ${data.prioridad}\n\nUn técnico se comunicará con vos a la brevedad.`,
  },

  presupuesto: {
    label: "Solicitar presupuesto",
    submenuText: `💬 *Solicitar presupuesto*\n\n¿Sobre qué querés consultar?\n\n*1* · 📋 Planes mensuales\n*2* · 🔧 Tarea puntual\n*3* · 🤖 Bot de WhatsApp\n\n*0* · Volver  |  *00* · Menú principal`,
    submenuOptions: { "1": "Planes mensuales", "2": "Tarea puntual", "3": "Bot de WhatsApp" },
    intro: `💬 *Solicitar presupuesto*\n\nExcelente! Vamos a armar tu consulta comercial.\n\n_Escribí *0* para volver o *00* para el menú principal._`,
    type: "form",
    formKey: "lead",
    fields: [
      { key: "empresa",   label: "Empresa",               ask: "¿A qué *empresa* representás?" },
      { key: "rubro",     label: "Rubro",                 ask: "¿Cuál es el *rubro* de la empresa?" },
      { key: "empleados", label: "Cantidad de empleados", ask: "¿Cuántos *empleados* tiene la empresa aproximadamente?", numeric: true },
      { key: "contacto",  label: "Contacto",              ask: "¿Cuál es tu *WhatsApp o email* para coordinar?" },
      { key: "necesidad", label: "Necesidad principal",   ask: "¿Cuál es su *necesidad principal*? (Ej: soporte IT, seguridad, backups…)" },
    ],
    onComplete: (data) =>
      `✅ *¡Gracias por tu consulta!*\n\n🏢 Empresa: ${data.empresa}\n🏭 Rubro: ${data.rubro}\n👥 Empleados: ${data.empleados}\n📞 Contacto: ${data.contacto}\n📌 Interés: ${data.tipo_presupuesto || ""}\n\nUn asesor va a preparar una *propuesta personalizada* y se contactará a la brevedad. 🚀`,
  },

  consultas: {
    label: "Consultas generales",
    type: "submenu",
    text: `❓ *Consultas generales*\n\n¿Sobre qué tema querés información?\n\n*1* · 💻 Soporte remoto\n*2* · 🚗 Visitas técnicas\n*3* · 🌐 Monitoreo de red\n*4* · 💾 Backup empresarial\n*5* · 🔧 Mantenimiento preventivo\n*6* · 🤖 Bot de WhatsApp\n\n*0* · Volver  |  *00* · Menú principal`,
    options: {
      "1": { label: "Soporte remoto",           text: `💻 *Soporte remoto*\n\nResolvemos problemas de software, configuraciones, accesos y más sin que tengas que mover un dedo.\n\n✅ Te atendemos cuando algo falla\n✅ Conexión segura y remota\n✅ Resolución en el mismo día (según plan)` },
      "2": { label: "Visitas técnicas",         text: `🚗 *Visitas técnicas*\n\nNos desplazamos a tu empresa para resolver problemas de hardware, redes e impresoras.\n\n✅ Cobertura en GBA y CABA\n✅ Incluido en planes Pro (2/mes) y Premium (sin límite)\n✅ Coordinación rápida` },
      "3": { label: "Monitoreo de red",         text: `🌐 *Monitoreo de red*\n\nVigilamos tu infraestructura para que no te enterés de los problemas por tus empleados.\n\n✅ Alertas automáticas ante caídas\n✅ Informe mensual detallado (Plan Premium)\n✅ Incluido en planes Pro y Premium` },
      "4": { label: "Backup empresarial",       text: `💾 *Backup empresarial*\n\nProtegemos los datos de tu empresa ante cualquier imprevisto.\n\n✅ Backup en la nube\n✅ Configuración inicial (Plan Básico)\n✅ Monitoreo + alertas automáticas (Plan Premium)` },
      "5": { label: "Mantenimiento preventivo", text: `🔧 *Mantenimiento preventivo*\n\nEvitá problemas antes de que ocurran y alargá la vida útil de tus equipos.\n\n✅ Revisión periódica de equipos\n✅ Actualización de software\n✅ Limpieza y optimización` },
      "6": { label: "Bot de WhatsApp",          text: BOT_WA_INFO },
    },
  },

  planes: {
    label: "Ver planes mensuales",
    type: "submenu",
    text: `📋 *Planes mensuales*\n\n¿Cuál querés conocer?\n\n*1* · 🥉 Plan Básico — $100.000/mes\n*2* · 🥈 Plan Pro — $200.000/mes\n*3* · 🥇 Plan Premium — $250.000/mes\n\n*0* · Volver  |  *00* · Menú principal`,
    options: {
      "1": { label: "Plan Básico", text: `🥉 *Plan Básico — $100.000/mes*\n_Para el que quiere dejar de apagar incendios_\n\n✅ Soporte remoto — cuando algo falla, te atendemos\n✅ Backup en la nube — configuración inicial\n✅ Antivirus gestionado — Windows Defender configurado\n✕ Resumen mensual\n✕ Visita presencial\n✕ Monitoreo de red\n✕ Reclamo al ISP` },
      "2": { label: "Plan Pro",    text: `🥈 *Plan Pro — $200.000/mes*\n_Para el que no puede permitirse que algo falle_\n\n✅ Soporte remoto — cuando algo falla, te atendemos\n✅ Backup en la nube — monitoreo mensual\n✅ Antivirus gestionado — Microsoft Defender for Business\n✅ Resumen mensual — de tu infraestructura\n✅ Visita presencial — 2 por mes\n✅ Monitoreo de red — en tiempo real\n✕ Reclamo al ISP` },
      "3": { label: "Plan Premium", text: `🥇 *Plan Premium — $250.000/mes*\n_Para el que quiere olvidarse de la tecnología para siempre_\n\n✅ Soporte remoto — cuando algo falla, te atendemos\n✅ Backup en la nube — monitoreo + alertas automáticas\n✅ Antivirus gestionado — solución profesional con panel XDR\n✅ Resumen mensual — detallado con métricas\n✅ Visita presencial — sin límite\n✅ Monitoreo de red — con informe mensual detallado\n✅ Le peleamos a tu ISP — gestionamos el reclamo por vos` },
    },
  },
};

const CLOSING_TEXT = `\n\n─────────────────\n¿Querés que un asesor te contacte?\n\n*1* · ✅ Sí, quiero que me contacten\n*2* · ❌ No, gracias`;
const AGENT_TEXT = `👤 *Conectando con un asesor...*\n\nEn breve Gonzalo se va a comunicar con vos.\n\n📌 Te respondemos según la prioridad de tu caso.`;
const UNKNOWN_TEXT = `🤖 No entendí tu mensaje.\n\nEscribí *hola* para ver el menú o *asesor* para hablar con alguien.`;

module.exports = { TRIGGERS, AGENT_TRIGGERS, MAIN_MENU_TEXT, MENUS, CLOSING_TEXT, AGENT_TEXT, UNKNOWN_TEXT, BOT_WA_INFO };