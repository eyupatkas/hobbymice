export const dynamic = 'force-dynamic';

// IndexNow 验证文件：/indexnow-<key>.txt →（next.config rewrite）→ 此处。
// 仅当密钥与 INDEXNOW_KEY 环境变量一致时返回。
export function GET(req) {
  const key = String(new URL(req.url).searchParams.get('key') || '');
  const expected = process.env.INDEXNOW_KEY || '';
  if (expected && key === expected) {
    return new Response(key, { headers: { 'Content-Type': 'text/plain' } });
  }
  return new Response(null, { status: 404 });
}
