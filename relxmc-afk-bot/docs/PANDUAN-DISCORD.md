# Panduan Server Discord untuk RelxMC Bot

Bot bisa membangun server Discord lengkap (channel, kategori, role, izin, panduan) secara otomatis.

## 1. Siapkan bot di Discord Developer Portal

1. Buka <https://discord.com/developers/applications> → **New Application**.
2. Menu **Bot** → **Reset Token** → salin token-nya.
3. Di halaman Bot yang sama, aktifkan **Message Content Intent** (wajib, kalau tidak bot tidak bisa membaca `!help`, `!live`, dst).
4. Salin `.env.example` menjadi `.env`, lalu isi `DISCORD_TOKEN=` dengan token tadi.
   Token = kunci bot. Jangan dibagikan ke siapa pun.

## 2. Jalankan bot

```
npm install
npm start
```

Karena `DISCORD_GUILD_ID` masih kosong, console menampilkan dua pilihan. Pilih salah satu:

### Pilihan A — bot membuat server baru (paling praktis)

1. Ketik di console: `server create`
2. Console menampilkan **link undangan sekali pakai** (berlaku 24 jam). Klik, lalu bergabung.
3. Di server itu ketik `!owner` → kamu menjadi **pemilik** server dan otomatis mendapat role **🤖 Operator**.

> Discord hanya mengizinkan bot membuat server kalau bot ada di kurang dari 10 server. Kalau ditolak, pakai Pilihan B.

### Pilihan B — pakai server yang sudah ada / buat sendiri

1. Buat server kosong di Discord (tombol **+** di daftar server).
2. Ketik di console: `server invite` → buka link-nya → undang bot ke server itu.
3. Salin ID server (klik kanan ikon server → **Copy Server ID**, aktifkan Developer Mode dulu di Pengaturan → Lanjutan).
4. Isi `DISCORD_GUILD_ID=` di `.env`, lalu jalankan ulang `npm start`.
   (Atau tanpa restart: ketik `!setup` di server itu sebagai admin.)

Bot membutuhkan izin **Manage Channels** dan **Manage Roles** (sudah termasuk di link undangan dari `server invite`).

## 3. Struktur yang dibuat

| Kategori | Channel | Siapa yang bisa lihat | Siapa yang bisa kirim pesan |
|---|---|---|---|
| 📌 INFO | 📖-panduan | Semua orang | Bot saja |
| 📊 MONITOR | 📈-live | Viewer, Operator | Bot saja (status otomatis) |
| 📊 MONITOR | 📜-bot-log | Viewer, Operator | Bot saja (log console) |
| 🎮 KONTROL | 🎮-bot-command | Operator | Operator |

| Role | Fungsi |
|---|---|
| 🤖 **Operator** | Boleh memakai semua command bot (`!buy`, `!pay`, `!ah`, `!tp`, `!stop`, dst). Bisa melihat live & log. |
| 👀 **Viewer** | Hanya boleh **melihat** live & log. Tidak bisa memberi perintah. |

Admin server dan pemilik selalu boleh memakai command tanpa role.
Command hanya jalan untuk Operator / admin / ID di `DISCORD_ALLOWED_USER_IDS`, jadi orang lain tidak bisa menghabiskan shard atau uangmu.

ID channel dan role otomatis disimpan ke `.env`, jadi tidak dibuat ulang saat bot di-restart.

## 4. Mengatur role

Hanya admin yang bisa:

```
!role add @nama operator      beri role Operator
!role add @nama viewer        beri role Viewer
!role remove @nama operator   cabut role
!role add 123456789012345678 viewer   (bisa pakai ID pengguna)
```

## 5. Command admin lainnya

| Command | Fungsi |
|---|---|
| `!setup` | Bangun / perbaiki struktur server (aman diulang, tidak membuat duplikat) |
| `!owner` | Ambil alih kepemilikan server yang dibuat bot (hanya sekali, hanya jika bot masih pemiliknya) |
| `server create` / `server setup` / `server invite` | Versi console dari hal di atas |

## 6. Pengaturan opsional di `.env`

| Nama | Arti |
|---|---|
| `DISCORD_ALLOWED_USER_IDS` | ID pengguna yang selalu boleh memakai command (pisahkan koma) |
| `LIVE_AUTO_SECONDS` | Interval live otomatis di `#📈-live` (min. 5, `0` = mati). Diisi `10` saat setup kalau masih kosong |

## 7. Kalau ada masalah

- **Bot online tapi tidak merespons command** → Message Content Intent belum aktif (langkah 1.3).
- **`!setup` gagal** → bot butuh izin Manage Channels & Manage Roles, dan role bot harus berada **di atas** role Operator/Viewer (Pengaturan Server → Role → seret role bot ke atas).
- **`!role` gagal** → sama: role bot harus di atas role yang diberikan.
- **`server create` ditolak** → pakai Pilihan B.
- **Channel terhapus tidak sengaja** → ketik `!setup`, bot membuatnya lagi.
