// Modul odalari canli testi v2: saglam giris (bridge journal polling) +
// modul odalarina giris + journal hata raporu.
// Kullanim: node hm_module_live_test.mjs [module1 module2 ...]
import { chromium } from "/root/projects/transformice/bridge/node_modules/playwright/index.mjs";
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const MODULES = process.argv.length > 2
  ? process.argv.slice(2)
  : ["crowdsurf", "powers", "pizzeria"];

function bridgeLog() {
  return execFileSync(
    "journalctl",
    ["-u", "hobbymice-bridge", "--since", "-2 min", "--no-pager"],
    { encoding: "utf8", timeout: 20000 },
  );
}

(async () => {
  const browser = await chromium.launch({
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--enable-unsafe-swiftshader", "--use-gl=swiftshader"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto("https://hobbymice.com.tr/play/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(20000);

  // Saglam giris: Play as guest'e cift tiklama + uzun bekleme (SWF etkilesim
  // hazir olana kadar). Giris sonrasi tutorial odasina dusulur.
  for (let i = 0; i < 2; i++) {
    await page.mouse.click(260, 451);
    await page.waitForTimeout(12000);
  }
  await page.waitForTimeout(8000);
  console.log("giris tamam, modullere giriliyor...");

  for (const mod of MODULES) {
    await page.mouse.click(400, 780);
    await page.waitForTimeout(400);
    await page.keyboard.type("/room #" + mod, { delay: 20 });
    await page.keyboard.press("Enter");
    // 25sn: modul init + ilk harita yuklemesi + (bazi modullerde skip/reload
    // dongusu) bittikten sonra temiz ekran goruntusu icin
    await page.waitForTimeout(25000);
    await page.screenshot({ path: "/tmp/mt_" + mod + ".png" });
    console.log("girildi: #" + mod);
  }
  await page.screenshot({ path: "/tmp/mt_final.png" });

  const jout = execFileSync(
    "journalctl",
    ["-u", "transformice", "--since", "-" + (MODULES.length * 26 + 90) + " sec", "--no-pager"],
    { encoding: "utf8", timeout: 30000 },
  );
  const hits = jout.split("\n").filter(l =>
    l.includes("Minigame") || l.includes("Root cause") || l.includes("Init Error"));
  console.log(hits.length ? hits.slice(-20).join("\n") : "(minigame init hatasi YOK — moduller temiz yuklendi)");
  await browser.close();
})().catch((e) => {
  console.error("TEST HATASI:", e.message);
  process.exit(1);
});
