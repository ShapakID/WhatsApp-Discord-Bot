const { modul } = require('../../lib/module');
const { generateWAMessageFromContent } = modul.baileys;

module.exports = {
    name: 'yt',
    execute: async (hydro, m, args, text, { prefix }) => {
        if (!args[0]) return hydro.sendMessage(m.chat, { text: `Kirim link YouTube-nya!\nContoh: *${prefix}yt [link]*` }, { quoted: m });
        
        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: `Pilih format untuk video YouTube ini:` },
                        footer: { text: global.botname },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "🎵 Audio (MP3)",
                                        id: `${prefix}ytdl mp3 ${args[0]}`
                                    })
                                },
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "🎥 Video (MP4)",
                                        id: `${prefix}ytdl mp4 ${args[0]}`
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