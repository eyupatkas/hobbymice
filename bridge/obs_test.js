// Full observability: Ruffle debug logs + WebSocket frames + error capture.
const { chromium } = require("/root/projects/transformice/bridge/node_modules/playwright");

(async () => {
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--enable-unsafe-swiftshader", "--use-gl=swiftshader"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const logs = [];
  page.on("console", (m) => {
    const t = m.text();
    if (!/Failed to load resource/.test(t)) logs.push(m.type() + ": " + t.slice(0, 220));
  });
  page.on("websocket", (ws) => {
    logs.push("WS-OPEN: " + ws.url());
    ws.on("close", () => logs.push("WS-CLOSE: " + ws.url()));
    ws.on("socketerror", (e) => logs.push("WS-ERR: " + String(e).slice(0, 150)));
  });

  await page.goto("https://hobbymice.com.tr/play/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(18000);
  await page.mouse.click(258, 451);
  await page.waitForTimeout(12000);
  await page.screenshot({ path: "/tmp/final/obs_1.png" });
  console.log("--- kayitlar ---");
  for (const l of logs.slice(-40)) console.log(l);
  await browser.close();
})().catch((e) => { console.error("HATA:", e.message); process.exit(1); });
