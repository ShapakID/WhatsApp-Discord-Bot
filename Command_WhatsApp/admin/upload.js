const fs = require('fs');
const { modul } = require('../../lib/module');
const { downloadContentFromMessage, generateWAMessageFromContent } = modul.baileys;

module.exports = {
    name: 'upload',
    execute: async (hydro, m, args, text, { isAdminBot, prefix }) => {
        if (!isAdminBot) return hydro.sendMessage(m.chat, { text: "Command ini khusus admin bot." }, { quoted: m });
        
        let qMsg = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
        let baseMsg = qMsg ? qMsg : m.message;
        let mediaMessage = baseMsg.documentMessage || baseMsg.imageMessage || baseMsg.documentWithCaptionMessage?.message?.documentMessage;
        
        if (!mediaMessage) {
            return hydro.sendMessage(m.chat, { text: `  Kirim dokumen/gambar dengan caption *${prefix}upload* atau balas (reply) file yang udah ada dengan *${prefix}upload*.` }, { quoted: m });
        }
        if (global.db.mk_si_2025.length === 0) return hydro.sendMessage(m.chat, { text: "List MK kosong." });
        
        hydro.sendMessage(m.chat, { text: "  Menyimpan file sementara..." }, { quoted: m });
        try {
            let isImage = !!(baseMsg.imageMessage);
            let stream = await downloadContentFromMessage(mediaMessage, isImage ? 'image' : 'document');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }
            
            let mimeType = mediaMessage.mimetype || 'application/octet-stream';
            let ext = mimeType.split('/')[1]; 
            if (ext.includes('document')) ext = 'docx';
            if (mimeType.includes('pdf')) ext = 'pdf';
            if (mimeType.includes('zip')) ext = 'zip';
            
            let originalFileName = mediaMessage.fileName || `file_${Date.now()}.${ext}`;
            let tmpPath = `./temp_${Date.now()}_${originalFileName}`;
            fs.writeFileSync(tmpPath, buffer);
            
            global.uploadSessions[m.sender] = { 
                tmpPath, originalFileName, mimeType, ext,
                timeout: setTimeout(() => {
                    if(fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
                    delete global.uploadSessions[m.sender];
                }, 300000) 
            };
            
            let rows = global.db.mk_si_2025.map((mk, i) => ({
                title: `  ${mk.singkatan}`, description: mk.nama, id: `${prefix}upl_mk_idx ${i}`
            }));
            
            let msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: { message: { messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                    interactiveMessage: {
                        body: { text: `File disimpan sementara.\nSilakan pilih Mata Kuliah tujuan:` },
                        nativeFlowMessage: { buttons: [{
                            name: "single_select",
                            buttonParamsJson: JSON.stringify({ title: "PILIH MK", sections: [{ title: "Daftar MK", rows: rows }] })
                        }]}
                    }
                }}
            }, { quoted: m });
            await hydro.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
        } catch (err) {
            hydro.sendMessage(m.chat, { text: `  Gagal menyimpan file.\nError: ${err.message}` }, { quoted: m });
        }
    }
};