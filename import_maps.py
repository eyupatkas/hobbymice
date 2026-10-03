#!/usr/bin/env python3
"""HobbyMice map import:
- 95 vanilla maps (config/maps/vanilla)  -> mapeditor collection, category 0
- 41 validated event maps (/tmp/eventmaps) -> mapeditor, distributed by theme
- Missing event codes: Halloween 816/669/926 + Fishing 3000-3005 -> config/maps/special/
"""
import os, re, json, shutil, glob
import xml.etree.ElementTree as ET
from pymongo import MongoClient

VANILLA_DIR = "/root/projects/transformice/Transformice/config/maps/vanilla"
SPECIAL_DIR = "/root/projects/transformice/Transformice/config/maps/special"
EVENT_DIR = "/tmp/eventmaps"

def valid_map(path):
    try:
        r = ET.parse(path).getroot()
        if r.tag != "C":
            return False
        return r.find("Z") is not None
    except Exception:
        return False

client = MongoClient("mongodb://127.0.0.1:27017")
db = client["transformice3"]
maps_col = db["mapeditor"]
counter_col = db["counters"]

def next_id():
    doc = counter_col.find_one_and_update({"_id": "lastMapCode"}, {"$inc": {"value": 1}}, upsert=True, return_document=True)
    return doc["value"]

existing = maps_col.count_documents({})
print("mevcut DB haritasi:", existing)

imported = 0
if existing == 0:
    # --- vanilla 95 -> category 0 ---
    for f in sorted(glob.glob(VANILLA_DIR + "/*.xml")):
        code = int(re.search(r"(\d+)\.xml$", f).group(1))
        xml = open(f, encoding="utf-8").read()
        if not valid_map(f):
            print("  atlandi (gecersiz):", f)
            continue
        mid = next_id()
        maps_col.insert_one({
            "_id": mid, "mapCode": code, "mapCategory": 0,
            "mapAuthor": "Atelier 801", "mapXML": xml,
            "mapYesVotes": 100, "mapNoVotes": 0,
        })
        imported += 1
    print("vanilla aktarildi:", imported)

    # --- event maps -> temalik kategoriler ---
    theme_cat = {"Peche": 3, "Halloween": 9, "Paques": 5,
                 "Rentree": 1, "Inclassable": 1, "Saint Valentin": 1,
                 "Noel": 1, "Nouvel an": 1, "Salon 801": None}
    seen_hashes = set()
    ev = 0
    for root, dirs, files in os.walk(EVENT_DIR):
        for f in files:
            if not f.endswith(".xml"):
                continue
            p = os.path.join(root, f)
            theme = p.split("/")[3] if len(p.split("/")) > 3 else "Inclassable"
            cat = theme_cat.get(theme)
            if cat is None or not valid_map(p):
                continue
            xml = open(p, encoding="utf-8").read()
            import hashlib
            h = hashlib.sha256(xml.encode()).hexdigest()
            if h in seen_hashes:
                continue
            seen_hashes.add(h)
            mid = next_id()
            maps_col.insert_one({
                "_id": mid, "mapCode": mid, "mapCategory": cat,
                "mapAuthor": "Atelier 801 (event " + theme + ")",
                "mapXML": xml, "mapYesVotes": 50, "mapNoVotes": 0,
            })
            ev += 1
    print("event aktarildi:", ev)
else:
    print("DB bos degil, vanilla/event aktarimi atlandi")

# --- eksik etkinlik kodlari -> config/maps/special ---
# Halloween 816/669/926 + Fishing 3000-3005
need_halloween = [816, 669, 926]
need_fishing = [3000, 3001, 3002, 3003, 3004, 3005]
existing_special = set(int(re.search(r"(\d+)\.xml$", f).group(1)) for f in glob.glob(SPECIAL_DIR + "/*.xml"))
copied = 0
for code in need_halloween:
    if code in existing_special:
        continue
    candidates = [p for p in glob.glob(EVENT_DIR + "/Halloween/*/*.xml") if valid_map(p)]
    candidates.sort(key=os.path.getsize, reverse=True)
    for c in candidates:
        dst = os.path.join(SPECIAL_DIR, str(code) + ".xml")
        shutil.copy(c, dst)
        copied += 1
        break
for code in need_fishing:
    if code in existing_special:
        continue
    candidates = [p for p in glob.glob(EVENT_DIR + "/Peche/*/*.xml") if valid_map(p)]
    candidates.sort(key=os.path.getsize, reverse=True)
    taken = set(glob.glob(SPECIAL_DIR + "/300*.xml"))
    for c in candidates:
        if c in taken:
            continue
        dst = os.path.join(SPECIAL_DIR, str(code) + ".xml")
        shutil.copy(c, dst)
        copied += 1
        break
print("special'e kopyalanan:", copied)
print("special simdi:", sorted(int(re.search(r"(\d+)\.xml$", f).group(1)) for f in glob.glob(SPECIAL_DIR + "/*.xml")))
print("mapeditor toplam:", maps_col.count_documents({}))
