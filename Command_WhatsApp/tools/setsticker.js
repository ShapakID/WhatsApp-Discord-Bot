const fs = require('fs');
const { modul } = require('../../lib/module');
const { downloadContentFromMessage } = modul.baileys;

module.exports = {
    name: 'setsticker',
    execute: async (hydro, m, args, text, { prefix }) => {
        let qMsg = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
        let baseMsg = qMsg ? qMsg : m.message;
        let mediaMessage = baseMsg.imageMessage || baseMsg.documentMessage || baseMsg.documentWithCaptionMessage?.message?.documentMessage;

        if (!mediaMessage || !baseMsg.imageMessage) return hydro.sendMessage(m.chat, { text: `Kirim atau reply gambar dengan caption *${prefix}setsticker*` }, { quoted: m });
        hydro.sendMessage(m.chat, { text: "  Sedang membuat stiker khusus..." }, { quoted: m });

        try {
            let stream = await downloadContentFromMessage(mediaMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }
            const tmpIn = `./temp_${Date.now()}.jpg`;
            const tmpOut = `./temp_${Date.now()}.webp`;
            fs.writeFileSync(tmpIn, buffer);
            const ffmpeg = require('fluent-ffmpeg');
            const webp = require('node-webpmux');

            await new Promise((resolve, reject) => {
                ffmpeg(tmpIn).on('error', reject).on('end', () => resolve(true)).addOutputOptions(["-vcodec", "libwebp", "-vf", "scale='iw*512/max(iw,ih)':'ih*512/max(iw,ih)',fps=15,pad=512:512:-1:-1:color=white@0.0,split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"]).toFormat('webp').save(tmpOut);
            });

            const img = new webp.Image();
            await img.load(tmpOut);
            const json = { "sticker-pack-id": "hydro-bot-shapak", "sticker-pack-name": "Made by :", "sticker-pack-publisher": "Shapak Botz", "emojis": [" ", " "] };
            const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
            const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
            const exif = Buffer.concat([exifAttr, jsonBuff]);
            exif.writeUIntLE(jsonBuff.length, 14, 4);
            img.exif = exif;

            const finalOut = `./temp_${Date.now()}_exif.webp`;
            await img.save(finalOut);
            const stickerBuff = fs.readFileSync(finalOut);
            await hydro.sendMessage(m.chat, { sticker: stickerBuff }, { quoted: m });
            fs.unlinkSync(tmpIn); fs.unlinkSync(tmpOut); fs.unlinkSync(finalOut);
        } catch (err) {
            hydro.sendMessage(m.chat, { text: `  Gagal buat stiker: ${err.message}` }, { quoted: m });
        }
    }
};