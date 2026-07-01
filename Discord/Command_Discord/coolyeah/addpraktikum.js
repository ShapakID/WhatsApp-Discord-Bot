const fs = require('fs');

module.exports = {
    name: 'addpraktikum',
    async execute(message, args) {
        const isOwner = message.author.id === '1202397666835701830';
        if (!isOwner) return;

        if (global.db.mk_si_2025.length === 0) {
            return message.reply("Belum ada daftar Mata Kuliah. Buat MK dulu!");
        }

        let text = args.join(' ');
        let argsArray = text.split("|").map(v => v.trim());

        if (argsArray.length < 4) {
            let list = global.db.mk_si_2025.map((mk, i) => `**${i + 1}.** ${mk.singkatan}`).join('\n');
            return message.reply(`⚠️ **TAMBAH PRAKTIKUM**\nGunakan format: \`.addpraktikum [ID_MK] | [hari] | [jam] | [ruangan]\`\nContoh: \`.addpraktikum 1 | Rabu | 13:00 - 15:30 | Lab Komputer 2\`\n\n**Daftar MK:**\n${list}`);
        }

        let index = parseInt(argsArray[0]);
        let hari = argsArray[1];
        let jam = argsArray[2];
        let ruangan = argsArray[3];

        if (isNaN(index) || index < 1 || index > global.db.mk_si_2025.length) {
            return message.reply(`ID MK tidak valid! Pilih dari 1 sampai ${global.db.mk_si_2025.length}`);
        }

        let mk = global.db.mk_si_2025[index - 1];
        mk.praktikum = { hari, jam, ruangan };
        fs.writeFileSync('./Data/database.json', JSON.stringify(global.db, null, 2));

        message.reply(`✅ Berhasil menambahkan jadwal Praktikum untuk MK **${mk.singkatan}** pada hari **${hari}**!`);
    }
};
