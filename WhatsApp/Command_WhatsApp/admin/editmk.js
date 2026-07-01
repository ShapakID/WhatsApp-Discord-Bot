const { modul } = require('../../lib/module');
const { generateWAMessageFromContent } = modul.baileys;

module.exports = {
    name: 'editmk',
    execute: async (hydro, m, args, text, { isAdminBot, prefix }) => {
        if (!isAdminBot) return hydro.sendMessage(m.chat, { text: "Command ini khusus admin bot." }, { quoted: m });
        if (global.db.mk_si_2025.length === 0) return hydro.sendMessage(m.chat, { text: "Belum ada daftar Mata Kuliah." }, { quoted: m });

        let rows = global.db.mk_si_2025.map((mk, i) => ({
            header: `ID: ${i + 1}`,
            title: mk.singkatan,
            description: `${mk.hari} | ${mk.jam} | ${mk.nama}`,
            id: `${prefix}editmk_f ${i} ${m.sender}`
        }));

        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                    interactiveMessage: {
                        body: { text: `Pilih Mata Kuliah yang ingin kamu *EDIT*  ` },
                        nativeFlowMessage: {
                            buttons: [{
                                name: "single_select",
                                buttonParamsJson: JSON.stringify({ title: "PILIH MK", sections: [{ title: "Daftar Mata Kuliah", rows: rows }] })
                            }]
                        }
                    }
                }
            }
        }, { quoted: m });
        await hydro.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
    }
};