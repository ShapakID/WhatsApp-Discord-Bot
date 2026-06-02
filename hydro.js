/*  SCRIPT INI GRATIS 100%  BEBAS RECODE   JANGAN DI JUAL */
const { logTraffic } = require('./lib/logger');
require('./settings');
const { modul } = require('./lib/module');
const { initDatabase } = require('./lib/database');
const { runtime } = require('./lib/function');
const { joinQueue, getQueueInfo, queues } = require('./lib/queue');
const { uploadToDrive, setupSemesterFolders } = require('./lib/drive');
const { baileys, util, performance, os, moment, fs, path, chalk, axios } = modul;
const { getContentType, generateWAMessageFromContent, downloadContentFromMessage } = baileys;
const { google } = require('googleapis');

// ========================================== 
//  HELPER GOOGLE DRIVE 
// ========================================== 
async function getDriveClient() {
    try {
        const content = fs.readFileSync('credentials.json');
        const credentials = JSON.parse(content);
        const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0] || 'urn:ietf:wg:oauth:2.0:oob');
        const token = fs.readFileSync('token.json');
        oAuth2Client.setCredentials(JSON.parse(token));
        return google.drive({ version: 'v3', auth: oAuth2Client });
    } catch (err) {
        console.log("Drive API Error:", err.message);
        return null;
    }
}

async function getOrCreateFolder(drive, name, parentId) {
    let res = await drive.files.list({
        q: `'${parentId}' in parents and name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id, webViewLink)'
    });
    if (res.data.files.length > 0) return { id: res.data.files[0].id, link: res.data.files[0].webViewLink };
    let created = await drive.files.create({
        resource: { name: name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] },
        fields: 'id, webViewLink'
    });
    return { id: created.data.id, link: created.data.webViewLink };
}

async function deleteDriveFile(drive, fileId) {
    try { await drive.files.delete({ fileId: fileId }); } catch (e) { console.log("Gagal hapus file lama:", e.message); }
}

// ========================================== 
//  INISIALISASI DATABASE & SESSION 
// ========================================== 
if (!global.db) {
    if (fs.existsSync('./database/database.json')) {
        global.db = JSON.parse(fs.readFileSync('./database/database.json', 'utf-8'));
    } else {
        global.db = { users: {}, groups: {}, chats: {}, settings: {}, others: {} };
    }
}
if (!global.db.mk_si_2025) global.db.mk_si_2025 = [];
if (!global.db.settings) global.db.settings = {};
if (!global.db.lists) global.db.lists = {};
if (!global.db.users) global.db.users = {};
if (!global.db.tugas) global.db.tugas = {};
if (!global.editSessions) global.editSessions = {};
if (!global.buatListSessions) global.buatListSessions = {};
if (!global.registerSessions) global.registerSessions = {};
if (!global.isiDataSessions) global.isiDataSessions = {};
if (!global.editListSessions) global.editListSessions = {};
if (!global.uploadSessions) global.uploadSessions = {};
if (!global.buatTugasSessions) global.buatTugasSessions = {};
if (!global.kumpulTugasSessions) global.kumpulTugasSessions = {};
if (!global.joinRequests) global.joinRequests = {};
if (!global.adminbot) global.adminbot = [];
if (!global.pdfSessions) global.pdfSessions = {};

module.exports = async function hydroHandler(hydro, m, chatUpdate, store) {
    try {
        if (!m || !m.message) return;
        if (m.key.id && !m.key.fromMe) await hydro.readMessages([m.key]);
        m.chat = m.key.remoteJid || '';
        m.isGroup = m.chat.endsWith('@g.us');
        m.sender = m.key.fromMe ? (hydro.user.id.split(':')[0] + '@s.whatsapp.net' || hydro.user.id) : (m.key.participant || m.key.remoteJid || '');
        m.pushName = m.pushName || "Misterius";

        m.mtype = getContentType(m.message);
        if (m.mtype === 'documentWithCaptionMessage') {
            m.message = m.message.documentWithCaptionMessage.message;
            m.mtype = getContentType(m.message);
        }
        if (m.mtype === 'ephemeralMessage' || m.mtype === 'viewOnceMessage' || m.mtype === 'viewOnceMessageV2') {
            m.message = m.message[m.mtype].message;
            m.mtype = getContentType(m.message);
            if (m.mtype === 'documentWithCaptionMessage') {
                m.message = m.message.documentWithCaptionMessage.message;
                m.mtype = getContentType(m.message);
            }
        }

        const msgHelper = require('./lib/src/message')(hydro, m, chatUpdate, store);
        m = msgHelper.m;
        let body = '';

        if (m.mtype === 'interactiveResponseMessage' || m.message?.interactiveResponseMessage) {
            try {
                let interMsg = m.message.interactiveResponseMessage || m.message[m.mtype];
                body = JSON.parse(interMsg.nativeFlowResponseMessage.paramsJson).id;
            } catch (e) { body = ''; }
        } else {
            body = (m.mtype === 'conversation') ? m.message.conversation :
                (m.mtype === 'imageMessage') ? m.message.imageMessage?.caption :
                    (m.mtype === 'documentMessage') ? m.message.documentMessage?.caption :
                        (m.mtype === 'extendedTextMessage') ? m.message.extendedTextMessage?.text :
                            (m.mtype === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage?.selectedButtonId :
                                (m.mtype === 'listResponseMessage') ? m.message.listResponseMessage?.singleSelectReply?.selectedRowId :
                                    (m.mtype === 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage?.selectedId :
                                        m.text || '';
        }
        body = (typeof body === 'string') ? body : '';

        const cleanJid = (jid) => jid ? jid.split('@')[0].split(':')[0] + '@s.whatsapp.net' : '';
        const isOwner = [...(global.owner || []), global.ownernomer].map(v => v ? v.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : '').includes(cleanJid(m.sender));
        const isAdminBot = (global.adminbot || []).map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(cleanJid(m.sender)) || isOwner;
        const botNumber = cleanJid(global.botnumber || hydro.user.id);
        let groupSettings = m.isGroup ? global.db.groups[m.chat] : null;
        let activePrefixes = (groupSettings && groupSettings.prefix) ? groupSettings.prefix : (global.db.settings.prefix ? global.db.settings.prefix : global.prefix);
        if (!Array.isArray(activePrefixes)) activePrefixes = [activePrefixes];
        let matchedPrefix = activePrefixes.slice().sort((a, b) => b.length - a.length).find(p => body.startsWith(p));
        const prefix = matchedPrefix !== undefined ? matchedPrefix : activePrefixes[0];
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : "";
        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(" ");
        const pushname = m.pushName || "Misterius";

        let isBotMentioned = false;
        if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            isBotMentioned = m.message.extendedTextMessage.contextInfo.mentionedJid.includes(botNumber);
        }

        // Sapaan kalau bot di-tag doang
        // Karena di WA textnya bisa berupa "@Nama Bot", kita cek kalau dia nge-tag bot dan nggak ada pesan lain
        // Asumsinya kalau pesan dimulai dari @ dan ngga ada baris baru, serta panjangnya wajar untuk sebuah nama
        if (isBotMentioned && body.trim().startsWith('@') && body.trim().length < 40 && !body.includes('\n')) {
            return hydro.sendMessage(m.chat, {
                text: `Halo kak *${pushname}*! 👋\nAku adalah bot Multi-Device (WhatsApp & Discord).\n\n📌 *Prefix*: \`${prefix}\`\n👑 *Owner*: WhatsApp Owner / ID Discord: 1202397666835701830\n\nKetik \`${prefix}help\` atau \`${prefix}menu\` untuk melihat daftar command yang tersedia.`,
                mentions: [m.sender]
            }, { quoted: m });
        }

        // Catat log trafik WA (kecuali pesan dari bot sendiri)
        if (!m.key.fromMe) {
            let chatType = m.isGroup ? 'Grup' : 'Pribadi';
            logTraffic('WhatsApp', m.sender.split('@')[0], chatType);
        }

        // ==========================================
        //  KUMPUL GAMBAR UNTUK TOPDF MULTI-IMAGE
        // ==========================================
        if (!global.pdfMultiSessions) global.pdfMultiSessions = {};
        const pdfSession = global.pdfMultiSessions[m.sender];
        if (pdfSession && !isCmd) {
            const imgMsg = m.message?.imageMessage;
            if (imgMsg) {
                try {
                    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
                    const stream = await downloadContentFromMessage(imgMsg, 'image');
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }
                    if (buffer.length > 0) {
                        pdfSession.images.push(buffer);
                        await hydro.sendMessage(m.chat, { text: `✅ Gambar ke-${pdfSession.images.length} berhasil disimpan.` }, { quoted: m });
                    }
                } catch (e) { }
                // Otomatis batal setelah 10 menit
                if (Date.now() - pdfSession.startTime > 10 * 60 * 1000) {
                    delete global.pdfMultiSessions[m.sender];
                    await hydro.sendMessage(m.chat, { text: `⏰ Sesi kumpul gambar sudah expired (10 menit). Silakan mulai lagi.` }, { quoted: m });
                }
                return;
            }
        }

        // ==========================================         
        //  INISIALISASI GROUP ADMINS (ANTI-NYANGKUT)         
        // ==========================================         
        let groupMetadata = {};
        if (m.isGroup) {
            if (store && !store.groupMetadata) store.groupMetadata = {};
            groupMetadata = store?.groupMetadata?.[m.chat] || {};
            if (!groupMetadata.participants || groupMetadata.participants.length === 0) {
                try {
                    groupMetadata = await hydro.groupMetadata(m.chat);
                    if (store) store.groupMetadata[m.chat] = groupMetadata;
                } catch (e) { }
            }
        }
        let participants = m.isGroup ? (groupMetadata.participants || []) : [];
        let groupAdmins = m.isGroup ? participants.filter(v => v.admin === 'admin' || v.admin === 'superadmin').map(v => cleanJid(v.id || v.jid)) : [];
        let isGroupAdmins = m.isGroup ? groupAdmins.includes(cleanJid(m.sender)) : false;

        const adminRelatedCmds = ['addadmin', 'removeadmin', 'lockgc', 'unlockgc', 'adminmenu', 'admingroupmenu', 'help', 'menu', 'allmenu'];
        if (m.isGroup && !isGroupAdmins && adminRelatedCmds.includes(command)) {
            try {
                let freshMeta = await hydro.groupMetadata(m.chat);
                if (freshMeta && freshMeta.participants) {
                    if (store) store.groupMetadata[m.chat] = freshMeta;
                    participants = freshMeta.participants;
                    groupAdmins = participants.filter(v => v.admin === 'admin' || v.admin === 'superadmin').map(v => cleanJid(v.id || v.jid));
                    isGroupAdmins = groupAdmins.includes(cleanJid(m.sender));
                }
            } catch (e) { }
        }
        initDatabase(m, m.chat.endsWith('@newsletter'));

        // ==========================================         
        //  FUNGSI HELPER: UPDATE LIVE TRACK GRUP         
        // ==========================================         
        async function updateLiveTrack(listId) {
            let listData = global.db.lists[listId];
            if (!listData || listData.status !== 'open') return;
            let rekap = getQueueInfo(listId);
            let qMap = queues.get(listId) || new Map();
            let teksRekap = `  *LIVE TRACK LIST*\n  *${listData.nama}*\n\n`;
            if (listData.tipe === 'kelompok') {
                for (let k = 1; k <= listData.totalKelompok; k++) {
                    let members = Array.from(qMap.entries()).map(([sId, data]) => ({ sId, ...data })).filter(u => u.kelompok === k);
                    teksRekap += `  *Kelompok ${k}* (${members.length}/${listData.kuota})\n`;
                    if (members.length === 0) {
                        teksRekap += `  _(Kosong - Tersedia)_\n`;
                    } else {
                        members.forEach((u, i) => {
                            let role = u.isKetua ? ' ' : ' ';
                            let textData = (listData.perluData && u.isiData) ? ` : ${u.isiData}` : '';
                            teksRekap += `  ${i + 1}. ${role} ${u.namaPanggilan || 'Tanpa Nama'}${textData}\n`;
                        });
                    }
                    teksRekap += `\n`;
                }
            } else {
                rekap.forEach((u, i) => {
                    let textData = (listData.perluData && u.isiData) ? ` : ${u.isiData}` : '';
                    teksRekap += `${i + 1}. ${u.namaPanggilan || 'Tanpa Nama'}${textData}\n`;
                });
            }
            teksRekap += `\n_  Mau ikut/ubah data? DM bot & ketik .editlist_`;
            if (listData.msgKey) {
                try { await hydro.sendMessage(listData.target, { delete: listData.msgKey }); } catch (e) { }
            }
            let msg = generateWAMessageFromContent(listData.target, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                        interactiveMessage: {
                            body: { text: teksRekap },
                            nativeFlowMessage: {
                                buttons: [
                                    { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "  Ikut Ngelist", id: `${prefix}joinlist ${listId}` }) }
                                ]
                            }
                        }
                    }
                }
            }, {});
            let sent = await hydro.relayMessage(listData.target, msg.message, { messageId: msg.key.id });
            global.db.lists[listId].msgKey = msg.key;
            fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
        }
        async function prosesJoinList(senderId, listId, isiData) {
            let listData = global.db.lists[listId];
            let nama = global.db.users[senderId].nama;
            let limitKuota = listData.tipe === 'kelompok' ? 9999 : listData.kuota;
            let res = joinQueue(senderId, listId, limitKuota, global.db.lists, nama, isiData);
            hydro.sendMessage(senderId, { text: res.message });
            if (res.success) await updateLiveTrack(listId);
        }

        // ==========================================         
        //  SISTEM REGISTER WAJIB         
        // ==========================================         
        const requireReg = ['joinlist', 'editlist', 'materi', 'tugas', 'cektugas'];
        if (isCmd && requireReg.includes(command)) {
            if (!global.db.users[m.sender] || !global.db.users[m.sender].nim) {
                if (m.isGroup) {
                    hydro.sendMessage(m.chat, { text: `  Cek DM ya @${m.sender.split('@')[0]} buat isi biodata dulu!`, mentions: [m.sender] }, { quoted: m });
                }
                let sentMsg = await hydro.sendMessage(m.sender, { text: `Halo! Ini pertama kalinya kita ngobrol.\nBiar data tugas & antrean kamu rapi, kita isi biodata dulu ya.\n\nSilakan *REPLY* pesan ini dengan **Nama Panggilan** kamu:` });
                global.registerSessions[m.sender] = { step: 'panggilan', id: sentMsg.key.id, pendingCmd: body };
                return;
            }
        }

        // ==========================================         
        //  STATE MANAGEMENT: SESI TEXT REPLY         
        // ==========================================         
        const quotedMsgId = m.message?.extendedTextMessage?.contextInfo?.stanzaId;

        // 1. Sesi Register & Edit Profil         
        if (quotedMsgId && global.registerSessions[m.sender] && global.registerSessions[m.sender].id === quotedMsgId && body.trim()) {
            let session = global.registerSessions[m.sender];
            if (session.step === 'panggilan') {
                session.panggilan = body.trim();
                session.step = 'lengkap';
                let sentMsg = await hydro.sendMessage(m.chat, { text: `Oke *${session.panggilan}*, sekarang *REPLY* pesan ini dengan **Nama Lengkap** kamu (Sesuai absen):` });
                session.id = sentMsg.key.id;
                return;
            } else if (session.step === 'lengkap') {
                session.lengkap = body.trim();
                session.step = 'nim';
                let sentMsg = await hydro.sendMessage(m.chat, { text: `Sip! Terakhir, *REPLY* pesan ini dengan **NIM** lengkap kamu (Contoh: F5212510018):` });
                session.id = sentMsg.key.id;
                return;
            } else if (session.step === 'nim') {
                session.nim = body.trim();
                global.db.users[m.sender] = { nama: session.panggilan, namaLengkap: session.lengkap, nim: session.nim, nomor: m.sender.split('@')[0] };
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
                delete global.registerSessions[m.sender];
                await hydro.sendMessage(m.chat, { text: `  Pendaftaran Selesai!\n\nNama: *${session.lengkap}*\nNIM: *${session.nim}*\n\nSekarang kamu bisa menggunakan fitur bot!` });
                return;
            } else if (session.step.startsWith('edit_')) {
                let field = session.step.split('_')[1];
                let input = body.trim();
                if (field === 'panggilan') global.db.users[m.sender].nama = input;
                else if (field === 'lengkap') global.db.users[m.sender].namaLengkap = input;
                else if (field === 'nim') global.db.users[m.sender].nim = input;
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
                delete global.registerSessions[m.sender];
                let u = global.db.users[m.sender];
                let teksProfil = `  Profil berhasil diperbarui!\n\n  *PROFIL MAHASISWA*\n\n  *Nama Lengkap:* ${u.namaLengkap}\n  *Panggilan:* ${u.nama}\n  *NIM:* ${u.nim}\n  *Nomor WA:* ${u.nomor}`;
                return hydro.sendMessage(m.chat, { text: teksProfil });
            }
        }

        // 2. Sesi Input Data / Edit List Kelompok & Perorangan         
        if (quotedMsgId && body.trim() && !m.isGroup) {
            if (global.isiDataSessions[m.sender] && global.isiDataSessions[m.sender].id === quotedMsgId) {
                let session = global.isiDataSessions[m.sender];
                let listData = global.db.lists[session.listId];
                let isiDataInput = body.trim();
                if (listData.uniqueData) {
                    let isDuplicate = false;
                    let qMap = queues.get(session.listId);
                    if (qMap) {
                        for (let [sId, uData] of qMap.entries()) {
                            if (uData.isiData && uData.isiData.toLowerCase() === isiDataInput.toLowerCase()) {
                                isDuplicate = true; break;
                            }
                        }
                    }
                    if (isDuplicate) {
                        let sentMsg = await hydro.sendMessage(m.chat, { text: `  Waduh, data *${isiDataInput}* udah dipakai sama pendaftar lain nih!\n\nSilakan *REPLY* pesan ini pakai data yang beda ya:` });
                        global.isiDataSessions[m.sender].id = sentMsg.key.id;
                        return;
                    }
                }
                if (listData.tipe === 'kelompok') {
                    if (!queues.has(session.listId)) queues.set(session.listId, new Map());
                    let qMap = queues.get(session.listId);
                    qMap.set(m.sender, { namaPanggilan: global.db.users[m.sender].nama, isiData: isiDataInput, kelompok: session.kelompok, isKetua: session.isKetua, time: Date.now() });
                    hydro.sendMessage(m.chat, { text: `  Berhasil bergabung di Kelompok ${session.kelompok}!` });
                    updateLiveTrack(session.listId);
                } else {
                    prosesJoinList(m.sender, session.listId, isiDataInput);
                }
                delete global.isiDataSessions[m.sender];
                return;
            }

            if (global.editListSessions[m.sender] && global.editListSessions[m.sender].id === quotedMsgId) {
                let listId = global.editListSessions[m.sender].listId;
                let newIsiData = body.trim();
                let listData = global.db.lists[listId];
                if (listData.uniqueData) {
                    let isDuplicate = false;
                    let qMap = queues.get(listId);
                    if (qMap) {
                        for (let [sId, uData] of qMap.entries()) {
                            if (sId !== m.sender && uData.isiData && uData.isiData.toLowerCase() === newIsiData.toLowerCase()) {
                                isDuplicate = true; break;
                            }
                        }
                    }
                    if (isDuplicate) {
                        let sentMsg = await hydro.sendMessage(m.chat, { text: `  Waduh, data *${newIsiData}* udah dipakai sama pendaftar lain nih!\n\nSilakan *REPLY* pesan ini pakai data yang beda ya:` });
                        global.editListSessions[m.sender].id = sentMsg.key.id;
                        return;
                    }
                }
                delete global.editListSessions[m.sender];
                if (queues.has(listId) && queues.get(listId).has(m.sender)) {
                    queues.get(listId).get(m.sender).isiData = newIsiData;
                    hydro.sendMessage(m.chat, { text: "  Datamu berhasil diubah! Cek grup untuk melihat update." });
                    updateLiveTrack(listId);
                }
                return;
            }
        }

        // 3. Sesi Edit MK Biasa         
        if (quotedMsgId && global.editSessions[m.sender] && global.editSessions[m.sender].id === quotedMsgId) {
            let session = global.editSessions[m.sender];
            let newValue = body.trim();
            if (newValue) {
                clearTimeout(session.timeout);
                if (session.isPrak) global.db.mk_si_2025[session.index].praktikum[session.field] = newValue;
                else global.db.mk_si_2025[session.index][session.field] = newValue;
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
                hydro.sendMessage(m.chat, { text: `  Berhasil! *${session.field}* telah diubah menjadi:\n*${newValue}*` }, { quoted: m });
                delete global.editSessions[m.sender];
                return;
            }
        }

        // 3.5 Sesi Bikin PDF Nama Custom
        if (quotedMsgId && global.pdfSessions[m.sender] && global.pdfSessions[m.sender].id === quotedMsgId && body.trim()) {
            let session = global.pdfSessions[m.sender];
            let filename = body.trim();
            const cmd = hydro.commands.get('topdf');
            if (cmd) {
                m.specialPdfMedia = session.targetMedia;
                m.specialPdfIsImage = session.isImage;

                delete global.pdfSessions[m.sender];
                try {
                    await cmd.execute(hydro, m, filename.split(' '), filename, { prefix, pushname, isOwner, isAdminBot, store });
                } catch (e) {
                    console.error("PDF Reply Error:", e);
                }
            }
            return;
        }

        // 4. Sesi Multi-step Buat List         
        if (global.buatListSessions[m.sender] && !isCmd && m.mtype !== 'interactiveResponseMessage' && body.trim()) {
            let session = global.buatListSessions[m.sender];
            let input = body.trim();
            if (session.step === 'kuota') {
                if (isNaN(input)) return hydro.sendMessage(m.chat, { text: "  Harus angka ya Shapak!" }, { quoted: m });
                session.kuota = parseInt(input);
                if (session.tipe === 'kelompok') {
                    session.totalKelompok = Math.ceil(session.totalOrang / session.kuota);
                }
                session.step = 'kategori';
                let msg = generateWAMessageFromContent(m.chat, {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                            interactiveMessage: {
                                body: { text: `Sip! Kuota: *${session.kuota} orang${session.tipe === 'kelompok' ? '/kelompok' : ''}*.\n${session.tipe === 'kelompok' ? `\nTerestimasi: *${session.totalKelompok} Kelompok* (dari total ${session.totalOrang} member grup).\n` : ''}\nSekarang, pilih kategori list ini:` },
                                nativeFlowMessage: { buttons: [{ name: "single_select", buttonParamsJson: JSON.stringify({ title: "PILIH KATEGORI", sections: [{ title: "Kategori", rows: [{ title: "Mata Kuliah", id: `${prefix}bl_kategori mk` }, { title: "Praktikum", id: `${prefix}bl_kategori praktikum` }, { title: "Lainnya", id: `${prefix}bl_kategori lainnya` }] }] }) }] }
                            }
                        }
                    }
                }, { quoted: m });
                return hydro.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
            } else if (session.step === 'nama_text') {
                session.nama = input;
                session.step = 'perlu_data';
                let msg = generateWAMessageFromContent(m.chat, {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                            interactiveMessage: {
                                body: { text: `Apakah setiap orang yang ngisi list ini perlu *ngisi data* tambahan? (Misal: NIM, Alasan, dsb)` },
                                nativeFlowMessage: { buttons: [{ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "  Ya, Perlu", id: `${prefix}bl_data ya` }) }, { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "  Enggak", id: `${prefix}bl_data tidak` }) }] }
                            }
                        }
                    }
                }, { quoted: m });
                return hydro.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
            } else if (session.step === 'deadline_text') {
                session.deadline = input;
                let listId = `list_${Date.now()}`;
                global.db.lists[listId] = {
                    nama: session.nama, kategori: session.kategori, tipe: session.tipe,
                    kuota: session.kuota, totalKelompok: session.totalKelompok, target: session.target, perluData: session.perluData,
                    uniqueData: session.uniqueData, deadline: session.deadline, pembuat: m.sender, status: 'open'
                };
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
                hydro.sendMessage(m.chat, { text: `  List berhasil dibuat dan disebar!` }, { quoted: m });
                delete global.buatListSessions[m.sender];
                await updateLiveTrack(listId);
                return;
            }
        }

        // 5. Sesi Buat Tugas Admin
        if (global.buatTugasSessions[m.sender]) {
            let session = global.buatTugasSessions[m.sender];
            let input = body.trim();
            let isInteractive = (m.mtype === 'interactiveResponseMessage' || m.message?.interactiveResponseMessage);

            if (isInteractive) {
                if (session.step === 'pilih_mk' && (input.includes('bt_mk_') || input.includes('bt_prak_'))) {
                    session.isPrak = input.includes('bt_prak_');
                    session.mkIndex = parseInt(input.split('_').pop());
                    session.step = 'input_pertemuan';
                    return hydro.sendMessage(m.chat, { text: `Sip! MK disetel.\nSekarang ketik **Pertemuan Ke-berapa?** (Contoh: 1)` }, { quoted: m });
                }

                if (session.step === 'ask_tenggat' && input.includes('bt_tenggat')) {
                    if (input.includes('ya')) {
                        session.step = 'input_tgl';
                        return hydro.sendMessage(m.chat, { text: `Tulis tanggal deadlinenya (Contoh: 15 Mei 2026):` }, { quoted: m });
                    } else {
                        session.deadline = "Tidak ada";
                        session.step = 'input_jam';
                        input = "skip";
                    }
                }
            }

            if (!isCmd || session.step === 'input_jam') {
                if (session.step === 'input_pertemuan' && input) {
                    session.pertemuan = input;
                    session.step = 'input_nama';
                    return hydro.sendMessage(m.chat, { text: `Ketik Nama Tugasnya (Contoh: Makalah Jaringan):` });
                } else if (session.step === 'input_nama' && input) {
                    session.namaTugas = session.pertemuan ? `[Pertemuan ${session.pertemuan}] ${input}` : input;
                    session.step = 'ask_tenggat';
                    let msg = generateWAMessageFromContent(m.chat, {
                        viewOnceMessage: {
                            message: {
                                messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                                interactiveMessage: {
                                    body: { text: `Apakah tugas ini ada deadlinenya?` },
                                    nativeFlowMessage: {
                                        buttons: [
                                            { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "Ada", id: `${prefix}bt_tenggat ya` }) },
                                            { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "Gak Ada", id: `${prefix}bt_tenggat tidak` }) }
                                        ]
                                    }
                                }
                            }
                        }
                    }, { quoted: m });
                    return hydro.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
                } else if (session.step === 'input_tgl' && input) {
                    session.tgl = input;
                    session.step = 'input_jam';
                    return hydro.sendMessage(m.chat, { text: `Jam berapa deadlinenya? (Contoh: 23:59):` });
                }
            }

            if (session.step === 'input_jam' && input) {
                if (session.deadline !== "Tidak ada") session.deadline = `${session.tgl} - ${input} WITA`;

                hydro.sendMessage(m.chat, { text: `Sedang membuat folder tugas di Google Drive...` });
                try {
                    const drive = await getDriveClient();
                    const mk = global.db.mk_si_2025[session.mkIndex];
                    let parentFolderId = session.isPrak ? mk.praktikum.tugasPrakFolderId : mk.tugasMkFolderId;

                    let createdFolder = await getOrCreateFolder(drive, session.namaTugas, parentFolderId);
                    let tugasId = `tgs_${Date.now()}`;

                    global.db.tugas[tugasId] = {
                        mkName: mk.singkatan, isPrak: session.isPrak, namaTugas: session.namaTugas,
                        deadline: session.deadline, folderId: createdFolder.id, link: createdFolder.link,
                        submissions: {}, status: 'open'
                    };
                    fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));

                    hydro.sendMessage(m.chat, { text: `*TUGAS BERHASIL DIBUAT!*\n\nMK: ${mk.singkatan}\nTugas: ${session.namaTugas}\nTenggat: ${session.deadline}\n\nLink Drive:\n${createdFolder.link}` });
                } catch (e) { hydro.sendMessage(m.chat, { text: `Gagal: ${e.message}` }); }

                delete global.buatTugasSessions[m.sender];
                return;
            }
        }

        // 6. Sesi UPLOAD JAWABAN TUGAS         
        let baseMsgKumpul = m.message.extendedTextMessage?.contextInfo?.quotedMessage ? m.message.extendedTextMessage.contextInfo.quotedMessage : m.message;
        let mediaKumpul = baseMsgKumpul.documentMessage || baseMsgKumpul.imageMessage || baseMsgKumpul.documentWithCaptionMessage?.message?.documentMessage;

        if (global.kumpulTugasSessions[m.sender] && !isCmd && mediaKumpul) {
            let session = global.kumpulTugasSessions[m.sender];
            let tugasId = session.tugasId;
            let tugasData = global.db.tugas[tugasId];
            if (!tugasData) return;
            hydro.sendMessage(m.chat, { text: `  Sedang mengunggah jawabanmu ke Google Drive...` }, { quoted: m });
            try {
                let isImg = !!(baseMsgKumpul.imageMessage);
                let stream = await downloadContentFromMessage(mediaKumpul, isImg ? 'image' : 'document');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }

                let mimeType = mediaKumpul.mimetype || 'application/octet-stream';
                let ext = mimeType.split('/')[1];
                if (ext.includes('document')) ext = 'docx';
                if (mimeType.includes('pdf')) ext = 'pdf';
                if (mimeType.includes('zip')) ext = 'zip';

                let uData = global.db.users[m.sender];
                let fileName = `[${uData.nim}] ${uData.namaLengkap.toUpperCase()}.${ext}`;

                const drive = await getDriveClient();
                if (tugasData.submissions[m.sender] && tugasData.submissions[m.sender].fileId) {
                    await deleteDriveFile(drive, tugasData.submissions[m.sender].fileId);
                }

                const publicLink = await uploadToDrive(buffer, fileName, mimeType, tugasData.folderId);
                let fileIdMatch = publicLink.match(/id=([a-zA-Z0-9_-]+)/);
                let newFileId = fileIdMatch ? fileIdMatch[1] : null;

                global.db.tugas[tugasId].submissions[m.sender] = { time: moment().tz("Asia/Makassar").format('DD/MM/YYYY HH:mm:ss'), link: publicLink, fileId: newFileId };
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));

                hydro.sendMessage(m.chat, { text: `  *TUGAS BERHASIL DIKUMPULKAN!*\n\n  Nama File: ${fileName}\n  Link File kamu:\n${publicLink}\n\n_Catatan: Jika ada perbaikan, kamu bisa klik "Edit Tugas" di menu .cektugas_` }, { quoted: m });
                delete global.kumpulTugasSessions[m.sender];
            } catch (err) {
                hydro.sendMessage(m.chat, { text: `  Gagal kumpul tugas: ${err.message}` }, { quoted: m });
                delete global.kumpulTugasSessions[m.sender];
            }
            return;
        }

        // 7. Sesi Namain File Upload Admin         
        if (global.uploadSessions[m.sender] && !isCmd && body.trim() && global.uploadSessions[m.sender].step === 'tunggu_nama') {
            let session = global.uploadSessions[m.sender];
            let inputName = body.trim();
            session.finalName = `[Pertemuan ${session.pert}] ${inputName}.${session.ext}`;
            hydro.sendMessage(m.chat, { text: `  Sedang mengunggah *${session.finalName}* ke folder *${session.lbl}*...` });
            try {
                let buffer = fs.readFileSync(session.tmpPath);
                const publicLink = await uploadToDrive(buffer, session.finalName, session.mimeType, session.folderId);
                hydro.sendMessage(m.chat, { text: `  File berhasil diunggah!\n\n  *${session.finalName}*\n  *Link Akses:*\n${publicLink}` });
            } catch (err) {
                hydro.sendMessage(m.chat, { text: `  Gagal upload ke Drive: ${err.message}` });
            } finally {
                clearTimeout(session.timeout);
                if (fs.existsSync(session.tmpPath)) fs.unlinkSync(session.tmpPath);
                delete global.uploadSessions[m.sender];
            }
            return;
        }

        // ==========================================         
        //  COMMAND HANDLER EXECUTION         
        // ==========================================         
        if (isCmd) {
            const cmd = hydro.commands.get(command);
            if (cmd) {
                try {
                    await cmd.execute(hydro, m, args, text, { isGroupAdmins, isOwner, isAdminBot, prefix, pushname, command, store });

                    // --- WEBHOOK LOGGING TRX ---
                    if (global.discordWebhook) {
                        try {
                            const chatName = m.isGroup ? (store.groupMetadata?.[m.chat]?.subject || m.chat) : 'Private Chat';
                            const senderName = pushname || m.sender.split('@')[0];
                            const logData = {
                                content: null,
                                embeds: [{
                                    title: "🚀 Transaction Log",
                                    color: 5814783, // Cyan/Blue
                                    fields: [
                                        { name: "👤 Pengguna", value: `${senderName}\n(${m.sender.split('@')[0]})`, inline: true },
                                        { name: "🏠 Lokasi", value: `${chatName}`, inline: true },
                                        { name: "⚙️ Command", value: `\`${prefix}${command} ${text}\``.trim(), inline: false }
                                    ],
                                    timestamp: new Date().toISOString()
                                }]
                            };
                            axios.post(global.discordWebhook, logData).catch(() => { });
                        } catch (e) { }
                    }
                    // ---------------------------
                } catch (err) {
                    console.error(err);
                    hydro.sendMessage(m.chat, { text: `Gagal menjalankan command: ${err.message}` }, { quoted: m });
                }
            }
        }
    } catch (err) {
        console.log(util.format(err));
    }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`[ UPDATE ] '${__filename}'`));
    delete require.cache[file];
    require(file);
});

// --- AUTO CLEANER BY GEMINI --- 
setInterval(() => {
    const directory = ['./tmp', './media'];
    directory.forEach(dir => {
        const folderPath = path.join(__dirname, dir);
        if (fs.existsSync(folderPath)) {
            fs.readdirSync(folderPath).forEach(file => {
                if (file !== '.gitignore') {
                    try {
                        fs.unlinkSync(path.join(folderPath, file));
                    } catch (e) { }
                }
            });
        }
    });
    console.log('--- Sampah STB Berhasil Dibersihkan Otomatis ---');
}, 30 * 60 * 1000);