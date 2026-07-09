# Handoff: Página "el.ia" — Analytics Club

## Overview
Nueva página **el.ia**: una recepción digital atendida por un agente de IA, a **página completa** (no un widget pop-up). Tres bloques, de arriba a abajo:
1. **Recepción / chat** — interfaz de conversación grande donde el visitante habla con el.ia.
2. **Mapa conceptual** — el diseño del asistente por capas (nodos e interconexiones).
3. **Agentes de IA** — por qué se creó el.ia y cómo adaptar agentes a un negocio (interacción con clientes y automatización interna).

Mismo sistema visual que el resto del sitio (fondo oscuro + partículas de triángulos + acento verde/cian `#00ffa3`/`#17f9ff`, Inter). Se reutilizan **header, footer y fondo originales**; solo se crea el `<main>` nuevo.

## About the Design Files
`el.ia.dc.html` es la **referencia de diseño** (prototipo). Recrear el `<main>` en una página nueva del sitio (`pages/el-ia.html` o la ruta que definas, `/el.ia`). El header/footer/partículas del prototipo son reproducción visual — usar los originales.

⚠️ **En el prototipo el chat responde con IA en vivo** a través de un helper del entorno de diseño (`window.claude.complete`). Ese helper NO existe en tu web. En producción, la inteligencia se conecta a una **Netlify Function** (ver más abajo). La interfaz visual del chat se reutiliza tal cual.

---

## Arquitectura del chat en producción (opción elegida: endpoint externo)
El sitio real es PHP; la IA se aloja aparte en **Netlify** y la web la consume como **endpoint externo** (vía CORS). Así no se mueve el resto de la web.

```
  [ Página el.ia en tu web PHP ]
            |  fetch (JSON)
            v
  [ Netlify Function /chat ]  ← guarda la API key (variable de entorno)
            |  llamada API
            v
  [ Modelo Claude (Anthropic) ]
```

### Archivos incluidos
- `netlify/functions/chat.js` — la función serverless (proxy al modelo con el system prompt de el.ia, CORS y saneado de la respuesta).
- `netlify.toml` — configuración mínima de Netlify.
- `produccion-chat-snippet.js` — cómo cambiar la llamada del front-end (de `window.claude` a un `fetch` al endpoint).

### Pasos de despliegue
1. Crear un repo (o carpeta) con `netlify.toml` en la raíz y `netlify/functions/chat.js`.
2. En Netlify: **Add new site** → conectar el repo (o `netlify deploy` por CLI). No requiere build.
3. En **Site settings → Environment variables**, añadir `ANTHROPIC_API_KEY` con tu clave de Anthropic. (La clave es de pago **por uso**, céntimos por conversación en una demo — no es cuota fija como n8n Cloud.)
4. La función queda en `https://TU-SITIO.netlify.app/.netlify/functions/chat`.
5. En `netlify/functions/chat.js`, revisar `ALLOWED_ORIGINS` y poner tu dominio real (`https://analyticsclub.es`).
6. En la página el.ia de tu web, poner ese endpoint en `ELIA_ENDPOINT` (ver `produccion-chat-snippet.js`) y sustituir la llamada a `window.claude.complete` por `askElia(history)`.

### Seguridad
- La API key vive **solo** en la variable de entorno de Netlify. Nunca en el HTML/JS del front-end.
- CORS restringe qué dominios pueden llamar la función (`ALLOWED_ORIGINS`).
- La función recorta el historial a las últimas 12 intervenciones y 2000 caracteres por mensaje para limitar coste.
- Recomendable añadir un límite de peticiones (rate limiting) si la demo se hace pública mucho tiempo.

---

## Estructura del `<main>` (los tres bloques)

### 1. Recepción / chat
- Cabecera centrada: badge "Recepción digital · en línea" (punto verde parpadeante), H1 "Hola, soy **el.ia**" (el.ia en gradiente), subtítulo.
- **Shell del chat** (`max-width:820px`, glass, radio 24px):
  - Barra superior: avatar circular con icono `bot` + punto de estado, nombre "el.ia", "responde al instante".
  - Cuerpo scrollable (alto ~440px): burbujas usuario (gradiente, alineadas a la derecha) y el.ia (glass, izquierda). Indicador de escritura con 3 puntos animados mientras responde. Auto-scroll al final.
  - Fila de **sugerencias** (chips): "¿Qué es el Data Governance?", "¿Cómo funciona un agente de IA?", "Quiero automatizar tareas" — al pulsar, envían esa pregunta.
  - Input + botón enviar (gradiente, icono `send`). Enter también envía.
- Aviso legal breve debajo ("es un asistente de demostración…").

### 2. Mapa conceptual por capas
Título "Cómo está construida el.ia". 4 tarjetas-capa apiladas, conectadas por chevrons `chevron-down`. Cada capa: grid `230px / 1fr` (colapsa a 1 col en móvil), con icono en recuadro, "CAPA 0X" (mono), nombre, descripción y **nodos** (chips):
- **Capa 01 · Interfaz** (icono `messages-square`, acento verde): Web, WhatsApp, Email.
- **Capa 02 · Comprensión** (`brain`, cian): LLM, Detección de intención, Memoria de contexto.
- **Capa 03 · Orquestación** (`workflow`, violeta): n8n, Reglas de negocio, Enrutado.
- **Capa 04 · Conocimiento & Acción** (`database`, neutro): RAG / Base de datos, CRM, Calendario, APIs.

### 3. Agentes de IA
- Intro "¿Por qué creé el.ia?" (2 párrafos).
- Grid 2 tarjetas (colapsa a 1 col): **Interacción con clientes** (icono `users`, verde — recepción, cualificación de leads, reserva de citas) y **Automatización interna** (`zap`, cian — clasificación de correos, informes, flujos entre herramientas). Cada una con 3 items con `check`.
- **CTA**: banda con gradiente, "¿Imaginas un agente así en tu negocio?", botón "Diseñemos tu agente" → `/contacto`.

Iconos Lucide usados (ya cargado): `bot, sparkles, send, messages-square, brain, workflow, database, chevron-down, users, zap, check`.

## Design Tokens
Idénticos al resto del rediseño: fondo `#050505`; acento `#00ffa3`/`#17f9ff`; violeta de apoyo `#b98cff`/`rgba(153,69,255,...)`; superficie glass `rgba(255,255,255,0.03)` + borde `rgba(255,255,255,0.08–0.12)`; radios 10/16/18/20/24px y 999px (chips); Inter + Space Mono (etiquetas). Fuente de verdad: `css/style.css`.

## Responsive
Prototipo con container queries; en el sitio real usar `@media`. En móvil: capas del mapa a 1 columna (centradas), grid de agentes a 1 columna, alturas del chat reducidas. El header original ya trae su hamburguesa.

## Files
- `el.ia.dc.html` — prototipo de la página (chat con IA en vivo dentro del entorno de diseño).
- `netlify/functions/chat.js`, `netlify.toml`, `produccion-chat-snippet.js` — backend y conexión para producción.
- `img/` — logo y footer.
