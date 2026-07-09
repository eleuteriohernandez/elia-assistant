// ============================================================
// Snippet de PRODUCCIÓN para el chat de el.ia en la web real
// ============================================================
// En el prototipo (.dc.html) el chat llama a window.claude.complete,
// que solo existe en el entorno de diseño. En tu web real, sustituye
// esa llamada por un fetch a la Netlify Function.
//
// 1. Define la URL de tu función desplegada (endpoint EXTERNO):
const ELIA_ENDPOINT = 'https://TU-SITIO.netlify.app/.netlify/functions/chat';

// 2. Esta es la función que envía el historial y devuelve la respuesta.
//    `history` es un array [{ role: 'user'|'assistant', text: '...' }, ...]
async function askElia(history) {
  const messages = history.map((m) => ({ role: m.role, content: m.text }));
  const res = await fetch(ELIA_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) throw new Error('Error de red');
  const data = await res.json();
  return data.reply;
}

// 3. En el manejador de "enviar", reemplaza el bloque que hoy usa
//    window.claude.complete(...) por:
//
//      let reply;
//      try {
//        reply = await askElia(history);
//      } catch (e) {
//        reply = 'Ahora mismo no puedo conectar. Escríbeme por el formulario de contacto y te responderá Eleuterio.';
//      }
//
//    El resto de la lógica (pintar burbujas, indicador de escritura) es idéntico.
