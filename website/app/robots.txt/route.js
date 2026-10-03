export const dynamic = 'force-dynamic';

const SITE = process.env.SITE_URL || 'https://hobbymice.com.tr';

export function GET() {
  const lines = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api',
    'Disallow: /giris',
    'Sitemap: ' + SITE + '/sitemap.xml',
  ];
  return new Response(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain' },
  });
}
