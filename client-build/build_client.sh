#!/bin/bash
# HobbyMice istemci derleme hatti (tek komut):
#   base_logo.swf -> string yamalar -> 3 varyant -> site dagitimi + guncel zip
# Kullanim: bash /root/projects/transformice/client-build/build_client.sh
set -e
export PATH=/opt/rabcdasm:$PATH
cd /root/projects/transformice/client-build

python3 << 'PYEOF'
import json, os, shutil, subprocess

BUILD = "/root/projects/transformice/client-build"
wd = os.path.join(BUILD, "work")

if os.path.exists(wd):
    shutil.rmtree(wd)
os.makedirs(os.path.join(wd, "swf"))
shutil.copy(os.path.join(BUILD, "base_logo.swf"), os.path.join(wd, "swf", "base_logo.swf"))
os.chdir(os.path.join(wd, "swf"))

TOOLS = "/opt/rabcdasm"
for tool in ("abcexport", "rabcdasm"):
    r = subprocess.run([os.path.join(TOOLS, tool), "base_logo.swf" if tool == "abcexport" else "base_logo-0.abc"], capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit(tool + " basarisiz: " + r.stderr[-400:])

d0 = os.path.join(wd, "swf", "base_logo-0")
cfg = json.load(open(os.path.join(BUILD, "rewrites.json")))
n = 0
for root, dirs, files in os.walk(d0):
    for fn in files:
        if not fn.endswith(".asasm"):
            continue
        p = os.path.join(root, fn)
        t = open(p, encoding="utf-8", errors="ignore").read()
        orig = t
        for a, b in cfg["rewrites"]:
            t = t.replace(a, b)
        if t != orig:
            open(p, "w", encoding="utf-8").write(t)
            n += 1
print("yamalanan dosya:", n)

VARIANTS = [("sunucu", "46.224.194.227"), ("tarayici", "hobbymice.com.tr"), ("localhost", None)]
SITE = "/var/www/hobbymice"

for name, target in VARIANTS:
    vd = os.path.join(wd, "v_" + name)
    os.makedirs(vd, exist_ok=True)
    for root, dirs, files in os.walk(d0):
        rel = os.path.relpath(root, d0)
        dst_root = os.path.join(vd, rel) if rel != "." else vd
        os.makedirs(dst_root, exist_ok=True)
        for fn in files:
            shutil.copy(os.path.join(root, fn), os.path.join(dst_root, fn))
    if target:
        for root, dirs, files in os.walk(vd):
            for fn in files:
                if not fn.endswith(".asasm"):
                    continue
                p = os.path.join(root, fn)
                t = open(p, encoding="utf-8", errors="ignore").read()
                if "127.0.0.1" in t:
                    open(p, "w", encoding="utf-8").write(t.replace("127.0.0.1", target))
    asasm = os.path.join(vd, "base_logo-0.main.asasm")
    r = subprocess.run([os.path.join(TOOLS, "rabcasm"), asasm], capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit("rabcasm basarisiz: " + r.stderr[-400:])
    abc = os.path.join(vd, "base_logo-0.main.abc")
    out = os.path.join(BUILD, "158_" + name + ".swf")
    shutil.copy(os.path.join(wd, "swf", "base_logo.swf"), out)
    r = subprocess.run([os.path.join(TOOLS, "abcreplace"), out, "0", abc], capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit("abcreplace basarisiz: " + r.stderr[-400:])
    # NOT: Steam banner GÖRSELI SWF icinde DEGIL — istemci login ekraninda
    # "x_divers/x_steam.png" dosyasini /res/tfm-images uzerinden runtime'da
    # yukler. Gorsel degisimi sunucu tarafindadir: nginx'te
    # "location = /res/tfm-images/x_divers/x_steam.png" override'u + generator:
    # client-build/assets/make_x_steam_banner.py. SWF icindeki DefineBinaryData
    # yamasi (swfbinextract/replace) DENENDI ve gereksiz bulundu: blob'lar ic
    # ice SWF oyun varliklaridir (FLA/chat), banner iliskisiz; sikismis blob
    # icinde bayt degistirmek zlib akisini bozar (Ruffle+projector test edildi).

    print(name, "OK", os.path.getsize(out))

import zipfile, hashlib
LAUNCHER = "/root/projects/transformice/launcher"
ELECTRON = "/root/projects/transformice/electron-launcher/dist/HobbyMice-win32-x64"
zp = os.path.join(SITE, "dl", "Hobby-Mice.zip")
zpt = zp + ".tmp"   # atomik yazim: indirme sirasinda yarim dosya servis edilmesin
z = zipfile.ZipFile(zpt, "w", zipfile.ZIP_DEFLATED)
for root, dirs, files in os.walk(ELECTRON):
    for fn in files:
        full = os.path.join(root, fn)
        rel = os.path.relpath(full, ELECTRON)
        z.write(full, os.path.join("HobbyMice", rel))
z.write(os.path.join(BUILD, "158_sunucu.swf"), os.path.join("HobbyMice", "HobbyMice.swf"))
z.write(os.path.join(LAUNCHER, "OKUBENI.txt"), os.path.join("HobbyMice", "OKUBENI.txt"))
z.close()
os.replace(zpt, zp)   # atomik degistirme
zbytes = os.path.getsize(zp)
zsha = hashlib.sha256(open(zp, "rb").read()).hexdigest()
shutil.copy(os.path.join(BUILD, "158_tarayici.swf"), os.path.join(SITE, "play", "TFM.swf"))
shutil.copy(os.path.join(BUILD, "158_sunucu.swf"), os.path.join(SITE, "dl", "HobbyMice.swf"))

# surum manifestosu: site butonlari ?v= ile cache-kiran adres kurar + boyut/SHA dogrulamasi
import time
version = int(time.time())
with open(os.path.join(SITE, "dl", "version.json"), "w") as f:
    json.dump({"v": version, "zip": "Hobby-Mice.zip", "swf": "HobbyMice.swf",
               "bytes": zbytes, "sha256": zsha}, f)
print("version.json yazildi: v =", version, "| zip:", zbytes, "bayt | sha256:", zsha[:16])
print("zip + swf dagitimi tamam:", os.path.getsize(zp) // 1024 // 1024, "MB")
PYEOF
