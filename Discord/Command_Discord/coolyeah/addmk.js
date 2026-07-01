const fs = require('fs');

module.exports = {
    name: 'addmk',
    async execute(message, args) {
        const isOwner = message.author.id === '1202397666835701830';
        if (!isOwner) return; // Silent return karena owner aja yg boleh tahu

        const text = args.join(' ');
        let argsArray = text.split("|").map(v => v.trim());

        if (argsArray.length < 6) return message.reply(`Format salah!\nContoh:\n\`.addmk Senin | 10:00 - 12:30 | arsi | Arsitektur Teknologi Sistem Informasi Cerdas | SG 5 | Dr. H. Mohammad Yazdi, Fizar Syafa'at\``);

        let [hari, jam, singkatan, nama, ruangan, dosen] = argsArray;
        if (!global.db.mk_si_2025) global.db.mk_si_2025 = [];
        global.db.mk_si_2025.push({ hari, jam, singkatan, nama, ruangan, dosen });
        fs.writeFileSync('./Data/database.json', JSON.stringify(global.db, null, 2));

        message.reply(`✅ Berhasil menambahkan MK **${singkatan}** untuk hari **${hari}**!`);
    }
};
