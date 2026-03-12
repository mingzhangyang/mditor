interface AssetsBinding {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

interface Env {
  ASSETS: AssetsBinding;
}

function textResponse(body: string, contentType: string): Response {
  return new Response(body, {
    headers: {
      'content-type': `${contentType}; charset=UTF-8`,
      'cache-control': 'public, max-age=300'
    }
  });
}

function buildRobotsTxt(origin: string): string {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${origin}/sitemap.xml`
  ].join('\n');
}

function buildSitemapXml(origin: string): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '  <url>',
    `    <loc>${origin}/</loc>`,
    '    <changefreq>weekly</changefreq>',
    '    <priority>1.0</priority>',
    '  </url>',
    '</urlset>'
  ].join('\n');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = url.origin;

    if (url.pathname === '/robots.txt') {
      return textResponse(buildRobotsTxt(origin), 'text/plain');
    }

    if (url.pathname === '/sitemap.xml') {
      return textResponse(buildSitemapXml(origin), 'application/xml');
    }

    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get('content-type') || '';

    if (!contentType.includes('text/html')) {
      return response;
    }

    const headers = new Headers(response.headers);
    headers.set(
      'link',
      `<${origin}/>; rel="canonical"`
    );
    headers.set(
      'x-robots-tag',
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
