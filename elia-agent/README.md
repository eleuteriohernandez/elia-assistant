# el.ia — Agente en Netlify

Backend serverless del agente **el.ia** (Analytics Club). Este repo NO es la web
final — es solo el "cerebro": una Netlify Function que hace de proxy seguro hacia
la API de Anthropic, más una página de prueba (`public/index.html`) para
verificar que el agente responde antes de conectarlo a la web real (PHP).

```
  [ Página el.ia en la web real (PHP) ]   ← se conecta más adelante
            |  fetch (JSON)
            v
  [ Netlify Function /chat ]  ← este repo, guarda la API key
            |  llamada API
            v
  [ Modelo Claude (Anthropic) ]
```

## Estructura
- `netlify/functions/chat.js` — la función serverless (system prompt de el.ia, CORS, saneado de respuesta).
- `netlify.toml` — configuración de Netlify (publica `public/`, funciones en `netlify/functions`).
- `public/index.html` — página mínima de prueba con un chat funcional, para comprobar el agente end-to-end.
- `.env.example` — plantilla de la variable de entorno necesaria.

## 1. Subir a GitHub
```bash
git init
git add .
git commit -m "Agente el.ia: función Netlify + página de prueba"
git branch -M main
git remote add origin <URL-de-tu-repo-vacio-en-GitHub>
git push -u origin main
```

## 2. Crear el sitio en Netlify
1. En [app.netlify.com](https://app.netlify.com): **Add new site → Import an existing project**.
2. Conecta tu cuenta de GitHub y selecciona este repo.
3. Build settings: **no hace falta build command**; publish directory `public` y functions directory `netlify/functions` ya vienen fijados en `netlify.toml` — Netlify los detecta solo.
4. Deploy.

## 3. Configurar la API key
1. Consigue una API key en [console.anthropic.com](https://console.anthropic.com) (pago por uso, céntimos por conversación en una demo).
2. En Netlify: **Site settings → Environment variables → Add a variable**.
   - Key: `ANTHROPIC_API_KEY`
   - Value: tu clave
3. Vuelve a desplegar (Netlify → **Deploys → Trigger deploy**) para que la función la recoja.

## 4. Probar el agente
Abre `https://TU-SITIO.netlify.app` — verás la página de prueba con un chat.
Escribe algo; si responde, el agente está funcionando. Si da error, el mensaje
en pantalla te dirá si falta la API key o si hay un problema con Anthropic.

La función queda disponible directamente en:
`https://TU-SITIO.netlify.app/.netlify/functions/chat`

## 5. Conectar a la web real (siguiente paso, más adelante)
Cuando esté listo:
1. En `netlify/functions/chat.js`, revisa `ALLOWED_ORIGINS` — ya incluye
   `https://analyticsclub.es` y `https://www.analyticsclub.es`. Si el dominio
   final cambia, actualízalo aquí.
2. En la página el.ia de la web real, usa el patrón de
   `handoff_elia/produccion-chat-snippet.js`: define
   `ELIA_ENDPOINT = 'https://TU-SITIO.netlify.app/.netlify/functions/chat'`
   y sustituye la llamada de chat por `askElia(history)`.
3. Recrea el `<main>` de `handoff_elia/el.ia.dc.html` como página normal del
   sitio (el prototipo usa un runtime de diseño que no existe en producción;
   solo sirve de referencia visual).

## Seguridad y control de coste
- La API key vive **solo** en la variable de entorno de Netlify. Nunca en el HTML/JS del front-end ni en git.
- CORS restringe qué dominios pueden llamar la función (`ALLOWED_ORIGINS` en `chat.js`).
- `max_tokens: 250` limita el tamaño de cada respuesta.
- El historial que se manda al modelo se recorta a las últimas 8 intervenciones y 500 caracteres por mensaje.
- **Corte de conversación**: a partir de `MAX_USER_TURNS` (8 preguntas por defecto) la función deja de llamar a Claude y responde con un cierre fijo que invita a contactar con Eleuterio — coste cero a partir de ahí. Es una demo, no un canal de soporte ilimitado. Ajustable en `chat.js`.
- **Rate limiting por IP**: máximo `RATE_LIMIT_MAX` peticiones (20 por defecto) cada `RATE_LIMIT_WINDOW_MS` (10 min) por IP. Es *best-effort* — la memoria se reinicia si Netlify arranca una instancia nueva en frío, así que no es un límite absoluto, pero frena ráfagas de abuso.
- **Tope de conversaciones nuevas por mes**: `MAX_CONVERSATIONS_PER_MONTH` (100 por defecto). Cada vez que alguien empieza una conversación (su primer mensaje) cuenta contra este tope, guardado con [Netlify Blobs](https://docs.netlify.com/blobs/overview/) (persiste de verdad entre invocaciones, a diferencia del rate limit de arriba). Se reinicia solo al empezar el mes natural siguiente. Al llegar al tope, las conversaciones **nuevas** reciben un mensaje fijo invitando a contactar con Eleuterio, sin coste de API; las conversaciones que ya estaban en curso pueden seguir hasta su propio límite de `MAX_USER_TURNS`. Ajustable en `chat.js`.
  - Requiere el paquete `@netlify/blobs` (ya en `package.json`). Funciona automáticamente en el sitio desplegado en Netlify, sin configuración extra. En local con `netlify dev` puede necesitar `netlify link` primero; si Blobs no está disponible, la función deja pasar la petición igualmente (falla "abierto", no bloquea la demo por un problema de almacenamiento).
