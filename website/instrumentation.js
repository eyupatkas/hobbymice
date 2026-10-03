// Next.js açılış kancası: sunucu ayağa kalkarken MongoDB bağlantısını kurar.
export async function register() {
  console.log('[instrumentation] register çalıştı');
  const { connect } = await import('./lib/db');
  await connect();
  console.log('[instrumentation] MongoDB bağlı');
}
