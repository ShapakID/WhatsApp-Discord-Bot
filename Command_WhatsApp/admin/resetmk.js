const { modul } = require('../../lib/module');
const { generateWAMessageFromContent } = modul.baileys;

module.exports = {
    name: 'resetmk',
    execute: async (hydro, m, args, text, { isAdminBot, prefix }) => {
        if (!isAdminBot) return hydro.sendMessage(m.chat, { text: "Command ini khusus admin bot." }, { quoted: m });
        if (global.db.mk_si_2025.length === 0) return hydro.sendMessage(m.chat, { text: "Daftar MK memang kosong." }, { quoted: m });
        
        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: { message: { messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                interactiveMessage: {
                    body: { text: `  *KONFIRMASI RESET MK*\nYakin ingin mereset/menghapus semua jadwal MK? Data akan di-backup ke Discord.` },
                    nativeFlowMessage: { buttons: [
                        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "  Ya, Reset", id: `${prefix}resetmk_exec ${m.sender}` }) },
                        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "  Batal", id: `${prefix}resetmk_cancel ${m.sender}` }) }
                    ]}
                }
            }}
        }, { quoted: m });
        await hydro.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
    }
};