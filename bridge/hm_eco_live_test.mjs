// Ekonomi sistemleri canli testi: HMEcoTest#0001 girisi + /cark + /gorev +
// /haftalik komutlari, her komuttan ekran goruntusu + journal dogrulamasi.
// Kullanim: node hm_eco_live_test.mjs
import { chromium } from "/root/projects/transformice/bridge/node_modules/playwright/index.mjs";
import { execFileSync } from "node:child_process";

(async () => {
  const browser = await chromium.launch({
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--enable-unsafe-swiftshader", "--use-gl=swiftshader"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto("https://hobbymice.com.tr/play/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(20000);

  // Guest cift tiklama yerine HESAPLI giris: Play as guest butonu civarinda
  // hesap girisi icin once guest giris yaptiktan sonra olmaz — Ruffle login
  // ekraninda hesap adi/sifre alanlari var. Textfield koordinatlari login
  // ekranindan: sola yatik "Player" alani ~ (250,300), sifre ~ (250,330)?
  // Bilinen guvenli yol: guest giris + /room yok — HESAPLI giris icin
  // klavye ile alan dolasimi: ilk alana tikla, yaz, tab/siradaki alana tikla.
  // Playwright'ta Ruffle textfield'lari DOM degil canvas oldugu icin koordinat
  // ile tiklanir. Login ekran duzeni (1280x800): ad alani ~ (300, 310),
  // sifre ~ (300, 350), giris butonu ~ (300, 395).
  await page.screenshot({ path: "/tmp/eco_login.png" });

  // Hesap adi alani (login ekranindan okunan koordinatlar: 1280x800)
  await page.mouse.click(340, 208);
  await page.waitForTimeout(600);
  await page.keyboard.type("HMEcoTest#0001", { delay: 30 });
  await page.waitForTimeout(400);
  // Sifre alani
  await page.mouse.click(340, 266);
  await page.waitForTimeout(600);
  await page.keyboard.type("EcoTest123!", { delay: 30 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: "/tmp/eco_login_filled.png" });
  // Submit butonu
  await page.mouse.click(340, 340);
  await page.waitForTimeout(15000);
  await page.screenshot({ path: "/tmp/eco_after_login.png" });

  // Komutlar: chat'e yaz (400,780 giris alani — bilinen koordinat)
  const runCmd = async (cmd, shot) => {
    await page.mouse.click(400, 780);
    await page.waitForTimeout(400);
    await page.keyboard.type(cmd, { delay: 20 });
    await page.keyboard.press("Enter");
    await page.waitForTimeout(5000);
    await page.screenshot({ path: shot });
    console.log("komut gonderildi:", cmd);
  };

  await runCmd("/cark", "/tmp/eco_cark1.png");
  await page.waitForTimeout(4000); // animasyonun bitmesini bekle
  await page.screenshot({ path: "/tmp/eco_cark2.png" });
  await runCmd("/cark", "/tmp/eco_cark_ikinci.png"); // ikinci deneme = "bugun cevirdin" mesaji
  await runCmd("/gorev", "/tmp/eco_gorev.png");
  await runCmd("/haftalik", "/tmp/eco_haftalik.png");

  const jout = execFileSync(
    "journalctl",
    ["-u", "transformice", "--since", "-5 min", "--no-pager"],
    { encoding: "utf8", timeout: 30000 },
  );
  const hits = jout.split("\n").filter(l => l.includes("[Cark]"));
  console.log(hits.length ? hits.join("\n") : "(journal'da [Cark] kaydi YOK)");
  await browser.close();
})().catch((e) => { console.error("TEST HATASI:", e.message); process.exit(1); });
