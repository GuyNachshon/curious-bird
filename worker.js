/**
 * Serves /videos/* and /audio/* from R2 (with Range support for iOS/Safari),
 * everything else from static assets (SPA).
 */

function parseRange(rangeHeader, size) {
  // bytes=start-end
  const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim());
  if (!match) return null;
  const startStr = match[1];
  const endStr = match[2];

  let start = startStr === '' ? 0 : Number(startStr);
  let end = endStr === '' ? size - 1 : Number(endStr);

  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  if (start < 0) start = 0;
  if (end < 0) end = 0;
  if (start >= size) return null;
  if (end >= size) end = size - 1;
  if (end < start) return null;

  return { start, end };
}

function ensureContentType(headers, key) {
  if (headers.has('Content-Type')) return;
  if (key.endsWith('.mp4')) headers.set('Content-Type', 'video/mp4');
  else if (key.endsWith('.aac')) headers.set('Content-Type', 'audio/aac');
}

async function serveFromR2(request, env, key) {
  const head = await env.VIDEOS.head(key);
  if (!head) return new Response('Not Found', { status: 404 });

  const totalSize = head.size;
  const headers = new Headers();
  head.writeHttpMetadata(headers);
  ensureContentType(headers, key);
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Cache-Control', 'public, max-age=31536000');

  const rangeHeader = request.headers.get('Range');
  if (rangeHeader) {
    const parsed = parseRange(rangeHeader, totalSize);
    if (!parsed) {
      headers.set('Content-Range', `bytes */${totalSize}`);
      return new Response('Range Not Satisfiable', { status: 416, headers });
    }

    const { start, end } = parsed;
    const length = end - start + 1;
    const object = await env.VIDEOS.get(key, { range: { offset: start, length } });
    if (!object) return new Response('Not Found', { status: 404 });

    headers.set('Content-Range', `bytes ${start}-${end}/${totalSize}`);
    headers.set('Content-Length', String(length));
    return new Response(object.body, { status: 206, headers });
  }

  const object = await env.VIDEOS.get(key);
  if (!object) return new Response('Not Found', { status: 404 });
  headers.set('Content-Length', String(object.size));
  return new Response(object.body, { status: 200, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/videos/') || url.pathname.startsWith('/audio/')) {
      const key = url.pathname.slice(1); // e.g. "videos/176.mp4" or "audio/169.aac"
      try {
        return await serveFromR2(request, env, key);
      } catch (e) {
        return new Response('Error', { status: 500 });
      }
    }
    return env.ASSETS.fetch(request);
  },
};
