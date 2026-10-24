// Odaklı misafir komut kanıtı: /online yanıtı ekranında görünmeli.
// (hm_roommode_test.mjs akışı; /tmp/hm-guestone altına yazar)
import { chromium } from "/root/projects/transformice/bridge/node_modules/playwright/index.mjs";
import fs from "node:fs";

const SHOT_DIR = "/tmp/hm-guestone";
fs.rmSync(SHOT_DIR, { recursive: true, force: true });
fs.mkdirSync(SHOT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--enable-unsafe-swiftshader", "--use-gl=swiftshader"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto("https://hobbymice.com.tr/play/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(20000);

  for (let i = 0; i < 2; i++) {
    await page.mouse.click(260, 451);
    await page.waitForTimeout(12000);
  }
  await page.waitForTimeout(6000);
  await page.mouse.click(683, 307);
  await page.waitForTimeout(8000);

  // /online gönder, uzun bekle (render gecikmesi toleransı)
  await page.mouse.click(640, 400);
  await page.waitForTimeout(500);
  await page.mouse.click(330, 782);
  await page.waitForTimeout(500);
  await page.keyboard.type("/online", { delay: 80 });
  await page.keyboard.press("Enter");
  await page.waitForTimeout(15000);
  await page.screenshot({ path: SHOT_DIR + "/1-online-15s.png" });
  await page.waitForTimeout(15000);
  await page.screenshot({ path: SHOT_DIR + "/2-online-30s.png" });
  console.log("online gönderildi, 2 ekran alındı");

  // Ardından /cark da denensin (görsel yanıt: çevirme mesajı veya 'bugün çevirdin')
  await page.mouse.click(330, 782);
  await page.waitForTimeout(500);
  await page.keyboard.type("/cark", { delay: 80 });
  await page.keyboard.press("Enter");
  await page.waitForTimeout(15000);
  await page.screenshot({ path: SHOT_DIR + "/3-cark-15s.png" });
  await page.waitForTimeout(15000);
  await page.screenshot({ path: SHOT_DIR + "/4-cark-30s.png" });
  console.log("cark gönderildi, 2 ekran alındı");

  await browser.close();
})();
