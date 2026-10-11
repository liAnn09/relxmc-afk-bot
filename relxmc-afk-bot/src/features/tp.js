// Teleport lewat command server (gaya Essentials: /tpa, /spawn, /home, /warp).
// Bentuk: tp <bot|all> <pemain | spawn | home [nama] | warp <nama>>
//
//   tp b1 Steve        → /tpa Steve          (minta teleport ke pemain)
//   tp b1 here Steve   → /tpahere Steve      (minta pemain teleport ke bot)
//   tp all spawn       → /spawn
//   tp b2 home         → /home   |  tp b2 home farm → /home farm
//   tp b1 warp pvp     → /warp pvp

const NAME_RE = /^[A-Za-z0-9_.]{1,16}$/;   // nama pemain (titik di depan = pemain Bedrock)
const WORD_RE = /^[A-Za-z0-9_\-]{1,32}$/;  // nama home / warp

// words = argumen setelah tag bot. Hasil: { cmd, label } atau { error }
function buildTp(words) {
  if (!words.length) return { error: 'Tujuan kosong. Contoh: tp b1 Steve | tp all spawn | tp b1 warp pvp' };

  const first = words[0].toLowerCase();

  if (first === 'spawn') return { cmd: '/spawn', label: 'Spawn' };

  if (first === 'home') {
    if (words[1] && !WORD_RE.test(words[1])) return { error: `Nama home "${words[1]}" tidak valid.` };
    return { cmd: words[1] ? `/home ${words[1]}` : '/home', label: words[1] ? `Home ${words[1]}` : 'Home' };
  }

  if (first === 'warp') {
    if (!words[1]) return { error: 'Sebutkan nama warp. Contoh: tp b1 warp pvp' };
    if (!WORD_RE.test(words[1])) return { error: `Nama warp "${words[1]}" tidak valid.` };
    return { cmd: `/warp ${words[1]}`, label: `Warp ${words[1]}` };
  }

  if (first === 'here') {
    if (!words[1] || !NAME_RE.test(words[1])) return { error: 'Sebutkan nama pemain. Contoh: tp b1 here Steve' };
    return { cmd: `/tpahere ${words[1]}`, label: `${words[1]} diminta teleport ke bot` };
  }

  if (!NAME_RE.test(words[0])) return { error: `Nama pemain "${words[0]}" tidak valid.` };
  return { cmd: `/tpa ${words[0]}`, label: `Minta teleport ke ${words[0]}` };
}

module.exports = { buildTp };
