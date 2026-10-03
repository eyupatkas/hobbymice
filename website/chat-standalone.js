'use strict';
// Canlı sohbet WebSocket sunucusu — ayrı hafif süreç (8011).
// HTTP tarafı `next start` ile çalışır; nginx /ws/chat yolunu buraya yönletir.
const http = require('http');
const db = require('./lib/db');
const chat = require('./lib/chat');

const PORT = parseInt(process.env.PORT || '8011', 10);

(async () => {
  await db.connect();
  const server = http.createServer((req, res) => {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('chat ws: /ws/chat');
  });
  chat.attach(server);
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`HobbyMice sohbet sunucusu: ws://127.0.0.1:${PORT}/ws/chat`);
  });
})().catch(e => { console.error('Başlatma hatası:', e); process.exit(1); });
