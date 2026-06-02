const { modul } = require('../../lib/module');
const { generateWAMessageFromContent } = modul.baileys;

module.exports = {
    name: 'help',
    execute: async (hydro, m, args, text, { isAdminBot, isGroupAdmins, isOwner, prefix, pushname }) => {
        let menuRows = [
            { header: "", title: "All Menu", description: "Menampilkan semua command", id: `${prefix}allmenu` },
            { header: "", title: "Download Menu", description: "Download video/media online", id: `${prefix}downloadmenu` }
        ];
        if (isAdminBot) menuRows.push({ header: "", title: "Admin Menu", description: "Control Command oleh admin bot", id: `${prefix}adminmenu` });
        if (isGroupAdmins || isOwner) menuRows.push({ header: "", title: "Admin Group", description: "Control pengaturan grup", id: `${prefix}admingroupmenu` });
        if (isOwner) menuRows.push({ header: "", title: "Owner Menu", description: "Menu eksklusif khusus Owner", id: `${prefix}ownermenu` });

        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                    interactiveMessage: {
                        body: { text: `Halo *${pushname}*, silakan pencet tombol di bawah untuk melihat pilihan menu ya!` },
                        footer: { text: global.botname || "Bot Whatsapp" },
                        header: { title: "Menu Utama", subtitle: "", hasMediaAttachment: false },
                        nativeFlowMessage: { buttons: [{ name: "single_select", buttonParamsJson: JSON.stringify({ title: "PILIH KATEGORI", sections: [{ title: "Kategori Menu", rows: menuRows }] }) }] }
                    }
                }
            }
        }, { quoted: m });
        await hydro.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
    }
};