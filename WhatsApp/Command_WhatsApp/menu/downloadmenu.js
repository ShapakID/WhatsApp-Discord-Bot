module.exports = {
    name: 'downloadmenu',
    execute: async (hydro, m, args, text, { prefix }) => {
        let textDl = `  [ *DOWNLOAD MENU* ]  \n`;
        textDl += `  *${prefix}tt* - Download video TikTok (Tanpa Watermark)\n`;
        textDl += `  *${prefix}ig* - Download konten Instagram\n`;
        textDl += `  *${prefix}yt* - Download video/audio YouTube\n`;
        textDl += `  *${prefix}fb* - Download video Facebook\n`;
        hydro.sendMessage(m.chat, { text: textDl }, { quoted: m });
    }
};