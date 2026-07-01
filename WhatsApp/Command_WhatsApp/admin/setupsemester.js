const fs = require('fs');
// Pastikan fungsi ini sudah di-export di lib/drive.js ya!
const { getDriveClient, getOrCreateFolder } = require('../../lib/drive'); 

module.exports = {
    name: 'setupsemester',
    execute: async (hydro, m, args, text, { isAdminBot, prefix }) => {
        if (!isAdminBot) return hydro.sendMessage(m.chat, { text: "Khusus Admin Bot." }, { quoted: m });
        let semester = args[0];
        if (!semester) return hydro.sendMessage(m.chat, { text: `Sebutkan semesternya!\nContoh: *${prefix}setupsemester 2*` }, { quoted: m });
        if (!global.driveFolderId) return hydro.sendMessage(m.chat, { text: `  global.driveFolderId belum diisi di settings.js!` }, { quoted: m });
        
        hydro.sendMessage(m.chat, { text: `  Mengecek & Sinkronisasi folder Semester ${semester} di Google Drive...\nSabar ya, proses ini ngecek folder satu-satu biar nggak duplikat.` }, { quoted: m });
        
        try {
            const drive = await getDriveClient();
            if (!drive) throw new Error("Google Drive API tidak siap (cek token/credentials).");
            const semFolder = await getOrCreateFolder(drive, `Semester ${semester}`, global.driveFolderId);
            
            const materiFolder = await getOrCreateFolder(drive, 'Materi', semFolder.id);
            const tugasFolder = await getOrCreateFolder(drive, 'Tugas', semFolder.id);
            
            const materiMkFolder = await getOrCreateFolder(drive, 'Mata Kuliah', materiFolder.id);
            const materiPrakFolder = await getOrCreateFolder(drive, 'Praktikum', materiFolder.id);
            
            const tugasMkFolder = await getOrCreateFolder(drive, 'Mata Kuliah', tugasFolder.id);
            const tugasPrakFolder = await getOrCreateFolder(drive, 'Praktikum', tugasFolder.id);
            
            global.db.settings.semester = semester;
            global.db.settings.semesterFolderId = semFolder.id;
            global.db.settings.semesterLink = semFolder.link;
            
            for (let i = 0; i < global.db.mk_si_2025.length; i++) {
                let mk = global.db.mk_si_2025[i];
                let mkName = `${mk.singkatan} - ${mk.nama}`;
                let prakName = `[PRAK] ${mk.singkatan}`;
                
                let mMk = await getOrCreateFolder(drive, mkName, materiMkFolder.id);
                global.db.mk_si_2025[i].materiMkFolderId = mMk.id;
                let tMk = await getOrCreateFolder(drive, mkName, tugasMkFolder.id);
                global.db.mk_si_2025[i].tugasMkFolderId = tMk.id;
                
                if (mk.praktikum && mk.praktikum.hari !== '-') {
                    let mPrak = await getOrCreateFolder(drive, prakName, materiPrakFolder.id);
                    global.db.mk_si_2025[i].praktikum.materiPrakFolderId = mPrak.id;
                    let tPrak = await getOrCreateFolder(drive, prakName, tugasPrakFolder.id);
                    global.db.mk_si_2025[i].praktikum.tugasPrakFolderId = tPrak.id;
                }
            }
            fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
            hydro.sendMessage(m.chat, { text: `  SUKSES! Semua Folder (Materi, Tugas, MK, dan Praktikum) berhasil disinkronisasi.\n\n  Link Folder Semester ${semester}:\n${semFolder.link}` }, { quoted: m });
        } catch (err) {
            hydro.sendMessage(m.chat, { text: `  Gagal memproses folder:\n${err.message}` }, { quoted: m });
        }
    }
};