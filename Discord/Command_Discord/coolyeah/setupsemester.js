const fs = require('fs');
let getDriveClient, getOrCreateFolder;
try {
    const driveMod = require('../../../lib/drive');
    getDriveClient = driveMod.getDriveClient;
    getOrCreateFolder = driveMod.getOrCreateFolder;
} catch (e) {}

module.exports = {
    name: 'setupsemester',
    async execute(message, args) {
        const isOwner = message.author.id === '1202397666835701830';
        if (!isOwner) return;

        let semester = args[0];
        if (!semester) return message.reply(`Sebutkan semesternya!\nContoh: \`.setupsemester 2\``);
        if (!global.driveFolderId) return message.reply(`global.driveFolderId belum diisi di settings.js!`);

        const sent = await message.reply(`Mengecek & Sinkronisasi folder Semester ${semester} di Google Drive...\nSabar ya, proses ini ngecek folder satu-satu biar nggak duplikat.`);

        if (!getDriveClient) return sent.edit("❌ Fitur setup semester dinonaktifkan (modul dihapus untuk menghemat memori STB).");

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
            fs.writeFileSync('./Data/database.json', JSON.stringify(global.db, null, 2));
            await sent.edit(`✅ **SUKSES!** Semua Folder (Materi, Tugas, MK, dan Praktikum) berhasil disinkronisasi.\n\n🔗 **Link Folder Semester ${semester}:**\n${semFolder.link}`);
        } catch (err) {
            await sent.edit(`❌ Gagal memproses folder:\n${err.message}`);
        }
    }
};
