const { modul } = require('../../lib/module');
const { axios, baileys } = modul;
const { downloadContentFromMessage } = baileys;
const { promisify } = require('util');

// Simpan sesi kumpul gambar per user
if (!global.pdfMultiSessions) global.pdfMultiSessions = {};

module.exports = {
    name: 'topdf',
    execute: async (hydro, m, args, text, { prefix }) => {
        const subCmd = args[0]?.toLowerCase();

        // =============================================
        // MODE BULK: .topdf bulk NamaFile
        // =============================================
        if (subCmd === 'bulk') {
            let filename = args.slice(1).join(' ').trim();
            if (!filename) {
                return hydro.sendMessage(m.chat, { text: `Kasih nama filenya!\nContoh: *${prefix}topdf bulk Tugas Sejarah*` }, { quoted: m });
            }
            if (!filename.toLowerCase().endsWith('.pdf')) filename += '.pdf';

            global.pdfMultiSessions[m.sender] = {
                chat: m.chat,
                filename: filename,
                images: [],
                startTime: Date.now()
            };

            return hydro.sendMessage(m.chat, {
                text: `📸 *MODE KUMPUL GAMBAR*\nFile: *${filename}*\n\nKirim gambar-gambarnya sekarang!\nKalau udah, ketik: *${prefix}topdf jadi*`
            }, { quoted: m });
        }

        // =============================================
        // GABUNG JADI PDF: .topdf jadi
        // =============================================
        if (subCmd === 'jadi' || subCmd === 'done' || subCmd === 'selesai') {
            const session = global.pdfMultiSessions[m.sender];
            if (!session || session.images.length === 0) {
                return hydro.sendMessage(m.chat, { text: `Belum ada gambar yang dikumpulin. Mulai dulu pakai *${prefix}topdf bulk NamaFile*` }, { quoted: m });
            }

            hydro.sendMessage(m.chat, { text: `_⏳ Menggabung ${session.images.length} gambar jadi 1 PDF..._` }, { quoted: m });

            try {
                const PDFDocument = require('pdfkit');
                const resultBuffer = await new Promise((resolve, reject) => {
                    const doc = new PDFDocument({ margin: 0, size: 'A4' });
                    let chunks = [];
                    doc.on('data', chunk => chunks.push(chunk));
                    doc.on('end', () => resolve(Buffer.concat(chunks)));

                    session.images.forEach((imgBuf, idx) => {
                        if (idx > 0) doc.addPage();
                        try {
                            doc.image(imgBuf, 0, 0, { fit: [595.28, 841.89], align: 'center', valign: 'center' });
                        } catch (e) { }
                    });
                    doc.end();
                });

                await hydro.sendMessage(m.chat, {
                    document: resultBuffer,
                    mimetype: 'application/pdf',
                    fileName: session.filename,
                    caption: `✅ *${session.images.length} gambar* → *${session.filename}*`
                }, { quoted: m });
            } catch (err) {
                hydro.sendMessage(m.chat, { text: `Gagal: ${err.message}` }, { quoted: m });
            }

            delete global.pdfMultiSessions[m.sender];
            return;
        }

        // =============================================
        // BATAL: .topdf batal
        // =============================================
        if (subCmd === 'batal' || subCmd === 'cancel') {
            if (global.pdfMultiSessions[m.sender]) {
                delete global.pdfMultiSessions[m.sender];
                return hydro.sendMessage(m.chat, { text: `❌ Sesi dibatalkan.` }, { quoted: m });
            }
            return hydro.sendMessage(m.chat, { text: `Tidak ada sesi aktif.` }, { quoted: m });
        }

        // =============================================
        // ADD MANUAL DENGAN REPLY: .topdf add
        // =============================================
        if (subCmd === 'add' || subCmd === 'tambah') {
            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const imageMessage = quoted?.imageMessage || quoted?.viewOnceMessage?.message?.imageMessage || quoted?.viewOnceMessageV2?.message?.imageMessage;

            if (!imageMessage) {
                return hydro.sendMessage(m.chat, { text: `Reply gambar yang mau ditambah dengan caption *${prefix}topdf add*` }, { quoted: m });
            }

            // Kalau belum ada sesi, langsung otomatis buatin!
            if (!global.pdfMultiSessions[m.sender]) {
                let filename = args.slice(1).join(' ').trim() || 'Hasil_Gabungan_PDF';
                if (!filename.toLowerCase().endsWith('.pdf')) filename += '.pdf';

                global.pdfMultiSessions[m.sender] = {
                    chat: m.chat,
                    filename: filename,
                    images: [],
                    startTime: Date.now()
                };
            }

            const session = global.pdfMultiSessions[m.sender];

            try {
                const stream = await downloadContentFromMessage(imageMessage, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }
                if (buffer.length > 0) {
                    session.images.push(buffer);
                    let msgReply = `✅ Gambar ke-${session.images.length} masuk!`;
                    if (session.images.length === 1) msgReply += `\n_(Sesi otomatis dibuat dengan nama: ${session.filename})_\n\nSilakan reply gambar lain dengan *${prefix}topdf add*, kalau udah semua ketik *${prefix}topdf jadi*`;
                    return hydro.sendMessage(m.chat, { text: msgReply }, { quoted: m });
                }
            } catch (err) {
                return hydro.sendMessage(m.chat, { text: `Gagal menambahkan gambar.` }, { quoted: m });
            }
            return;
        }

        // =============================================
        // MODE SINGLE: 1 gambar / 1 dokumen (original)
        // =============================================
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage || m.message;

        let isImage = false;
        let isDocument = false;
        let targetMedia = null;

        if (m.specialPdfMedia) {
            targetMedia = m.specialPdfMedia;
            isImage = m.specialPdfIsImage;
            isDocument = !isImage;
        } else {
            const imageMessage = quoted?.imageMessage ||
                quoted?.viewOnceMessage?.message?.imageMessage ||
                quoted?.viewOnceMessageV2?.message?.imageMessage;

            const documentMessage = quoted?.documentMessage ||
                quoted?.documentWithCaptionMessage?.message?.documentMessage;

            isImage = !!imageMessage;
            isDocument = !!documentMessage;
            targetMedia = isImage ? imageMessage : documentMessage;
        }

        if (!isImage && !isDocument) {
            return hydro.sendMessage(m.chat, { text: `📄 *CARA PAKAI:*\n\n*1 file:*\nKirim/reply gambar/dokumen + *${prefix}topdf NamaFile*\n\n*Banyak gambar → 1 PDF:*\n1. *${prefix}topdf bulk NamaFile*\n2. Forward gambar-gambar (otomatis masuk)\n3. Atau reply gambar lama pakai *${prefix}topdf add*\n4. Kalau udah semua, ketik: *${prefix}topdf jadi*` }, { quoted: m });
        }

        let filename = text;
        if (text.includes('|')) {
            filename = text.split('|')[1].trim();
        } else {
            filename = text.trim();
        }

        if (!filename) {
            let sentMsg = await hydro.sendMessage(m.chat, { text: `Kasih nama filenya!\n\n*REPLY* pesan ini dengan nama file ya (contoh: Tugas Fisika)` }, { quoted: m });
            global.pdfSessions[m.sender] = {
                id: sentMsg.key.id,
                targetMedia: targetMedia,
                isImage: isImage
            };
            return;
        }

        if (!filename.toLowerCase().endsWith('.pdf')) {
            filename += '.pdf';
        }

        hydro.sendMessage(m.chat, { text: `_Sedang memproses PDF..._` }, { quoted: m });

        try {
            const stream = await downloadContentFromMessage(targetMedia, isImage ? 'image' : 'document');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            if (!buffer || buffer.length === 0) throw new Error("File media tidak terbaca.");

            let resultBuffer;

            if (isImage) {
                const PDFDocument = require('pdfkit');
                resultBuffer = await new Promise((resolve, reject) => {
                    const doc = new PDFDocument({ margin: 0, size: 'A4' });
                    let chunks = [];
                    doc.on('data', chunk => chunks.push(chunk));
                    doc.on('end', () => resolve(Buffer.concat(chunks)));
                    try {
                        doc.image(buffer, 0, 0, { fit: [595.28, 841.89], align: 'center', valign: 'center' });
                    } catch (imgErr) {
                        reject(new Error("Format gambar rusak."));
                    }
                    doc.end();
                });
            } else {
                try {
                    const libre = require('libreoffice-convert');
                    const convert = promisify(libre.convert);
                    resultBuffer = await convert(buffer, '.pdf', undefined);
                } catch (err) {
                    if (err.code === 'ENOENT' && err.syscall === 'spawn soffice') {
                        throw new Error("LibreOffice belum diinstal di server.");
                    }
                    throw err;
                }
            }

            await hydro.sendMessage(m.chat, {
                document: resultBuffer,
                mimetype: 'application/pdf',
                fileName: filename,
                caption: `Done! *${filename}*`
            }, { quoted: m });

        } catch (err) {
            hydro.sendMessage(m.chat, { text: `Gagal: ${err.message}` }, { quoted: m });
        }
    }
};