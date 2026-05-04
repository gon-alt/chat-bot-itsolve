# 🤖 WhatsApp Bot — Guía completa paso a paso

## Estructura del proyecto

```
whatsapp-bot/
├── index.js                        ← Servidor Express (entrada)
├── package.json
├── .env                            ← Variables de entorno (creás vos)
├── .env.example                    ← Plantilla de variables
└── src/
    ├── config/
    │   └── menu.js                 ← ✏️  Textos y menús configurables
    └── services/
        ├── botService.js           ← Lógica principal del bot
        ├── sessionService.js       ← Manejo de sesiones en memoria
        ├── sheetsService.js        ← Integración con Google Sheets
        └── whatsappService.js      ← Envío de mensajes por la API de Meta
```

---

## PASO 1 — Instalar Node.js

1. Entrá a https://nodejs.org y descargá la versión **LTS** (la recomendada).
2. Instalala normalmente.
3. Verificá que quedó instalado abriendo una terminal y escribiendo:
   ```bash
   node -v   # debería mostrar algo como v20.x.x
   npm -v    # debería mostrar algo como 10.x.x
   ```

---

## PASO 2 — Instalar dependencias del proyecto

Abrí una terminal en la carpeta del proyecto y ejecutá:
```bash
npm install
```
Esto descarga Express, Axios y la librería de Google.

---

## PASO 3 — Crear la app en Meta (WhatsApp Cloud API)

1. Entrá a https://developers.facebook.com y creá una cuenta si no tenés.
2. Hacé clic en **Mis apps → Crear app**.
3. Elegí tipo **Empresa** y dale un nombre.
4. En el panel de la app, buscá el producto **WhatsApp** y hacé clic en **Configurar**.
5. En la sección **Primeros pasos** vas a ver:
   - **Token de acceso temporal** → copialo (lo necesitás para `WHATSAPP_TOKEN`)
   - **ID del número de teléfono** → copialo (para `WHATSAPP_PHONE_ID`)

> ⚠️ El token temporal dura 24 hs. Más adelante (Paso 7) te explico cómo hacerlo permanente.

---

## PASO 4 — Crear el Google Sheet y la Service Account

### 4a. Crear el spreadsheet

1. Entrá a https://sheets.google.com y creá un nuevo archivo.
2. Renombrá la primera hoja como **Tickets**.
3. En la fila 1, escribí estos encabezados (uno por celda):
   ```
   ID Ticket | Fecha | Teléfono | Empresa | Contacto | Tipo | Prioridad | Descripción | Estado
   ```
4. Hacé clic en **+** abajo para agregar una segunda hoja y llamala **Leads**.
5. En la fila 1 de Leads escribí:
   ```
   Fecha | Teléfono | Empresa | Rubro | Empleados | Necesidad | Estado
   ```
6. Copiá el **ID del spreadsheet** de la URL:
   ```
   https://docs.google.com/spreadsheets/d/  ESTE_ES_EL_ID  /edit
   ```

### 4b. Crear la Service Account

1. Entrá a https://console.cloud.google.com
2. Creá un proyecto nuevo (o usá uno existente).
3. En el menú izquierdo: **APIs y servicios → Biblioteca**.
4. Buscá **Google Sheets API** y hacíla clic en **Habilitar**.
5. Andá a **APIs y servicios → Credenciales → Crear credenciales → Cuenta de servicio**.
6. Dale un nombre y hacé clic en **Crear y continuar**.
7. En el paso de roles elegí **Editor** y guardá.
8. Hacé clic en la cuenta de servicio recién creada.
9. Ir a la pestaña **Claves → Agregar clave → Crear nueva clave → JSON**.
10. Se descarga un archivo `.json`. Ábrilo y copiá todo su contenido.

### 4c. Compartir el Sheet con la Service Account

1. Abrí el archivo JSON descargado y buscá el campo `client_email` (termina en `@...iam.gserviceaccount.com`).
2. En tu Google Sheet hacé clic en **Compartir**.
3. Pegá ese email y dale permisos de **Editor**. Confirmá.

---

## PASO 5 — Configurar las variables de entorno

1. Copiá el archivo `.env.example` y renombralo como `.env`:
   ```bash
   cp .env.example .env
   ```
2. Abrí `.env` con cualquier editor de texto y completá los valores:

```env
# Token de acceso de tu app de Meta (Paso 3)
WHATSAPP_TOKEN=EAAxxxxxxxxxxxxxxx

# ID del número de teléfono de Meta (Paso 3)
WHATSAPP_PHONE_ID=1234567890123

# String secreto que vos inventás (puede ser cualquier cosa, ej: "mi-token-secreto-2024")
VERIFY_TOKEN=mi-token-secreto-2024

# ID del Google Sheet (Paso 4a)
GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms

# JSON completo de la service account en UNA SOLA LÍNEA (Paso 4b)
# Copiá el contenido del archivo .json y pegalo todo en una línea entre las comillas
GOOGLE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}

PORT=3000
SESSION_TIMEOUT_HOURS=4
```

---

## PASO 6 — Exponer el servidor a internet con ngrok

Meta necesita una URL pública para enviarte los mensajes. En desarrollo usamos **ngrok**.

1. Descargá ngrok desde https://ngrok.com/download e instalalo.
2. Abrí **dos terminales**:

   **Terminal 1** — Levantá el bot:
   ```bash
   npm run dev
   ```
   Deberías ver:
   ```
   🤖 Bot de WhatsApp corriendo en http://localhost:3000
   ```

   **Terminal 2** — Levantá ngrok:
   ```bash
   ngrok http 3000
   ```
   Vas a ver algo como:
   ```
   Forwarding  https://abc123.ngrok-free.app → http://localhost:3000
   ```
   Copiá esa URL (`https://abc123.ngrok-free.app`).

---

## PASO 7 — Configurar el webhook en Meta

1. En el panel de tu app de Meta, andá a **WhatsApp → Configuración**.
2. En la sección **Webhook**, hacé clic en **Editar**.
3. Completá:
   - **URL de devolución de llamada**: `https://abc123.ngrok-free.app/webhook`
   - **Token de verificación**: el mismo que pusiste en `VERIFY_TOKEN` del `.env`
4. Hacé clic en **Verificar y guardar**.
5. Una vez verificado, suscribite al evento **messages** haciendo clic en **Administrar** → activá `messages`.

---

## PASO 8 — Probar el bot

1. En el panel de Meta, en la sección **Primeros pasos**, buscá el número de teléfono de prueba.
2. Agregá tu número personal como número de prueba permitido.
3. Desde tu WhatsApp personal, escribile al número de prueba: **hola**
4. ¡El bot debería responder con el menú principal!

---

## PASO 9 — Pasar a producción (cuando estés listo)

### Token permanente
El token temporal dura 24 hs. Para uno permanente:
1. En Meta, andá a **Configuración → Avanzada → Tokens de acceso**.
2. O usá un **System User Token** desde el Business Manager.

### Hosting en la nube
En lugar de ngrok, podés deployar en:
- **Railway**: https://railway.app (fácil, gratis para empezar)
- **Render**: https://render.com (gratis con limitaciones)
- **VPS**: cualquier servidor con Node.js instalado

El proceso es el mismo: subís el código, configurás las variables de entorno en el panel del hosting, y reemplazás la URL de ngrok por la URL pública del servidor.

---

## Comandos disponibles para el usuario

| Escribe     | Acción                                      |
|-------------|---------------------------------------------|
| `hola`      | Muestra el menú principal                   |
| `inicio`    | Muestra el menú principal                   |
| `0`         | Vuelve al paso o menú anterior              |
| `00`        | Vuelve al menú principal desde cualquier lugar |
| `asesor`    | Conecta con un agente humano                |
| `hablar`    | Conecta con un agente humano                |

---

## Personalizar el bot

Para cambiar textos, opciones o agregar nuevas secciones al menú, **solo editá** el archivo:
```
src/config/menu.js
```
No necesitás tocar ningún otro archivo para cambios de contenido.

---

## Solución de problemas frecuentes

**El webhook no se verifica**
→ Asegurate de que ngrok esté corriendo y que `VERIFY_TOKEN` en `.env` coincida con el que pusiste en Meta.

**No llegan mensajes**
→ Verificá que te suscribiste al evento `messages` en la configuración del webhook de Meta.

**Error de Google Sheets**
→ Asegurate de que el JSON de la service account esté en una sola línea en `.env` y que compartiste el Sheet con el email de la service account.

**El bot no responde**
→ Revisá los logs en la terminal donde corre `npm run dev`. Cualquier error va a aparecer ahí.
# chat-bot-itsolve
