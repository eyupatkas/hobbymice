// Oda modu canlı testi: konuk girişi → tutorial çık → /room <mod> → ekran +
// journal kanıtı. Kullanım: node hm_roommode_test.mjs racing|bootcamp|vanilla
// (hm_match_flow_test.mjs akışından uyarlandı; /tmp/hm-roommode altına yazar).
import { chromium } from "/root/projects/transformice/bridge/node_modules/playwright/index.mjs";
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const MODE = process.argv[2] || "racing";
const SHOT_DIR = "/tmp/hm-roommode";
fs.mkdirSync(SHOT_DIR, { recursive: true });
for (const f of fs.readdirSync(SHOT_DIR)) fs.unlinkSync(SHOT_DIR + "/" + f);

function gameLog(since) {
  return execFileSync(
    "journalctl",
    ["-u", "transformice", "--since", since, "--no-pager"],
    { encoding: "utf8", timeout: 20000 },
  );
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

  // Konuk girişi
  for (let i = 0; i < 2; i++) {
    await page.mouse.click(260, 451);
    await page.waitForTimeout(12000);
  }
  await page.waitForTimeout(6000);

  // Tutorial'dan çık
  await page.mouse.click(683, 307);
  await page.waitForTimeout(8000);
  await page.screenshot({ path: SHOT_DIR + "/1-afterquit.png" });
  console.log("1) tutorialdan çıkıldı");

  // Hedef odaya gir
  await page.mouse.click(640, 400);
  await page.waitForTimeout(500);
  await page.mouse.click(330, 782);
  await page.waitForTimeout(500);
  await page.keyboard.type("/room " + MODE, { delay: 80 });
  await page.keyboard.press("Enter");
  // Oda geçişi render'ı swiftshader'da 12-25 sn gecikebiliyor — bol bekle
  await page.waitForTimeout(25000);
  await page.screenshot({ path: SHOT_DIR + "/2-room-" + MODE + ".png" });
  console.log("2) /room " + MODE + " ekranı alındı");

  // Bir raund aksın: yürü/zıpla
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(2500);
  await page.keyboard.press("ArrowUp");
  await page.waitForTimeout(1500);
  await page.keyboard.up("ArrowRight");
  await page.waitForTimeout(12000);
  await page.screenshot({ path: SHOT_DIR + "/3-play-" + MODE + ".png" });
  console.log("3) raunt oynandı, ekran alındı");

  await browser.close();

  const log = gameLog(t0);
  const errors = log.split("\n").filter((l) =>
    /exception|ERROR|Error #|Init Error|IndexOutOfBounds|Incorrect version|at org\.transformice/.test(l),
  );
  console.log(`journal hata satırı=${errors.length}`);
  if (errors.length) console.log(errors.slice(0, 8).join("\n"));
  console.log(errors.length === 0 ? "JOURNAL TEMIZ ✔" : "JOURNAL HATALI ✗");
})();
