const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const https = require("https");
const net = require("net");
const zlib = require("zlib");

const GAME_HOST = "hobbymice.com.tr";
const GAME_PORT = 11801;
const GAME_URL = "https://hobbymice.com.tr/dl/HobbyMice.swf";
const LAUNCHER_VERSION = "v5";

const IS_WIN = process.platform === "win32";
// Taban projector paketin icinde (resources/app) tasinir.
// Isimler sabit; safeJoin yalnizca temiz basename kabul eder.
function safeJoin(root, name) {
  if (typeof name !== "string" || name.length === 0 ||
      name.includes("/") || name.includes("\\") || name.includes("..")) {
    throw new Error("Gecersiz dosya adi: " + name);
  }
  const target = path.resolve(root, name);
  if (target !== root && !target.startsWith(root + path.sep)) {
    throw new Error("Kok disina cikis yasak: " + name);
  }
  return target;
}
const APP_DIR = path.resolve(__dirname);
// Calisma dizini launcher'in kendi klasoru olsun
const APP_ROOT = path.resolve(path.dirname(app.getPath("exe")));
process.chdir(APP_ROOT);
const PLAYER_EXE = safeJoin(APP_DIR, IS_WIN ? "flashplayer.exe" : "flashplayer");
// Oyun exe'si ELEKTRON DOSYALARINDAN IZOLE temiz klasorde uretilir:
// launcher klasorundeki dll'ler projector'in render'ini bozuyor (beyaz ekran)
const GAME_DIR = safeJoin(APP_ROOT, "oyun");
const GAME_EXE = safeJoin(GAME_DIR, IS_WIN ? "HobbyMice-Oyun.exe" : "HobbyMice-Oyun"); // SWF gömulu oyun exe'si
const CACHE_SWF = "HobbyMice.swf";

let win = null;

function sendStatus(text) {
  if (win && !win.isDestroyed()) win.webContents.send("status", text);
}

function sendProgress(percent) {
  if (win && !win.isDestroyed()) win.webContents.send("progress", percent);
}

// SWF'yi sunucudan indirir; yerel kopya guncelse indirmeden gecer.
// Sunucuya ulasilamiyorsa mevcut cache ile devam eder.
function ensureSwf() {
  return new Promise((resolve, reject) => {
    const useCache = () => {
      if (fs.existsSync(CACHE_SWF) && fs.statSync(CACHE_SWF).size > 500000) {
        resolve({ skipped: true });
        return true;
      }
      return false;
    };
    const head = https.request(GAME_URL, { method: "HEAD" }, (res) => {
      res.resume();
      const remoteTime = new Date(res.headers["last-modified"] || 0).getTime();
      if (fs.existsSync(CACHE_SWF) && fs.statSync(CACHE_SWF).mtimeMs >= remoteTime) {
        resolve({ skipped: true });
        return;
      }
      const get = https.get(GAME_URL, (res2) => {
        if (res2.statusCode !== 200) {
          reject(new Error("HTTP " + res2.statusCode));
          return;
        }
        const total = parseInt(res2.headers["content-length"] || "0", 10);
        const tmp = CACHE_SWF + ".tmp";
        const out = fs.createWriteStream(tmp);
        let done = 0;
        res2.on("data", (c) => {
          done += c.length;
          if (total) {
            const pct = Math.floor((done / total) * 100);
            sendStatus("Guncel oyun dosyasi indiriliyor... %" + pct);
            sendProgress(pct);
          }
          out.write(c);
        });
        res2.on("end", () => {
          out.end(() => {
            fs.renameSync(tmp, CACHE_SWF);
            resolve({ skipped: false });
          });
        });
        res2.on("error", () => {
          out.destroy();
          try { fs.unlinkSync(tmp); } catch (e) {}
          if (!useCache()) reject(new Error("Indirme kesildi"));
        });
        out.on("error", reject);
      });
      get.on("error", () => {
        if (!useCache()) reject(new Error("Indirme baslatilamadi"));
      });
    });
    head.on("error", () => {
      if (!useCache()) reject(new Error("Sunucuya ulasilamadi"));
    });
    head.end();
  });
}

// CWS (zlib) SWF'yi FWS (sikistirmasiz) cevirir — projector'in gömulu
// SWF icin en garantili bicimi
function swfToPlain(buf) {
  const sig = buf.slice(0, 3).toString("latin1");
  if (sig === "FWS") return buf;
  if (sig !== "CWS") return buf;
  const ver = buf[3];
  const declaredLen = buf.readUInt32LE(4);
  const body = zlib.inflateSync(buf.slice(8));
  const head = Buffer.alloc(8);
  head.write("FWS", 0, "latin1");
  head[3] = ver;
  head.writeUInt32LE(8 + body.length, 4);
  if (declaredLen !== 8 + body.length) throw new Error("SWF bozuk (uzunluk eslesmedi)");
  return Buffer.concat([head, body]);
}

// Oyun exe'sini uretir: [flash player] + [SWF] + [0xFA123456][SWF boyutu].
// Adobe projector bu kuyrugu gorunce SWF'yi OTOMATIK baslatir — hicbir
// arguman gerekmez, beyaz ekran riski yok. SWF degismediyse dokunmaz.
function buildGameExe() {
  const swfBuf = swfToPlain(fs.readFileSync(CACHE_SWF));
  const swfMtime = fs.statSync(CACHE_SWF).mtimeMs;
  if (fs.existsSync(GAME_EXE)) {
    const st = fs.statSync(GAME_EXE);
    if (st.mtimeMs >= swfMtime && st.size > swfBuf.length) return;
  }
  sendStatus("Oyun dosyasi hazirlaniyor...");
  const player = fs.readFileSync(PLAYER_EXE);
  const trailer = Buffer.alloc(8);
  trailer.writeUInt32LE(0xFA123456, 0);
  trailer.writeUInt32LE(swfBuf.length, 4);
  fs.mkdirSync(GAME_DIR, { recursive: true });
  const tmp = GAME_EXE + ".new";
  fs.writeFileSync(tmp, player);
  fs.appendFileSync(tmp, swfBuf);
  fs.appendFileSync(tmp, trailer);
  try {
    fs.renameSync(tmp, GAME_EXE);
  } catch (e) {
    // Oyun exe'si calisirken degistirilemiyorsa eskiyle baslat;
    // guncelleme bir sonraki acilista uygulanir
    if (!fs.existsSync(GAME_EXE)) throw e;
  }
  try { fs.unlinkSync(tmp); } catch (e) {}
}

function createWindow() {
  win = new BrowserWindow({
    width: 1100,
    height: 640,
    resizable: true,
    autoHideMenuBar: true,
    backgroundColor: "#1b2a4a",
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });
  win.loadFile("index.html");
  win.setMenuBarVisibility(false);
}

ipcMain.handle("server-status", () => {
  return new Promise((resolve) => {
    const s = net.connect(GAME_PORT, GAME_HOST);
    const timeout = setTimeout(() => {
      s.destroy();
      resolve("offline");
    }, 3000);
    s.on("connect", () => {
      clearTimeout(timeout);
      s.destroy();
      resolve("online");
    });
    s.on("error", () => {
      clearTimeout(timeout);
      resolve("offline");
    });
  });
});

// OYNA: guncel SWF indirilir (ilerleme cubuguyla), SWF flash player'in
// sonuna gomulerek oyun exe'si uretilir ve argumansiz acilir
ipcMain.handle("play", async () => {
  if (!fs.existsSync(PLAYER_EXE)) {
    sendStatus(PLAYER_EXE + " bulunamadi!");
    return false;
  }
  sendStatus("Guncel SWF kontrol ediliyor...");
  try {
    await ensureSwf();
  } catch (e) {
    sendStatus("SWF indirilemedi: " + e.message);
    return false;
  }
  if (!fs.existsSync(CACHE_SWF) || fs.statSync(CACHE_SWF).size < 500000) {
    sendStatus("SWF dosyasi gecersiz, tekrar deneyin!");
    return false;
  }
  try {
    buildGameExe();
  } catch (e) {
    sendStatus("Oyun dosyasi olusturulamadi: " + e.message);
    return false;
  }
  sendStatus("Oyun baslatiliyor...");
  const err = await shell.openPath(GAME_EXE);
  if (err) {
    sendStatus("Oyun acilamadi: " + err);
    return false;
  }
  sendStatus("Oyun acildi! Iyi eglenceler");
  return true;
});

app.whenReady().then(() => {
  createWindow();
});
app.on("window-all-closed", () => app.quit());
