module.exports = {
    name: 'allmenu',
    execute: async (hydro, m, args, text, { isAdminBot, isGroupAdmins, isOwner, prefix, pushname }) => {
        let helpText = `Halo *${pushname}*, ini daftar lengkap command bot:\n\n`;


        helpText += `  [ *DOWNLOAD MENU* ]  \n`;
        helpText += `  *${prefix}tt* - Download video TikTok (No WM)\n`;
        helpText += `  *${prefix}ig* - Download Instagram (Media/Audio)\n`;
        helpText += `  *${prefix}yt* - Download YouTube (MP3/MP4)\n`;
        helpText += `  *${prefix}fb* - Download Facebook Video\n\n`;

        helpText += `  [ *GENERAL MENU* ]  \n`;
        helpText += `  *${prefix}donate* - Donasi mendukung bot (Otomatis QRIS)\n\n`;

        helpText += `  [ *TOOLS MENU* ]  \n`;
        helpText += `  *${prefix}topdf* - Konversi gambar/dokumen ke PDF\n`;
        helpText += `  *${prefix}setsticker* - Buat stiker wm Shapak\n\n`;

        if (isAdminBot) {
            helpText += `  [ *ADMIN BOT* ]  \n`;
            helpText += `  *${prefix}buattugas* - Buat sesi kumpul tugas mhs\n`;
            helpText += `  *${prefix}addmk* | *${prefix}editmk* | *${prefix}hapusmk*\n`;
            helpText += `  *${prefix}resetmk* | *${prefix}restoremk*\n`;
            helpText += `  *${prefix}addpraktikum*\n`;
            helpText += `  *${prefix}buatlist* | *${prefix}stoplist*\n`;
            helpText += `  *${prefix}setupsemester* | *${prefix}upload*\n\n`;
        }

        if (isGroupAdmins || isOwner) {
            helpText += `  [ *ADMIN GROUP* ]  \n`;
            helpText += `  *${prefix}lockgc* | *${prefix}unlockgc*\n`;
            helpText += `  *${prefix}addadmin* | *${prefix}removeadmin*\n\n`;
        }

        if (isOwner) {
            helpText += `  [ *OWNER SYSTEM* ]  \n`;
            helpText += `  *${prefix}listuser* - Lihat data mahasiswa register\n`;
            helpText += `  *${prefix}setpp* - Ubah foto profil bot\n`;

            helpText += `  *${prefix}addadminbot* | *${prefix}removeadminbot*\n`;
            helpText += `  *${prefix}addowner* | *${prefix}removeowner*\n`;
            helpText += `  *${prefix}getjid* | *${prefix}ping*\n\n`;

            helpText += `  [ *PREDIKSI TRAFIK* ]  \n`;
            helpText += `  *${prefix}prediksi* - Analisis & prediksi trafik bot\n`;
            helpText += `  *${prefix}prediksidoc* - Download Laporan PDF + CSV\n\n`;
        }

        helpText += `_By ${global.botname}_`;
        hydro.sendMessage(m.chat, { text: helpText }, { quoted: m });
    }
};