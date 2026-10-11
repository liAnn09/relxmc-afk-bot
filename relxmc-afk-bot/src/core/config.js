const path = require('path');
// .env dibaca dari folder utama proyek (bukan dari folder kerja saat menjalankan)
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const host = process.env.HOST;
const port = parseInt(process.env.PORT) || 25565;
const version = process.env.VERSION || '1.20.1';

const accounts = [];
for (let i = 1; ; i++) {
  const username = process.env[`BOT${i}_USERNAME`];
  if (!username) break;
  accounts.push({
    id: i,
    username,
    pass: process.env[`BOT${i}_PASSWORD`],
    targetX: parseInt(process.env[`BOT${i}_TARGET_X`]) || 0,
    targetZ: parseInt(process.env[`BOT${i}_TARGET_Z`]) || 0
  });
}

module.exports = {
  host,
  port,
  version,
  accounts,
  reconnectDelay: parseInt(process.env.RECONNECT_DELAY) || 90000,
  jumpMinMinutes: parseInt(process.env.JUMP_MIN_MINUTES) || 2,
  jumpMaxMinutes: parseInt(process.env.JUMP_MAX_MINUTES) || 4,
  rejoinRetryDelay: parseInt(process.env.REJOIN_RETRY_DELAY) || 10000,
  rejoinMaxAttempts: parseInt(process.env.REJOIN_MAX_ATTEMPTS) || 40,
  autoFarm: process.env.AUTO_FARM === 'true',   // true = setelah masuk ecocpvp & /afk, bot otomatis jalan ke titik farm
  discordToken: process.env.DISCORD_TOKEN || '',
  discordGuildId: process.env.DISCORD_GUILD_ID || '',
  discordLogChannelId: process.env.DISCORD_LOG_CHANNEL_ID || '',
  discordCmdChannelId: process.env.DISCORD_CMD_CHANNEL_ID || '',
  discordLiveChannelId: process.env.DISCORD_LIVE_CHANNEL_ID || ''
};
