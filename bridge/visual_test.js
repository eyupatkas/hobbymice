// Visual acceptance test: load https://hobbymice.com.tr pages in headless Chromium
// and capture screenshots (home + Ruffle play screen after boot).
const { chromium } = require("/root/projects/transformice/bridge/node_modules/playwright");

(async () => {
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--enable-unsafe-swiftshader", "--use-gl=swiftshader"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  // 1) landing page
  await page.goto("https://hobbymice.com.tr/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "/tmp/final/site_home.png" });
  console.log("home ekran goruntusu alindi");

  // 2) play page — wait for Ruffle boot
  await page.goto("https://hobbymice.com.tr/play/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(20000); // swf + boot animasyonu
  await page.screenshot({ path: "/tmp/final/site_play.png" });
  console.log("play ekran goruntusu alindi (20s)");

  // konsol hatalarini da topla
  await page.waitForTimeout(5000);
  await page.screenshot({ path: "/tmp/final/site_play2.png" });
  console.log("play ekran goruntusu 2 alindi (25s)");

  await browser.close();
})().catch((e) => {
  console.error("TEST HATASI:", e.message);
  process.exit(1);
});
