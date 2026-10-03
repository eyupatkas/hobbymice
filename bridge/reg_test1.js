// End-to-end registration test: click Create account, fill the form, submit.
const { chromium } = require("/root/projects/transformice/bridge/node_modules/playwright");

(async () => {
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--enable-unsafe-swiftshader", "--use-gl=swiftshader"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto("https://hobbymice.com.tr/play/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(16000);

  // Create account butonu
  await page.mouse.click(417, 451);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "/tmp/final/reg_dialog.png" });
  console.log("dialog goruntusu alindi");
  await browser.close();
})().catch((e) => { console.error("HATA:", e.message); process.exit(1); });
