/**
 * Serves /videos/* from R2; everything else from static assets (SPA).
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/videos/')) {
      const key = url.pathname.slice(1); // e.g. "videos/176.mp4"
      try {
        const object = await env.VIDEOS.get(key);
        if (object === null) return new Response('Not Found', { status: 404 });
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('Cache-Control', 'public, max-age=31536000');
        return new Response(object.body, { headers, status: 200 });
      } catch (e) {
        return new Response('Error', { status: 500 });
      }
    }
    return env.ASSETS.fetch(request);
  },
};
