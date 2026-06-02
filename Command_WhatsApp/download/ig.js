const { modul } = require('../../lib/module');
const { generateWAMessageFromContent } = modul.baileys;

module.exports = {
    name: 'ig',
    execute: async (hydro, m, args, text, { prefix }) => {
        if (!args[0]) return hydro.sendMessage(m.chat, { text: `Kirim link Instagram-nya!\nContoh: *${prefix}ig [link]*` }, { quoted: m });
        
        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: `Konten Instagram ditemukan. Pilih format download:` },
                        footer: { text: global.botname },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "🎬 Video/Foto",
                                        id: `${prefix}igdl media ${args[0]}`
                                    })
                                },
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "🎵 Audio Saja",
                                        id: `${prefix}igdl audio ${args[0]}`
                                    })
                                }
                            ]
                        }
                    }
                }
            }
        }, { quoted: m });

        await hydro.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    }
};