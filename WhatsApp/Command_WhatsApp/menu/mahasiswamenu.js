module.exports = {
    name: 'mahasiswamenu',
    execute: async (hydro, m, args, text, { prefix }) => {
        let textMhs = `  [ *MAHASISWA SI-A 2025* ]  \n`;
        textMhs += `  *${prefix}daftar* - Registrasi Akun\n`;
        textMhs += `  *${prefix}profil* - Cek Profil Mahasiswa\n`;
        textMhs += `  *${prefix}listmk* - Menampilkan daftar MK\n`;
        textMhs += `  *${prefix}cektugas* - Cek & Kumpul Tugas\n`;
        textMhs += `  *${prefix}materi* - Lihat & Download materi MK\n`;
        textMhs += `  *${prefix}tugas* - Lihat Folder Tugas (Read Only)\n`;
        textMhs += `  *${prefix}drive* - Link Google Drive semester ini\n`;
        textMhs += `  *${prefix}ngelist* - Tampilkan List yang lagi Open\n`;
        textMhs += `  *${prefix}editlist* - Edit data antrean (di DM)\n`;
        textMhs += `  *${prefix}listkelompok* - Cek anggota kelompok\n`;
        hydro.sendMessage(m.chat, { text: textMhs }, { quoted: m });
    }
};