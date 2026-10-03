#!/usr/bin/env python3
"""Maps.db onayli oyuncu haritalarini (Code>245) mapeditor koleksiyonuna aktarir.
Sadece MongoDB'ye yazar; dosya sistemi islemi yapmaz.
"""
import sqlite3
import defusedxml.ElementTree as ET
from pymongo import MongoClient

MAPS_DB = "/tmp/Maps.db"
MAX_XML = 200 * 1024

def valid_map(xml):
    if not xml or len(xml) > MAX_XML:
        return False
    head = xml[:512].upper()
    if "<!DOCTYPE" in head or "<!ENTITY" in head:
        return False
    try:
        r = ET.fromstring(xml)
        return r.tag == "C" and r.find("Z") is not None and len(xml) >= 50
    except Exception:
        return False

def perma_to_category(perma):
    try:
        p = int(perma)
    except Exception:
        return 5
    return p if 0 <= p <= 9 else 5

db = sqlite3.connect(MAPS_DB)
cur = db.cursor()
client = MongoClient("mongodb://127.0.0.1:27017")
mdb = client["transformice3"]
maps_col = mdb["mapeditor"]
counter_col = mdb["counters"]

def next_id():
    doc = counter_col.find_one_and_update({"_id": "lastMapCode"}, {"$inc": {"value": 1}}, upsert=True, return_document=True)
    return doc["value"]

inserted = 0
seen = set()
for row in cur.execute("SELECT Name, Code, XML, YesVotes, NoVotes, Perma, Player FROM maps WHERE Code > 245 ORDER BY Code"):
    name, code, xml, yes, no, perma, player = row
    if code is None or not valid_map(xml or ""):
        continue
    key = (int(code), len(xml))
    if key in seen:
        continue
    seen.add(key)
    who = (player or name or "Bilinmeyen").strip()[:40] or "Bilinmeyen"
    mid = next_id()
    maps_col.insert_one({
        "_id": mid, "mapCode": int(code), "mapCategory": perma_to_category(perma),
        "mapAuthor": who, "mapXML": xml,
        "mapYesVotes": int(yes or 0), "mapNoVotes": int(no or 0),
    })
    inserted += 1

print("eklenen oyuncu haritasi:", inserted)
for cat in range(10):
    print(f"  kategori {cat}:", maps_col.count_documents({"mapCategory": cat}))
print("mapeditor toplam:", maps_col.count_documents({}))
