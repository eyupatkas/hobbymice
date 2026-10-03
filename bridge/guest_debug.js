// Instrumented guest-login test: Ruffle debug logs + explicit mouse sequences.
const { chromium } = require("/root/projects/transformice/bridge/node_modules/playwright");

(async () => {
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--enable-unsafe-swiftshader", "--use-gl=swiftshader"],
    ignoreDefaultArgs: ["--mute-audio"],
  });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    permissions: [],
  });
  const page = await ctx.newPage();
  const logs = [];
  page.on("console", (m) => {
    const t = m.type() + ": " + m.text();
    if (t.includes("socket") || t.includes("Socket") || t.includes("ERROR") ||
        t.includes("WARN") || t.includes("connection") || t.includes("login") ||
        t.includes("policy")) logs.push(t.slice(0, 200));
  });

  await page.goto("https://hobbymice.com.tr/play/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(15000);

  // canvas kutusunu olc
  const box = await page.evaluate(() => {
    const c = document.querySelector("ruffle-player");
    const r = c.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
  console.log("canvas kutusu:", JSON.stringify(box));

  // 1) once canvas'in bos bir yerine tikla (odak)
  await page.mouse.move(box.x + box.w / 2, box.y + box.h / 2);
  await page.mouse.click(box.x + box.w / 2, box.y + box.h / 2);
  await page.waitForTimeout(1000);

  // 2) "Play as guest" butonuna ACMALI tikla
  await page.mouse.move(260, 451);
  await page.waitForTimeout(400);
  await page.mouse.down();
  await page.waitForTimeout(120);
  await page.mouse.up();
  console.log("guest tiklandi");
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "/tmp/final/g_debug1.png" });

  // 3) bir diyalog acildiysa ortasina bir tik daha + ekran goruntusu
  await page.mouse.click(640, 400);
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "/tmp/final/g_debug2.png" });

  console.log("--- ilgili konsol kayitlari ---");
  for (const l of logs.slice(-20)) console.log(l);
  await browser.close();
})().catch((e) => {
  console.error("TEST HATASI:", e.message);
  process.exit(1);
});
