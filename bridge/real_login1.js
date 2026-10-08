// Real-credential browser login test (step-by-step visual verification).
const { chromium } = require("/root/projects/transformice/bridge/node_modules/playwright");

(async () => {
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--enable-unsafe-swiftshader", "--use-gl=swiftshader"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const logs = [];
  page.on("websocket", (ws) => {
    logs.push("WS: " + ws.url().split("/").pop() + " acildi");
    ws.on("close", () => logs.push("WS: " + ws.url().split("/").pop() + " kapandi"));
  });

  await page.goto("https://hobbymice.com.tr/play/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(16000);
  await page.screenshot({ path: "/tmp/final/rl_1_login.png" });

  // nickname alani (ekran goruntusune gore sol taraf, ustkisim ~ y=280)
  await page.mouse.click(280, 280); await page.waitForTimeout(600);
  await page.keyboard.type("info@in3dex.com", { delay: 50 });
  await page.screenshot({ path: "/tmp/final/rl_2_nick.png" });

  // sifre alani
  await page.mouse.click(280, 320); await page.waitForTimeout(600);
  await page.keyboard.type(process.env.HM_TEST_PASS || "", { delay: 50 });
  await page.screenshot({ path: "/tmp/final/rl_3_pass.png" });

  console.log("--- WS olaylari ---");
  for (const l of logs) console.log(l);
  console.log("3 ekran goruntusu alindi; koordinat kontrolu icin duraklatiliyor");
  await browser.close();
})().catch((e) => { console.error("HATA:", e.message); process.exit(1); });
