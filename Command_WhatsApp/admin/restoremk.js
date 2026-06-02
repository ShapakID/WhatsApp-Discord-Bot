const fs = require('fs');

module.exports = {
    name: 'restoremk',
    execute: async (hydro, m, args, text, { isAdminBot, prefix }) => {
        if (!isAdminBot) return hydro.sendMessage(m.chat, { text: "Khusus admin bot." }, { quoted: m });
        if (!text) return hydro.sendMessage(m.chat, { text: `Reply/paste teks backup-nya!\nContoh: *${prefix}restoremk [PASTE TEKS]*` }, { quoted: m });
        
        let restoredCount = 0;
        let regex = /\d+\.\s+\*\*\[(.*?)\]\s+([^(]+?)\s+\((.*?)\)\*\*\n\s*Jam:\s*(.*?)\n\s*Ruangan:\s*(.*?)\n\s*Dosen:\s*([^\n]+)(?:\n\s* \s*Praktikum:\s*(.*?)\s*\|\s*(.*?)\s*\|\s*([^\n]+))?(?=\n\n|\n\d+\.|$)/gs;
        let match;
        
        while ((match = regex.exec(text)) !== null) {
            let [full, hari, nama, singkatan, jam, ruangan, dosen, prakHari, prakJam, prakRuang] = match;
            let dataPrak = { hari: '-', jam: '-', ruangan: '-' };
            if (prakHari && prakJam && prakRuang) dataPrak = { hari: prakHari.trim(), jam: prakJam.trim(), ruangan: prakRuang.trim() };
            
            global.db.mk_si_2025.push({ 
                hari: hari.trim(), jam: jam.trim(), singkatan: singkatan.trim(), 
                nama: nama.trim(), ruangan: ruangan.trim(), dosen: dosen.trim(), praktikum: dataPrak 
            });
            restoredCount++;
        }
        
        if (restoredCount > 0) {
            fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
            hydro.sendMessage(m.chat, { text: `  Berhasil me-restore *${restoredCount}* Mata Kuliah (beserta praktikum) dari backup!\n\n_Penting: Setelah restore, wajib jalankan command .setupsemester <semester> agar folder tersinkronisasi!_` }, { quoted: m });
        } else {
            hydro.sendMessage(m.chat, { text: "  Gagal parsing teks backup. Cek formatnya lagi." }, { quoted: m });
        }
    }
};