const { modul } = require('../../lib/module');
const { generateWAMessageFromContent } = modul.baileys;

module.exports = {
    name: 'yt',
    execute: async (hydro, m, args, text, { prefix }) => {
        if (!args[0]) return hydro.sendMessage(m.chat, { text: `Kirim link YouTube-nya!\nContoh: *${prefix}yt [link]*` }, { quoted: m });
        
        let fallbackText = `Pilih format untuk video YouTube ini:\n\n`;
        fallbackText += `╭───『 *AUDIO* 』───\n`;
        fallbackText += `│ • Format: MP3\n`;
        fallbackText += `│ └ Ketik: *${prefix}ytdl mp3 ${args[0]}*\n`;
        fallbackText += `╰────────────────────\n\n`;
        fallbackText += `╭───『 *VIDEO* 』───\n`;
        fallbackText += `│ • Format: MP4\n`;
        fallbackText += `│ └ Ketik: *${prefix}ytdl mp4 ${args[0]}*\n`;
        fallbackText += `╰────────────────────\n\n*By ${global.botname}*`;

        await hydro.sendMessage(m.chat, { text: fallbackText }, { quoted: m });
    }
};