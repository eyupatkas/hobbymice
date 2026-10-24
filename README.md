# HobbyMice — Transformice Private Server

A complete Transformice private server stack: the Java game server (1.889 protocol emulator), a Next.js website (forum / blog / rankings / admin), a Ruffle WebSocket-to-TCP bridge so the game runs in modern browsers, an Electron desktop launcher, client build tooling and a watchdog.

> Türkçe özet için aşağıdaki **Kurulum (TR)** bölümüne bakın.

This is a fork/derivative of the open-source [NoFileFound/Transformice](https://github.com/NoFileFound/Transformice) emulator with many fixes, features and integrations added while running [hobbymice.com.tr](https://hobbymice.com.tr).

## Repository layout

| Path | What it is |
|---|---|
| `Transformice/` | Java 22 / Maven game server emulator (`src/`, `pom.xml`, `config/`) + start/stop scripts |
| `website/` | Next.js website: forum, blog (AI-assisted), rankings, admin panel, i18n (TR/EN/FR/ES) |
| `bridge/` | Ruffle WebSocket→TCP bridge, E2E browser tests (Playwright) |
| `client-build/` | Client SWF build pipeline (rabcdasm patches, server-IP variants) |
| `electron-launcher/` | Electron desktop launcher |
| `watchdog/` | Deterministic server watchdog (service/port/backup/security checks) |
| `import_maps.py`, `import_mapsdb.py` | Map importers |

## Server (Java)

Requirements: **Java 22**, **MongoDB**, Maven (or IntelliJ IDEA).

```bash
cd Transformice
mvn package                # or build in IntelliJ
# edit config/properties.json -> database_url points to your MongoDB
./baslat.sh                # starts mongod if needed + the server (ports 11801 12801 13801 14801)
./durdur.sh                # stops it
```

Config lives in `Transformice/config/properties.json` (database URL, ports, gameplay options) and `Transformice/config/server/` + `config/client/` (game data: shop, NPCs, captcha, promotions…). Secrets (`yt_key`, `smtpUsername`, `smtpPassword`) were **removed before publishing** — fill in your own.

`config/GeoIP.dat` is not included: download a GeoIP/GeoLite database yourself if you want country lookups.

## Website (Next.js)

```bash
cd website
npm install
npm run build && npm start   # port 8010
```

Talks to MongoDB directly (`accounts`, `forum_*`, `blog_*` collections) and proxies the game.

## Bridge (browser play)

`bridge/server.js` accepts WebSocket connections from the Ruffle player and forwards them to the game server's TCP port, so no Flash plugin is needed.

## Docs

`Transformice/docs/` — FAQ (languages, shop). `GELISTIRME-GUNLUGU.md` — a long Turkish dev log of everything that was fixed/added (protocol quirks, packet floods, client patches, watchdog design). `GELISTIRME-BACKLOG.md` — known TODOs.

## License / legal

Transformice is a game by [Atelier 801](https://www.atelier801.com/). This repository contains **server emulator source code and tooling only** — no game client, art or SWF assets are included. Run a private server at your own risk and respect the original game's terms.
