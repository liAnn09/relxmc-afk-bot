const readline = require('readline');
const { accounts } = require('./core/config');
const { log, randomDelay, printStatus, countShards, printHelp } = require('./core/utils');
const { botMap, controlBots } = require('./core/bot');
const { readBoard, shardsText } = require('./features/board');
const { rateText } = require('./features/rate');
const { buildTp } = require('./features/tp');
const { farmSpot, setFarmSpot, posOf, walkTo, goFarm } = require('./features/farm');
const stats = require('./core/stats');
const { snapshot: playersSnapshot, playersText } = require('./features/players');
const { serverAdmin } = require('./discord/discordBot');
const { buyItem, listShop, parseBuyArgs, formatShop } = require('./features/shop');
const { gotMessage } = require('./features/inv');
const { pickBot, pickSellBot, parseAhArgs, hotbarLines, sellHotbar, sellResultText } = require('./features/hotbar');

function resolveBots(tag) {
  if (!tag) return Array.from(botMap.values());
  const clean = tag.toLowerCase().replace('b', '');
  const n = parseInt(clean);
  if (!isNaN(n) && botMap.has(n)) return [botMap.get(n)];
  return [];
}

function nameOf(bot) {
  return accounts.find(a => a.id === bot.accId)?.username || 'Bot';
}

function setupCommands() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('line', (line) => {
    // Hilangkan tanda [ dan ] jika pengguna mengetik contohnya [ping] atau [buy b1]
    const cleanedLine = line.trim().replace(/^\[/, '').replace(/\]$/, '').trim();
    const parts = cleanedLine.split(/\s+/);
    if (parts.length === 0 || !parts[0]) return;

    const action = parts[0].toLowerCase();

    // ====== shop [b1] ======
    // Lihat isi /shardshop beserta nomor slot-nya
    if (action === 'shop') {
      const targetBots = resolveBots(parts[1]);
      if (targetBots.length === 0) {
        console.log(`Bot ${parts[1] || ''} tidak aktif.`);
        return;
      }
      const bot = targetBots[0];
      listShop(bot, nameOf(bot)).then((res) => {
        if (!res.ok) return console.log(`[SHOP ERROR] ${res.info}`);
        console.log(`\n── Isi /shardshop (slot → item) ──`);
        formatShop(res.items).forEach((l) => console.log('  ' + l));
        console.log('Beli: buy [b1] <slot|nama> [x3]   contoh: buy b1 21   |   buy money x3\n');
      });
      return;
    }

    // ====== help ======
    if (action === 'help' || action === '?') {
      printHelp();
      return;
    }

    // ====== buy [b1] [slot|nama] [xN] ======
    // Contoh: buy | buy b1 | buy 21 | buy b2 21 | buy b1 money x3
    // Alur: /shardshop → klik item pilihan → GUI konfirmasi → klik Confirm hijau
    if (action === 'buy') {
      const opt = parseBuyArgs(parts.slice(1));
      const targetBots = resolveBots(opt.botTag);
      if (targetBots.length === 0) {
        console.log(`Bot ${opt.botTag || ''} tidak aktif.`);
        return;
      }

      targetBots.forEach(async (bot) => {
        const username = nameOf(bot);
        const what = opt.slot !== null ? `slot ${opt.slot}` : opt.keyword ? `"${opt.keyword}"` : 'Money (default)';
        log(username, `Beli ${what}${opt.times > 1 ? ` x${opt.times}` : ''} di /shardshop...`);
        const res = await buyItem(bot, username, { slot: opt.slot, keyword: opt.keyword }, opt.times);
        log(username, res.ok
          ? `[BUY COMPLETE] ${res.done}x berhasil. ${res.info}`
          : `[BUY ERROR] ${res.done}/${res.times} berhasil. ${res.info}`);
        const where = gotMessage(res.got, bot.accId, '');
        if (where) where.split('\n').forEach((l) => log(username, `[BUY] ${l}`));
      });
      return;
    }

    // ====== hotbar [b1] ======
    if (action === 'hotbar') {
      const bot = pickBot(parts[1]);
      if (!bot) {
        console.log(`Bot ${parts[1] || ''} tidak aktif.`);
        return;
      }
      console.log(`\n── Hotbar ${nameOf(bot)} ──`);
      hotbarLines(bot).forEach((l) => console.log('  ' + l));
      console.log('Jual: ah [b1] <hotbar 1-9> <harga>   contoh: ah b1 3 5000\n');
      return;
    }

    // ====== ah [b1] [hotbar 1-9] <harga> ======
    // Jual item dari hotbar lewat /ah sell. Tanpa nomor hotbar = item yang terakhir dibeli.
    if (action === 'ah') {
      const opt = parseAhArgs(parts.slice(1));
      const bot = pickSellBot(opt.botTag);
      if (!bot) {
        console.log(opt.botTag
          ? `Bot ${opt.botTag} tidak aktif.`
          : 'Ada lebih dari 1 bot aktif dan belum ada yang baru beli item. Sebutkan botnya, contoh: ah b1 3 5000');
        return;
      }
      const hotbar = opt.hotbar !== null ? opt.hotbar : (bot._lastBought ? bot._lastBought.hotbar : null);
      if (!opt.price || hotbar === null) {
        console.log('Format: ah [b1] <hotbar 1-9> <harga>   contoh: ah 3 5000  (tanpa hotbar = item terakhir yang dibeli)');
        return;
      }
      const username = nameOf(bot);
      sellHotbar(bot, username, hotbar, opt.price).then((res) => {
        log(username, res.ok ? `[BUY AH LISTED] ${sellResultText(res)}` : `[BUY AH ERROR] ${res.info}`);
      });
      return;
    }

    // ====== money [b1] [raw] ======
    // Saldo Money / Shards / Coins dari papan skor (sidebar). "money raw" = tampilkan semua baris mentah.
    if (action === 'money') {
      const raw = parts.slice(1).some((p) => p.toLowerCase() === 'raw');
      const tag = parts.slice(1).find((p) => /^b?\d+$/i.test(p));
      const targetBots = resolveBots(tag);
      if (targetBots.length === 0) {
        console.log(`Bot ${tag || ''} tidak aktif.`);
        return;
      }
      targetBots.forEach((bot) => {
        const b = readBoard(bot);
        console.log(`\n── Papan skor ${nameOf(bot)}${b.title ? ` (${b.title})` : ''} ──`);
        if (!b.lines.length) {
          console.log('  Papan skor tidak terbaca (bot di lobby / belum dimuat).');
        } else if (raw) {
          b.lines.forEach((l) => console.log('  ' + l));
        } else {
          console.log(`  Money : ${b.values.money || '-'}`);
          console.log(`  Shards: ${b.values.shards || '-'}`);
          console.log(`  Coins : ${b.values.coins || '-'}`);
          if (!b.values.money && !b.values.shards) console.log('  (label tidak ditemukan — coba: money raw)');
        }
      });
      console.log('');
      return;
    }

    // ====== rate [b1] ======
    if (action === 'rate') {
      const n = parts[1] ? parseInt(parts[1].replace(/^b/i, '')) : null;
      console.log(rateText(isNaN(n) ? null : n));
      return;
    }

    // ====== bot <stop|start|restart> [b1|all] ======
    // (di console "stop" sudah dipakai untuk berhenti bergerak, jadi pakai awalan "bot")
    if (action === 'bot') {
      const sub = (parts[1] || '').toLowerCase();
      if (!['stop', 'start', 'restart'].includes(sub)) {
        console.log('Format: bot <stop|start|restart> <b1|all>');
        return;
      }
      if (sub === 'stop' && !parts[2]) {
        console.log('Sebutkan bot: bot stop b1  atau  bot stop all');
        return;
      }
      controlBots(sub, parts[2]).forEach((r) => console.log(`${r.ok ? '✅' : '❌'} ${r.info}`));
      return;
    }

    // ====== tp <b1|all> <pemain|spawn|home [nama]|warp <nama>> ======
    if (action === 'tp') {
      const tag = (parts[1] || '').toLowerCase();
      if (!(tag === 'all' || /^b\d+$/.test(tag))) {
        console.log('Sebutkan bot: tp b1 <tujuan>  atau  tp all <tujuan>   (tujuan: pemain | spawn | home [nama] | warp <nama>)');
        return;
      }
      const tp = buildTp(parts.slice(2));
      if (tp.error) return console.log(tp.error);
      const targetBots = resolveBots(tag === 'all' ? null : tag);
      if (targetBots.length === 0) return console.log(`Bot ${tag} tidak aktif.`);
      targetBots.forEach((bot) => {
        bot.chat(tp.cmd);
        log(nameOf(bot), `[CMD SENT] ${tp.cmd}`);
      });
      return;
    }

    // ====== tpaccept [b1|all] ======
    if (action === 'tpaccept') {
      const targetBots = resolveBots(!parts[1] || parts[1].toLowerCase() === 'all' ? null : parts[1]);
      if (targetBots.length === 0) return console.log(`Bot ${parts[1] || ''} tidak aktif.`);
      targetBots.forEach((bot) => {
        bot.chat('/tpaccept');
        log(nameOf(bot), '[CMD SENT] /tpaccept');
      });
      return;
    }

    // ====== pos [b1] ======
    if (action === 'pos') {
      const targetBots = resolveBots(!parts[1] || parts[1].toLowerCase() === 'all' ? null : parts[1]);
      if (targetBots.length === 0) return console.log(`Bot ${parts[1] || ''} tidak aktif.`);
      targetBots.forEach((bot) => {
        const p = posOf(bot);
        const f = farmSpot(bot.accId);
        const dist = p && f ? Math.round(Math.hypot(p.x - f.x, p.z - f.z)) : null;
        log(nameOf(bot), `[POS] ${p ? `X:${p.x} Y:${p.y} Z:${p.z}` : 'belum diketahui'} | lokasi: ${stats.get(bot.accId).location}` +
          (f ? ` | farm: X:${f.x} Z:${f.z}${dist !== null ? ` (${dist} blok)` : ''}` : ' | farm: belum diatur'));
      });
      return;
    }

    // ====== goto <b1> <x> <z> ======
    if (action === 'goto') {
      const x = parseInt(parts[2]);
      const z = parseInt(parts[3]);
      if (!/^b\d+$/i.test(parts[1] || '') || isNaN(x) || isNaN(z)) return console.log('Format: goto <b1> <x> <z>');
      const bot = resolveBots(parts[1])[0];
      if (!bot) return console.log(`Bot ${parts[1]} tidak aktif.`);
      log(nameOf(bot), `[GOTO] Jalan ke X:${x} Z:${z}...`);
      walkTo(bot, x, z).then((res) => log(nameOf(bot), `[GOTO] ${res.ok ? '✅' : '❌'} ${res.info}`));
      return;
    }

    // ====== farm [b1|all] — /afk (kalau belum) lalu jalan ke titik farm ======
    if (action === 'farm') {
      const targetBots = resolveBots(!parts[1] || parts[1].toLowerCase() === 'all' ? null : parts[1]);
      if (targetBots.length === 0) return console.log(`Bot ${parts[1] || ''} tidak aktif.`);
      targetBots.forEach((bot) => {
        const acc = accounts.find((a) => a.id === bot.accId);
        goFarm(bot, acc).then((res) => log(nameOf(bot), res.ok ? `[FARM] ✅ ${res.info} AFK di farm.` : `[FARM ERROR] ${res.info}`));
      });
      return;
    }

    // ====== setfarm <b1> [x z] — simpan titik farm (tanpa x z = posisi bot sekarang) ======
    if (action === 'setfarm') {
      if (!/^b\d+$/i.test(parts[1] || '')) return console.log('Format: setfarm <b1> [x z]   (tanpa x z = pakai posisi bot sekarang)');
      const bot = resolveBots(parts[1])[0];
      if (!bot) return console.log(`Bot ${parts[1]} tidak aktif.`);
      let x = parseInt(parts[2]);
      let z = parseInt(parts[3]);
      if (isNaN(x) || isNaN(z)) {
        const p = posOf(bot);
        if (!p) return console.log('Posisi bot belum diketahui.');
        x = p.x;
        z = p.z;
      }
      setFarmSpot(bot.accId, x, z);
      log(nameOf(bot), `[FARM] Titik farm disimpan: X:${x} Z:${z}. Jalankan: farm b${bot.accId}`);
      return;
    }

    // ====== players [b1] [nama] — pemain online di server (dari tab list) ======
    if (action === 'players' || action === 'online') {
      const args = parts.slice(1);
      const tag = args.find((a) => /^b\d+$/i.test(a));
      const search = args.filter((a) => a !== tag).join(' ');
      const snap = playersSnapshot(tag || null);
      if (!snap) return console.log(tag ? `Bot ${tag} tidak aktif.` : 'Tidak ada bot online untuk membaca daftar pemain.');
      console.log(playersText(snap, search));
      return;
    }

    // ====== server <create|setup|invite> ======
    // create = bot membuat server Discord baru lengkap dengan channel & role | setup = bangun/perbaiki server yang ada
    if (action === 'server') {
      const sub = (parts[1] || '').toLowerCase();
      serverAdmin(sub)
        .then((lines) => lines.forEach((l) => console.log(l)))
        .catch((err) => console.log(`[DISCORD] Gagal: ${err.message}\n  Kalau "server create" ditolak Discord, buat server kosong secara manual, undang bot (server invite), isi DISCORD_GUILD_ID di .env.`));
      return;
    }

    // ====== ping [b1/b2/b3] ======
    if (action === 'ping') {
      const targetBots = resolveBots(parts[1]);
      if (targetBots.length === 0) {
        console.log(`Bot ${parts[1] || ''} tidak aktif.`);
        return;
      }

      targetBots.forEach((bot) => {
        const ping = bot.player ? bot.player.ping : 'N/A';
        log(nameOf(bot), `[PING] ${ping}ms`);
      });
      return;
    }

    // ====== shards [b1/b2/b3] ======
    if (action === 'shards' || action === 'shard') {
      const targetBots = resolveBots(parts[1]);
      if (targetBots.length === 0) {
        console.log(`Bot ${parts[1] || ''} tidak aktif.`);
        return;
      }

      targetBots.forEach((bot) => {
        const total = shardsText(bot);
        log(nameOf(bot), `[SHARDS TOTAL] Total Shard: ${total}`);
      });
      return;
    }

    // ====== status ======
    if (action === 'status') {
      printStatus(botMap, accounts);
      return;
    }

    // ====== pay <player> <jumlah> [b1/b2/b3] ======
    if (action === 'pay') {
      const targetPlayer = parts[1];
      const amount = parts[2];

      if (!targetPlayer || !amount) {
        console.log('Format: pay <player> <jumlah> [b1/b2/b3]');
        return;
      }

      const targetBots = resolveBots(parts[3]);
      if (targetBots.length === 0) {
        console.log(`Bot ${parts[3] || ''} tidak aktif.`);
        return;
      }

      targetBots.forEach((bot) => {
        const cmd = `/pay ${targetPlayer} ${amount}`;
        setTimeout(() => {
          bot.chat(cmd);
          log(nameOf(bot), `[PAY SENT] ${cmd}`);
        }, randomDelay(300, 100));
      });
      return;
    }

    // ====== cmd <perintah custom> [b1/b2/b3] ======
    // Contoh: cmd /spawn b1  atau  cmd /balance  atau  cmd /clan home b2
    if (action === 'cmd' || action === 'run') {
      const lastArg = parts[parts.length - 1];
      const lastNum = parseInt(lastArg.replace(/^b/i, ''));
      const isTargeted = parts.length > 2 && !isNaN(lastNum) && botMap.has(lastNum);

      const targetBots = isTargeted ? [botMap.get(lastNum)] : Array.from(botMap.values());
      const cmdWords = isTargeted ? parts.slice(1, -1) : parts.slice(1);

      if (targetBots.length === 0 || cmdWords.length === 0) {
        console.log('Format: cmd <perintah_minecraft> [b1/b2/b3]');
        return;
      }

      const customCmd = cmdWords.join(' ');
      targetBots.forEach((bot) => {
        bot.chat(customCmd);
        log(nameOf(bot), `[CMD SENT] ${customCmd}`);
      });
      return;
    }

    // ====== say <pesan> [b1/b2/b3] ======
    if (action === 'say') {
      const lastArg = parts[parts.length - 1];
      const lastNum = parseInt(lastArg.replace(/^b/i, ''));
      const isTargeted = parts.length > 2 && !isNaN(lastNum) && botMap.has(lastNum);

      const targetBots = isTargeted ? [botMap.get(lastNum)] : Array.from(botMap.values());
      const msgWords = isTargeted ? parts.slice(1, -1) : parts.slice(1);

      if (targetBots.length === 0 || msgWords.length === 0) {
        console.log('Format: say <pesan> [b1/b2/b3]');
        return;
      }

      targetBots.forEach((bot) => bot.chat(msgWords.join(' ')));
      return;
    }

    // ====== w/s/a/d/space/stop [b1/b2/b3] ======
    const targetBots = resolveBots(parts[1]);
    if (targetBots.length === 0) {
      console.log(`Bot ${parts[1] || ''} tidak aktif.`);
      return;
    }

    targetBots.forEach((bot) => {
      if (action === 'w') bot.setControlState('forward', true);
      else if (action === 's') bot.setControlState('back', true);
      else if (action === 'a') bot.setControlState('left', true);
      else if (action === 'd') bot.setControlState('right', true);
      else if (action === 'space') {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 300);
      } else if (action === 'stop') bot.clearControlStates();
    });
  });
}

module.exports = { setupCommands };
