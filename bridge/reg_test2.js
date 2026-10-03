// Registration flow explorer: open dialog, fill, submit — screenshot every step.
const { chromium } = require("/root/projects/transformice/bridge/node_modules/playwright");

const NICK = process.argv[2] || "TestFare" + Math.floor(Math.random() * 900 + 100);
const PASS = "TestSifre123";

(async () => {
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--enable-unsafe-swiftshader", "--use-gl=swiftshader"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const logs = [];
  page.on("console", (m) => { if (m.type() === "error") logs.push(m.text().slice(0, 150)); });

  await page.goto("https://hobbymice.com.tr/play/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(16000);

  // Create account butonuna cift deneme
  await page.mouse.click(417, 451);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "/tmp/final/reg_s1.png" });
  await page.mouse.click(417, 452);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "/tmp/final/reg_s2.png" });
  console.log("NICK:", NICK);
  console.log("hatalar:", logs.length ? logs.slice(0, 4) : "yok");
  await browser.close();
})().catch((e) => { console.error("HATA:", e.message); process.exit(1); });
