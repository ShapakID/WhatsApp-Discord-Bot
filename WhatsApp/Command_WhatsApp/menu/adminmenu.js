module.exports = {
    name: 'adminmenu',
    execute: async (hydro, m, args, text, { isAdminBot, prefix }) => {
        if (!isAdminBot) return hydro.sendMessage(m.chat, { text: "Command ini khusus admin bot." }, { quoted: m });
        let textAdm = `  [ *ADMIN BOT* ]  \n`;
        textAdm += `  -- MK & Praktikum --\n`;
        textAdm += `  *${prefix}addmk* - Tambah MK manual\n`;
        textAdm += `  *${prefix}editmk* - Edit MK (Full Button)\n`;
        textAdm += `  *${prefix}hapusmk* - Hapus MK\n`;
        textAdm += `  *${prefix}resetmk* - Reset & Backup ke Discord\n`;
        textAdm += `  *${prefix}restoremk* - Restore teks dari Discord\n`;
        textAdm += `  *${prefix}addpraktikum* - Tambah slot praktikum di MK\n`;
        textAdm += `  -- Manajemen List Dinamis --\n`;
        textAdm += `  *${prefix}buatlist* - Bikin antrean (Full Button)\n`;
        textAdm += `  *${prefix}stoplist* - Tutup antrean\n`;
        textAdm += `  -- Manajemen Tugas & Drive --\n`;
        textAdm += `  *${prefix}buattugas* - Buat sesi kumpul tugas mhs\n`;
        textAdm += `  *${prefix}setupsemester* - Generate struktur GDrive\n`;
        textAdm += `  *${prefix}upload* - Upload materi/tugas ke GDrive\n`;
        hydro.sendMessage(m.chat, { text: textAdm }, { quoted: m });
    }
};