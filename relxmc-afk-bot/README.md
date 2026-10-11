# RelxMC AFK Bot

Bot AFK multi-akun untuk server Minecraft **play.relxmc.com**, dibangun dengan [mineflayer](https://github.com/PrismarineJS/mineflayer), lengkap dengan dashboard dan kontrol lewat **Discord**.

> **Catatan:** proyek ini tidak resmi dan tidak berafiliasi dengan RelxMC. Pastikan memakai bot AFK memang diizinkan oleh aturan server. Risiko (termasuk ban) ditanggung pemakai.

## Fitur

- **Multi akun** — tambah `BOT1`, `BOT2`, … di `.env`; login otomatis, masuk `ecocpvp`, lalu `/afk`.
- **Reconnect pintar** — menangani anti-bot check, maintenance, cooldown IP, dan reset server. Kalau server crash dan bot terlempar ke lobby, bot masuk lagi sendiri.
- **Watchdog** — bot yang berhenti merespons dipaksa reconnect.
- **Live dashboard di Discord** — embed status semua bot (shard, rate per jam, lokasi, ping, kesehatan) dan embed tab list pemain yang meniru tab di game.
- **Statistik shard** — saldo dibaca dari papan skor dan chat, plus estimasi shard per jam/hari.
- **Shardshop** — lihat isi shop (nama + harga) lewat menu pilihan di Discord, lalu beli; bot melaporkan item masuk ke hotbar nomor berapa.
- **Jual lewat `/ah sell`** dari hotbar.
- **Teleport & farm** — `/tpa`, `/spawn`, `/home`, `/warp`; jalan ke titik farm dan AFK di sana; `goto`, `pos`.
- **Kontrol** — `stop`, `start`, `restart` per bot.
- **Server Discord otomatis** — channel, role (Operator / Viewer), dan izin dibuat oleh bot.

## Persyaratan

- [Node.js](https://nodejs.org/) **18 atau lebih baru**
- Akun Minecraft untuk bot (server memakai `/login`)
- (Opsional) bot Discord — lihat [docs/PANDUAN-DISCORD.md](docs/PANDUAN-DISCORD.md)

## Instalasi

```bash
git clone https://github.com/liAnn09/relxmc-afk-bot.git
cd relxmc-afk-bot
npm install

cp .env.example .env        # Windows: copy .env.example .env
# lalu isi .env (akun bot, token Discord, dst.)

npm start
```

Ketik `help` di console untuk melihat semua command. Panduan menyiapkan Discord ada di [docs/PANDUAN-DISCORD.md](docs/PANDUAN-DISCORD.md).

## Konfigurasi (`.env`)

Semua pengaturan ada di `.env` (contoh lengkap: [`.env.example`](.env.example)).

| Nama | Arti |
|---|---|
| `HOST`, `PORT`, `VERSION` | Alamat server Minecraft dan versi protokol (bawaan `1.20.1`) |
| `BOTn_USERNAME`, `BOTn_PASSWORD` | Akun bot ke-n (`BOT1_...`, `BOT2_...`, dst.) |
| `BOTn_TARGET_X`, `BOTn_TARGET_Z` | Titik farm bot ke-n untuk `farm` (`0` = belum diatur; bisa juga lewat `setfarm`) |
| `AUTO_FARM` | `true` = setelah `/afk`, bot otomatis jalan ke titik farm |
| `DISCORD_TOKEN` | Token bot Discord. Kosong = fitur Discord mati |
| `DISCORD_GUILD_ID` | ID server Discord. Kosong = ketik `server create` di console |
| `DISCORD_*_CHANNEL_ID`, `DISCORD_*_ROLE_ID` | Diisi **otomatis** setelah server dibangun |
| `DISCORD_ALLOWED_USER_IDS` | ID pengguna yang selalu boleh memakai command (pisahkan koma) |
| `LIVE_AUTO_SECONDS` | Interval live otomatis di channel live (min. 5, `0` = mati) |
| `RECONNECT_DELAY` | Jeda reconnect biasa, milidetik (bawaan 90000) |
| `JUMP_MIN_MINUTES`, `JUMP_MAX_MINUTES` | Rentang acak lompat anti-AFK |
| `REJOIN_RETRY_DELAY`, `REJOIN_MAX_ATTEMPTS` | Percobaan masuk lagi ke ecocpvp setelah server crash |

## Command

Di Discord diawali `!` (atau kurung siku, mis. `[ping b1]`). Di console tanpa `!`.
`[bot]` = pilih bot (`b1`, `b2`, …); tanpa tag, command berlaku untuk **semua bot**.

| Kategori | Command |
|---|---|
| Monitor | `!status` · `!shards [bot]` · `!ping [bot]` · `!money [bot]` · `!rate [bot]` · `!players [bot] [nama]` · `!tab [bot]` · `!live [detik]` / `!live stop` |
| Shop & jual | `!shardshop [bot]` · `!buy [bot] [slot\|nama] [xN]` · `!hotbar [bot]` · `!ah [bot] [hotbar] <harga>` |
| Teleport & farm | `!tp <bot\|all> <pemain\|spawn\|home\|warp x>` · `!tpaccept [bot]` · `!farm [bot]` · `!setfarm <bot> [x z]` · `!goto <bot> <x> <z>` · `!pos [bot]` |
| Kontrol | `!stop <bot\|all>` · `!start [bot\|all]` · `!restart [bot\|all]` |
| Aksi | `!pay <player> <jumlah> [bot]` · `!say <pesan> [bot]` · `!cmd <perintah> [bot]` |
| Admin Discord | `!setup` · `!role add\|remove <@user> <operator\|viewer>` · `!owner` |

Khusus console: `bot stop\|start\|restart <b1\|all>` (karena `stop` di console berarti berhenti bergerak), `server create\|setup\|invite`, `w` `a` `s` `d` `space` `stop`.

## Struktur proyek

```
relxmc-afk-bot/
├── docs/
│   └── PANDUAN-DISCORD.md
├── src/
│   ├── core/
│   │   ├── bot.js
│   │   ├── config.js
│   │   ├── stats.js
│   │   └── utils.js
│   ├── discord/
│   │   ├── auth.js
│   │   ├── discordBot.js
│   │   ├── discordSetup.js
│   │   ├── envFile.js
│   │   ├── helpEmbed.js
│   │   ├── liveStatus.js
│   │   └── shopUi.js
│   ├── features/
│   │   ├── board.js
│   │   ├── farm.js
│   │   ├── hotbar.js
│   │   ├── inv.js
│   │   ├── items.js
│   │   ├── players.js
│   │   ├── rate.js
│   │   ├── shop.js
│   │   └── tp.js
│   ├── commands.js
│   └── index.js
├── .env.example
├── .gitignore
├── package-lock.json
├── package.json
└── README.md
```

| Berkas | Fungsi |
|---|---|
| `src/index.js` | Titik masuk: banner, Discord, console, bot pertama |
| `src/commands.js` | Command console (help, buy, ah, farm, bot stop/start, ...) |
| `src/core/bot.js` | Koneksi mineflayer, login, rejoin ecocpvp, reconnect, start/stop/restart |
| `src/core/config.js` | Membaca .env |
| `src/core/stats.js` | Statistik per akun (shard, sesi AFK, reconnect) |
| `src/core/utils.js` | Log berwarna, banner, bantuan console |
| `src/discord/discordBot.js` | Klien Discord & semua command "!" |
| `src/discord/discordSetup.js` | Pembangun server Discord (channel, role, izin), !setup, !role, !owner |
| `src/discord/liveStatus.js` | Embed live (status bot) + watchdog |
| `src/discord/shopUi.js` | Menu pilihan item /shardshop |
| `src/discord/helpEmbed.js` | Embed !help |
| `src/discord/auth.js` | Pengecekan izin pemakai command |
| `src/discord/envFile.js` | Menyimpan ID otomatis ke .env |
| `src/features/shop.js` | /shardshop: baca item, beli |
| `src/features/hotbar.js` | Hotbar & /ah sell |
| `src/features/inv.js` | Deteksi item baru di inventaris / hotbar |
| `src/features/items.js` | Pembaca nama & lore item |
| `src/features/board.js` | Papan skor (Money / Shards / Coins) |
| `src/features/rate.js` | Shard per jam & estimasi |
| `src/features/players.js` | Pemain online & tampilan tab list |
| `src/features/farm.js` | Titik farm, jalan (pathfinder), AFK di farm |
| `src/features/tp.js` | Teleport (/tpa, /spawn, /home, /warp) |

## Keamanan

- **Jangan pernah meng-commit `.env`.** Isinya password akun dan token Discord. `.gitignore` sudah mengecualikannya; yang ikut ke Git hanya `.env.example` (isi placeholder).
- Kalau token Discord atau password pernah terlanjur ter-upload, **segera ganti**: *Reset Token* di Discord Developer Portal dan ganti password akun.
- Command bot (`!pay`, `!buy`, `!cmd`, …) bisa menghabiskan uang dan shard. Setelah server Discord dibangun lewat `!setup`, hanya role **Operator**, admin, dan ID di `DISCORD_ALLOWED_USER_IDS` yang boleh memakainya.

## Pemecahan masalah

- **Bot Discord online tapi tidak merespons command** → aktifkan *Message Content Intent* di Developer Portal.
- **Bot ditolak "Please reconnect to verify (anti-bot check)"** → normal; bot otomatis mencoba lagi beberapa detik kemudian.
- **`!money` menampilkan `-`** → ketik `!money raw` untuk melihat isi papan skor, lalu sesuaikan.
- Masalah lain di bagian pemecahan masalah [panduan Discord](docs/PANDUAN-DISCORD.md).
