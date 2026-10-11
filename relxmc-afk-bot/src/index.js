const { startBot } = require('./core/bot');
const { setupCommands } = require('./commands');
const { printBanner } = require('./core/utils');
const { initDiscord } = require('./discord/discordBot');
const { startWatchdog } = require('./discord/liveStatus');

printBanner();
initDiscord();
setupCommands();
startWatchdog();
startBot(0);
