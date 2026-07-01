const { modul } = require('../../lib/module');
const { generateWAMessageFromContent } = modul.baileys;

module.exports = {
    name: 'menu',
    execute: async (hydro, m, args, text, { isAdminBot, isGroupAdmins, isOwner, prefix, pushname }) => {
        let menuRows = [
            { header: "", title: "All Menu", description: "Menampilkan semua command", id: `${prefix}allmenu` },
            { header: "", title: "Download Menu", description: "Download video/media online", id: `${prefix}downloadmenu` }
        ];
        if (isAdminBot) menuRows.push({ header: "", title: "Admin Menu", description: "Control Command oleh admin bot", id: `${prefix}adminmenu` });
        if (isGroupAdmins || isOwner) menuRows.push({ header: "", title: "Admin Group", description: "Control pengaturan grup", id: `${prefix}admingroupmenu` });
        if (isOwner) menuRows.push({ header: "", title: "Owner Menu", description: "Menu eksklusif khusus Owner", id: `${prefix}ownermenu` });

        let fallbackText = `Halo *${pushname}*, berikut adalah pilihan menu yang tersedia:\n\n╭───『 *KATEGORI MENU* 』───\n`;
        menuRows.forEach(row => {
            fallbackText += `│ • ${row.title}\n`;
            if (row.description) fallbackText += `│   └ ${row.description}\n`;
            fallbackText += `│   └ Ketik: *${row.id}*\n`;
        });
        fallbackText += `╰────────────────────\n\n*By ${global.botname || "Bot Whatsapp"}*`;

        await hydro.sendMessage(m.chat, { text: fallbackText }, { quoted: m });
    }
};