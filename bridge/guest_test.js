// Ultimate test: click "Play as guest" in Ruffle and verify the game actually
// connects through the WebSocket bridge (village room should load).
const { chromium } = require("/root/projects/transformice/bridge/node_modules/playwright");

(async () => {
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--enable-unsafe-swiftshader", "--use-gl=swiftshader"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const logs = [];
  page.on("console", (m) => logs.push(m.type() + ": " + m.text().slice(0, 160)));

  await page.goto("https://hobbymice.com.tr/play/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(18000);

  // "Play as guest" dugmesi (ekrandaki konum: ~x260 y451)
  await page.mouse.click(260, 451);
  await page.waitForTimeout(12000);
  await page.screenshot({ path: "/tmp/final/site_guest1.png" });
  console.log("guest 1 alindi");

  await page.waitForTimeout(8000);
  await page.screenshot({ path: "/tmp/final/site_guest2.png" });
  console.log("guest 2 alindi");
  console.log("--- konsol ---");
  for (const l of logs.slice(-12)) console.log(l);
  await browser.close();
})().catch((e) => {
  console.error("TEST HATASI:", e.message);
  process.exit(1);
});
