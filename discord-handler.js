// discord-handler.js (taruh di luar bareng index.js)
const { logTraffic } = require('./lib/logger');
require('./settings');
const fs = require('fs');
const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const { Shoukaku, Connectors } = require('shoukaku');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
    presence: {
        status: 'idle',
        afk: true
    }
});

// Kumpulan Public Lavalink Nodes (Kita pakai v4 yang stabil)
const Nodes = [
    {
        name: 'Jirayu (Satu-satunya yang hidup saat ini)',
        url: 'lavalink.jirayu.net:443',
        auth: 'youshallnotpass',
        secure: true
    }
    // Server lain (AjieBlogs, Serenetia, Rive, Stackryze) dihapus sementara 
    // karena memicu timeout 10 detik yang bikin bot lemot merespon lagu.
];

const shoukaku = new Shoukaku(new Connectors.DiscordJS(client), Nodes, { moveOnDisconnect: false, resume: true });

shoukaku.on('error', (_, error) => console.error('Lavalink Node Error:', error));
shoukaku.on('ready', (name) => console.log(`✅ Lavalink Node: ${name} is now connected`));

client.shoukaku = shoukaku;

const path = require('path');
client.commands = new Collection();
const cmdPath = './Command_Discord';

function readCommandsRec(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(readCommandsRec(file));
        } else {
            if (file.endsWith('.js')) results.push(file);
        }
    });
    return results;
}

function loadDiscordCommand(filePath) {
    try {
        if (require.cache[require.resolve(filePath)]) {
            delete require.cache[require.resolve(filePath)];
        }
        const command = require(filePath);
        if (command.name) {
            const folderName = path.basename(path.dirname(filePath));
            command.category = folderName === 'Command_Discord' ? 'Uncategorized' : folderName;
            client.commands.set(command.name, command);

            // Hot reload init support (if bot is already running)
            if (client.isReady && client.isReady() && typeof command.init === 'function') {
                command.init(client);
            }
        }
    } catch (e) {
        console.error(`Error pas load/update Discord command ${filePath}:`, e.message);
    }
}

const commandFiles = readCommandsRec(cmdPath);
for (const file of commandFiles) {
    loadDiscordCommand(file);
}

const { modul } = require('./lib/module');
const chalk = modul.chalk;

fs.watch(cmdPath, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.js')) {
        const filePath = path.resolve(cmdPath, filename);
        if (fs.existsSync(filePath)) {
            if (!require.cache[require.resolve(filePath)]) {
                console.log(chalk.greenBright(`[ NEW DISCORD CMD ] Kedetect command baru nih: '${filename}'`));
            } else {
                console.log(chalk.yellowBright(`[ UPDATE DISCORD CMD ] '${filename}'`));
            }
            loadDiscordCommand(filePath);
        }
    }
});

client.once('ready', () => {
    // Set status awal ke Idle dan waktunya WITA
    let lastTimeStr = '';
    const updateStatus = () => {
        const time = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Makassar', hourCycle: 'h23', hour: '2-digit', minute: '2-digit' });
        if (time !== lastTimeStr) {
            client.user.setPresence({
                activities: [{ name: 'Custom Status', state: `🕒 ${time} WITA`, type: ActivityType.Custom }],
                status: 'idle',
                afk: true
            });
            client.user.setStatus('idle');
            lastTimeStr = time;
        }
    };

    updateStatus();
    setInterval(updateStatus, 5000); // Cek tiap 5 detik biar akurat pas ganti menit

    for (const command of client.commands.values()) {
        if (typeof command.init === 'function') {
            command.init(client);
        }
    }
});

client.on('messageCreate', async message => {
    // Abaikan kalau yang ngirim bot
    if (message.author.bot) return;

    // Catat log trafik Discord
    let chatType = message.guild ? 'Grup' : 'Pribadi';
    logTraffic('Discord', message.author.id, chatType);

    // Cek kalau bot di tag
    if (message.mentions.has(client.user) && !message.mentions.everyone && !message.mentions.here) {
        const mentionText = `<@${client.user.id}>`;
        const mentionTextAlt = `<@!${client.user.id}>`;
        if (message.content.trim() === mentionText || message.content.trim() === mentionTextAlt) {
            return message.reply(`Halo <@${message.author.id}>! 👋\nAku adalah bot Multi-Device (WhatsApp & Discord).\n\n📌 **Prefix**: \`${global.prefix[0]}\`\n👑 **Owner**: <@1202397666835701830>\n\nKetik \`${global.prefix[0]}help\` untuk melihat daftar command yang tersedia.`);
        }
    }

    // Filter command (biar fitur bot tetep jalan normal)
    if (!message.content.startsWith(global.prefix[0])) return;
    const args = message.content.slice(global.prefix[0].length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
    }
});
client.on('guildMemberAdd', async member => {
    try {
        if (!global.db || !global.db.discord || !global.db.discord[member.guild.id] || !global.db.discord[member.guild.id].welcome) return;
        const config = global.db.discord[member.guild.id].welcome;
        const channel = member.guild.channels.cache.get(config.channel);
        if (!channel) return;

        let msg = config.message
            .replace(/{user}/g, `<@${member.user.id}>`)
            .replace(/{server}/g, member.guild.name)
            .replace(/{memberCount}/g, member.guild.memberCount);

        channel.send(msg).catch(() => {});
    } catch (e) { console.log(e); }
});

client.on('guildMemberRemove', async member => {
    try {
        if (!global.db || !global.db.discord || !global.db.discord[member.guild.id] || !global.db.discord[member.guild.id].goodbye) return;
        const config = global.db.discord[member.guild.id].goodbye;
        const channel = member.guild.channels.cache.get(config.channel);
        if (!channel) return;

        let msg = config.message
            .replace(/{user}/g, member.user.username) // Jangan tag orang yang udah keluar
            .replace(/{server}/g, member.guild.name)
            .replace(/{memberCount}/g, member.guild.memberCount);

        channel.send(msg).catch(() => {});
    } catch (e) { console.log(e); }
});

client.login(global.discordToken);