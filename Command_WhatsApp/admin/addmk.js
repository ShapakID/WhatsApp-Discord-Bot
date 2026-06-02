const fs = require('fs');

module.exports = {
    name: 'addmk',
    execute: async (hydro, m, args, text, { isAdminBot, prefix, command }) => {
        if (!isAdminBot) return hydro.sendMessage(m.chat, { text: "Command ini khusus admin bot." }, { quoted: m });
        let argsArray = text.split("|").map(v => v.trim());
        
        if (argsArray.length < 6) return hydro.sendMessage(m.chat, { text: `Format salah!\nContoh:\n*${prefix + command} Senin | 10:00 - 12:30 | arsi | Arsitektur Teknologi Sistem Informasi Cerdas | SG 5 | Dr. H. Mohammad Yazdi, Fizar Syafa'at*` }, { quoted: m });
        
        let [hari, jam, singkatan, nama, ruangan, dosen] = argsArray;
        global.db.mk_si_2025.push({ hari, jam, singkatan, nama, ruangan, dosen });
        fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
        hydro.sendMessage(m.chat, { text: `  Berhasil menambahkan MK *${singkatan}* untuk hari *${hari}*!` }, { quoted: m });
    }
};