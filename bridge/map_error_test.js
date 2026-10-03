// Capture the map-build failure in the browser console (Ruffle prints AS3 errors).
const { chromium } = require("/root/projects/transformice/bridge/node_modules/playwright");

(async () => {
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--enable-unsafe-swiftshader", "--use-gl=swiftshader"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const logs = [];
  page.on("console", (m) => {
    const t = m.type() + ": " + m.text();
    if (/error|Error|ERROR|2148|Security|security/.test(t)) logs.push(t.slice(0, 300));
  });
  page.on("pageerror", (e) => logs.push("PAGEERROR: " + e.message.slice(0, 200)));

  await page.goto("https://hobbymice.com.tr/play/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(16000);
  await page.mouse.click(258, 451);          // Play as guest
  await page.waitForTimeout(13000);
  await page.mouse.click(668, 308);          // Quit the tutorial
  await page.waitForTimeout(14000);
  await page.screenshot({ path: "/tmp/final/browser_room1.png" });
  console.log("--- hata/uyari kayitlari ---");
  const seen = new Set();
  for (const l of logs) { if (!seen.has(l)) { seen.add(l); console.log(l); } }
  await browser.close();
})().catch((e) => { console.error("HATA:", e.message); process.exit(1); });
