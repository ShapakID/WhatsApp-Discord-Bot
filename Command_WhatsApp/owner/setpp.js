const { modul } = require('../../lib/module');
const { downloadContentFromMessage } = modul.baileys;

module.exports = {
    name: 'setpp',
    execute: async (hydro, m, args, text, { isOwner, prefix }) => {
        if (!isOwner) return hydro.sendMessage(m.chat, { text: "Khusus Owner bot ya!" }, { quoted: m });
        let qMsg = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
        let baseMsg = qMsg ? qMsg : m.message;
        let mediaMessage = baseMsg.imageMessage || baseMsg.documentMessage || baseMsg.documentWithCaptionMessage?.message?.documentMessage;
        
        if (!mediaMessage || !baseMsg.imageMessage) return hydro.sendMessage(m.chat, { text: `Kirim atau reply gambar dengan caption *${prefix}setpp*` }, { quoted: m });
        hydro.sendMessage(m.chat, { text: "  Sedang memproses dan mengganti Profile Picture..." }, { quoted: m });
        
        try {
            let stream = await downloadContentFromMessage(mediaMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }
            const jimp = require('jimp');
            const image = await jimp.read(buffer);
            const jpegBuffer = await image.cover(640, 640).quality(85).getBufferAsync(jimp.MIME_JPEG);
            const botJidAsli = hydro.user.id.split(':')[0] + '@s.whatsapp.net'; 
            await hydro.updateProfilePicture(botJidAsli, jpegBuffer);
            hydro.sendMessage(m.chat, { text: "  Profile Picture bot berhasil diganti!" }, { quoted: m });
        } catch (err) {
            hydro.sendMessage(m.chat, { text: `  Gagal ganti PP: ${err.message}` }, { quoted: m });
        }
    }
};