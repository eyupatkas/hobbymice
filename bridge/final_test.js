// Final acceptance: browser play still works after server fixes + perf tweaks.
const { chromium } = require("/root/projects/transformice/bridge/node_modules/playwright");

(async () => {
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--enable-unsafe-swiftshader", "--use-gl=swiftshader"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 120));
  });

  const t0 = Date.now();
  await page.goto("https://hobbymice.com.tr/play/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(15000);
  console.log("yukleme+boot sureci:", ((Date.now() - t0) / 1000).toFixed(1), "s");

  await page.mouse.move(260, 451);
  await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
  await page.waitForTimeout(14000);
  await page.screenshot({ path: "/tmp/final/final_guest.png" });
  console.log("hata sayisi:", errors.length);
  for (const e of errors.slice(0, 6)) console.log(" -", e);
  await browser.close();
})().catch((e) => { console.error("HATA:", e.message); process.exit(1); });
