const { modul } = require('../../lib/module');
const { generateWAMessageFromContent } = modul.baileys;

module.exports = {
    name: 'addpraktikum',
    execute: async (hydro, m, args, text, { isAdminBot, prefix }) => {
        if (!isAdminBot) return hydro.sendMessage(m.chat, { text: "Khusus Admin Bot." }, { quoted: m });
        if (global.db.mk_si_2025.length === 0) return hydro.sendMessage(m.chat, { text: "List MK kosong." }, { quoted: m });
        
        let rows = global.db.mk_si_2025.map((mk, i) => ({
            title: mk.singkatan, description: `${mk.hari} | ${mk.nama}`, id: `${prefix}addprak_pilih ${i} ${m.sender}`
        }));
        
        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: { message: { messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                interactiveMessage: {
                    body: { text: `Pilih Mata Kuliah yang mau ditambahkan Praktikum:` },
                    nativeFlowMessage: { buttons: [{
                        name: "single_select",
                        buttonParamsJson: JSON.stringify({ title: "PILIH MK", sections: [{ title: "Daftar MK", rows: rows }] })
                    }]}
                }
            }}
        }, { quoted: m });
        await hydro.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
    }
};