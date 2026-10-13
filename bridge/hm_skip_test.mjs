// /atla (harita atlama oylaması) canlı testi: konuk girişi → oda → raunt
// başlamasını bekle → /atla → tek kişilik odada anında atlama + [Skip] journal kanıtı.
import { chromium } from "/root/projects/transformice/bridge/node_modules/playwright/index.mjs";
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const SHOT_DIR = "/tmp/hm-skiptest";
fs.mkdirSync(SHOT_DIR, { recursive: true });
for (const f of fs.readdirSync(SHOT_DIR)) fs.unlinkSync(SHOT_DIR + "/" + f);

function gameLog(since) {
  return execFileSync("journalctl", ["-u", "transformice", "--since", since, "--no-pager"], { encoding: "utf8", timeout: 20000 });
}

const t0 = new Date(Date.now() - 30_000).toISOString().replace("T", " ").slice(0, 19);

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
  await page.mouse.click(683, 307); // tutorialdan çık
  await page.waitForTimeout(8000);

  // Test odasına gir
  await page.mouse.click(640, 400);
  await page.waitForTimeout(500);
  await page.mouse.click(330, 782);
  await page.waitForTimeout(500);
  await page.keyboard.type("/room hmskiptest", { delay: 80 });
  await page.keyboard.press("Enter");
  await page.waitForTimeout(20000); // raunt başlasın + harita yüklensin
  await page.screenshot({ path: SHOT_DIR + "/1-before.png" });
  console.log("1) raunt başladı, /atla öncesi ekran");

  // /atla gönder — tuval tıklaması chat odağını düşürdüğünden DOĞRUDAN chat
  // kutusuna tıkla, yazıdan sonra ve Enter'dan ÖNCE ekran al (metin kutuda mı?)
  await page.mouse.click(330, 782);
  await page.waitForTimeout(800);
  await page.keyboard.type("/atla", { delay: 80 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: SHOT_DIR + "/2-typed.png" });
  await page.keyboard.press("Enter");
  await page.waitForTimeout(8000);
  await page.screenshot({ path: SHOT_DIR + "/3-after.png" });
  console.log("2) /atla yazıldı+gönderildi");

  await browser.close();

  const log = gameLog(t0);
  const skipLine = log.split("\n").filter((l) => /\[Skip\]/.test(l));
  const errors = log.split("\n").filter((l) => /exception|ERROR|IndexOutOfBounds/.test(l));
  console.log("skip journal:", skipLine.length ? skipLine.slice(-2).join(" | ") : "(yok)");
  console.log(`journal hata satırı=${errors.length}`);
  if (errors.length) console.log(errors.slice(0, 5).join("\n"));
  console.log(skipLine.length && errors.length === 0 ? "SKIP TESTI GECTI ✔" : "SKIP TESTI SORUMLU ✗");
})();
