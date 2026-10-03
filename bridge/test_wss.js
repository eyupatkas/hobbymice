// WSS bridge test: connect to game server via wss://hobbymice.com.tr/ws/game/11801
// and send a Flash policy request; expect a cross-domain-policy response.
const WebSocket = require("/root/projects/transformice/bridge/node_modules/ws");

const ws = new WebSocket("wss://hobbymice.com.tr/ws/game/11801", {
  handshakeTimeout: 10000,
});
const timer = setTimeout(() => {
  console.log("TIMEOUT: 10 saniyede yanit yok");
  process.exit(1);
}, 10000);

ws.on("open", () => {
  console.log("WS acildi");
  ws.send(Buffer.from("<policy-file-request/>\0", "utf8"));
});
ws.on("message", (data) => {
  clearTimeout(timer);
  const s = data.toString("utf8");
  console.log("YANIT:", s.slice(0, 120));
  console.log(s.includes("cross-domain-policy") ? "KOPRU CALISIYOR ✔" : "BEKLENMEDIK YANIT ✗");
  process.exit(s.includes("cross-domain-policy") ? 0 : 1);
});
ws.on("error", (e) => {
  clearTimeout(timer);
  console.log("HATA:", e.message);
  process.exit(1);
});
