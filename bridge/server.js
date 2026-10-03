// HobbyMice Ruffle socket proxy: WebSocket (browser) <-> TCP (game server) bridge.
// Ruffle's socketProxy opens wss://hobbymice.com.tr/ws/game/<port>; nginx forwards
// here as /game/<port>. We dial 127.0.0.1:<port> and pipe raw bytes both ways.
const WebSocket = require("ws");
const net = require("net");

const GAME_PORTS = [11801, 12801, 13801, 14801];
const LISTEN_PORT = 11901;

const wss = new WebSocket.Server({ host: "127.0.0.1", port: LISTEN_PORT });

wss.on("connection", (ws, req) => {
  const m = (req.url || "").match(/game\/(\d+)/);
  const port = m ? Number(m[1]) : 0;
  if (!GAME_PORTS.includes(port)) {
    ws.close(1008, "bad port");
    return;
  }

  let toServer = 0, toClient = 0;
  const started = Date.now();
  const sock = net.connect(port, "127.0.0.1", () => {
    console.log(`[bridge] ${req.socket.remoteAddress} -> :${port} open`);
  });

  sock.on("data", (buf) => {
    toClient += buf.length;
    if (ws.readyState === WebSocket.OPEN) ws.send(buf);
  });
  sock.on("error", (e) => {
    console.log(`[bridge] tcp error (${port}): ${e.message}`);
    ws.close();
  });
  sock.on("close", () => {
    console.log(`[bridge] :${port} closed after ${(Date.now() - started) / 1000}s (C->S ${toServer}B, S->C ${toClient}B)`);
    ws.close();
  });

  ws.on("message", (data) => {
    toServer += data.length;
    if (toServer === data.length) {
      console.log(`[bridge] :${port} ilk paket (${data.length}B): ${data.slice(0, 32).toString("hex")}`);
    }
    sock.write(Buffer.from(data));
  });
  ws.on("close", (code, reason) => {
    console.log(`[bridge] ws close (${port}) code=${code} after ${(Date.now() - started) / 1000}s (C->S ${toServer}B, S->C ${toClient}B)`);
    sock.destroy();
  });
  ws.on("error", () => sock.destroy());
});

wss.on("error", (e) => {
  console.error("[bridge] server error:", e.message);
  process.exit(1);
});

console.log(`[bridge] listening on 127.0.0.1:${LISTEN_PORT}, targets: ${GAME_PORTS.join(", ")}`);
