// src/config/menu.js
const TRIGGERS = ["hola", "inicio", "menu", "menú", "start", "holi", "buenas", "buenos días", "buenas tardes", "buenas noches"];
const AGENT_TRIGGERS = ["asesor", "asesor humano", "hablar", "persona", "humano", "agente"];

const MAIN_MENU_TEXT = `¡Hola! 👋 Bienvenido a *IT Solve*.\n¿En qué podemos ayudarte hoy?\n\n*1* · 🛠️ Soporte técnico\n*2* · 💬 Solicitar presupuesto\n*3* · ❓ Consultas generales\n*4* · 📋 Ver planes mensuales\n\n_Escribí el número de tu opción._\n_En cualquier momento escribí *asesor* para hablar con alguien._`;

const MENUS = {
  soporte: {
    label: "Soporte técnico",
    intro: `🛠️ *Soporte técnico*\n\nVamos a generar un ticket. Te voy a hacer algunas preguntas rápidas.\n\n_Escribí *0* para volver o *00* para el menú principal._`,
    type: "form",
    formKey: "ticket",
    fields: [
      { key: "empresa",       label: "Empresa",            ask: "¿A qué *empresa* representás?" },
      { key: "contacto",      label: "Nombre de contacto", ask: "¿Cuál es tu *nombre completo*?" },
      { key: "tipo_problema", label: "Tipo de problema",   ask: "¿Qué tipo de problema tenés? Describilo brevemente." },
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
      `✅ *¡Gracias por tu consulta!*\n\n🏢 Empresa: ${data.empresa}\n🏭 Rubro: ${data.rubro}\n👥 Empleados: ${data.empleados}\n📞 Contacto: ${data.contacto}\n📌 Interés: ${data.tipo_presupuesto || ""}\n\nUn asesor va a preparar una *propuesta personalizada* y se contactará en las próximas 24 hs hábiles. 🚀`,
  },

  consultas: {
    label: "Consultas generales",
    type: "submenu",
    text: `❓ *Consultas generales*\n\n¿Sobre qué tema querés información?\n\n*1* · 💻 Soporte remoto\n*2* · 🚗 Visitas técnicas\n*3* · 🌐 Monitoreo de red\n*4* · 💾 Backup empresarial\n*5* · 🔧 Mantenimiento preventivo\n\n*0* · Volver  |  *00* · Menú principal`,
    options: {
      "1": { label: "Soporte remoto",           text: `💻 *Soporte remoto*\n\nResolvemos problemas de software, configuraciones, accesos y más sin que tengas que mover un dedo.\n\n✅ Atención Lun-Vie de 18 a 21 hs y Sáb de 10 a 14 hs\n✅ Conexión segura y remota\n✅ Resolución en el mismo día (según plan)` },
      "2": { label: "Visitas técnicas",         text: `🚗 *Visitas técnicas*\n\nNos desplazamos a tu empresa para resolver problemas de hardware, redes e impresoras.\n\n✅ Cobertura en GBA y CABA\n✅ Incluido en planes Pro y Premium\n✅ Coordinación en menos de 24 hs` },
      "3": { label: "Monitoreo de red",         text: `🌐 *Monitoreo de red*\n\nVigilamos tu infraestructura en tiempo real para que no te enterés de los problemas por tus empleados.\n\n✅ Alertas automáticas ante caídas\n✅ Reportes mensuales\n✅ Incluido en planes Pro y Premium` },
      "4": { label: "Backup empresarial",       text: `💾 *Backup empresarial*\n\nProtegemos los datos de tu empresa ante cualquier imprevisto.\n\n✅ Backup diario en la nube\n✅ Restauración rápida\n✅ Disponible desde el Plan Básico` },
      "5": { label: "Mantenimiento preventivo", text: `🔧 *Mantenimiento preventivo*\n\nEvitá problemas antes de que ocurran y alargá la vida útil de tus equipos.\n\n✅ Revisión periódica de equipos\n✅ Actualización de software\n✅ Limpieza y optimización\n✅ Informe mensual de estado` },
    },
  },

  planes: {
    label: "Ver planes mensuales",
    type: "submenu",
    text: `📋 *Planes mensuales*\n\n¿Cuál querés conocer?\n\n*1* · 🥉 Plan Básico — $100.000/mes\n*2* · 🥈 Plan Pro — $150.000/mes\n*3* · 🥇 Plan Premium — $250.000/mes\n\n*0* · Volver  |  *00* · Menú principal`,
    options: {
      "1": { label: "Plan Básico",  text: `🥉 *Plan Básico — $100.000/mes*\n\n✅ Tu problema resuelto ese mismo día\n✅ Alguien que te responde, no una línea 0800\n✅ Tus archivos importantes siempre respaldados\n❌ Sin visitas presenciales\n\nIdeal para negocios que quieren dejar de apagar incendios.` },
      "2": { label: "Plan Pro",     text: `🥈 *Plan Pro — $150.000/mes*\n\n✅ Respuesta en menos de 4 horas\n✅ Tus archivos siempre respaldados\n✅ Alguien que va a tu negocio cuando hace falta\n✅ Sabés en todo momento si tu red está funcionando\n\nPara el que no puede permitirse que algo falle.` },
      "3": { label: "Plan Premium", text: `🥇 *Plan Premium — $250.000/mes*\n\n✅ Respuesta en menos de 1 hora\n✅ Visitas sin límite cuando las necesitás\n✅ Red monitoreada las 24 hs\n✅ Clientes atendidos por WhatsApp aunque vos no estés\n\nPara el que quiere olvidarse de la tecnología para siempre.` },
    },
  },
};

const CLOSING_TEXT = `\n\n─────────────────\n¿Querés que un asesor te contacte para coordinar una llamada?\n\n*1* · ✅ Sí, quiero que me llamen\n*2* · ❌ No, gracias`;
const AGENT_TEXT = `👤 *Conectando con un asesor...*\n\nEn breve Gonzalo se va a comunicar con vos.\n\n🕐 Lunes a viernes: 18:00 – 21:00 hs\n🕐 Sábados: 10:00 – 14:00 hs`;
const UNKNOWN_TEXT = `🤖 No entendí tu mensaje.\n\nEscribí *hola* para ver el menú o *asesor* para hablar con alguien.`;

module.exports = { TRIGGERS, AGENT_TRIGGERS, MAIN_MENU_TEXT, MENUS, CLOSING_TEXT, AGENT_TEXT, UNKNOWN_TEXT };
