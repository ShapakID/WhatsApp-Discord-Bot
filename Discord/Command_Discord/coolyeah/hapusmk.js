const fs = require('fs');

module.exports = {
    name: 'hapusmk',
    async execute(message, args) {
        const isOwner = message.author.id === '1202397666835701830';
        if (!isOwner) return;

        if (global.db.mk_si_2025.length === 0) {
            return message.reply("Belum ada daftar Mata Kuliah.");
        }

        let index = parseInt(args[0]);

        if (isNaN(index) || index < 1 || index > global.db.mk_si_2025.length) {
            let list = global.db.mk_si_2025.map((mk, i) => `**${i + 1}.** ${mk.singkatan} (${mk.hari} | ${mk.jam})`).join('\n');
            return message.reply(`⚠️ **HAPUS MK**\nPilih ID MK yang ingin dihapus dengan format \`.hapusmk [ID]\`\n\n**Daftar MK:**\n${list}`);
        }

        let removed = global.db.mk_si_2025.splice(index - 1, 1);
        fs.writeFileSync('./Data/database.json', JSON.stringify(global.db, null, 2));

        message.reply(`✅ Berhasil menghapus MK **${removed[0].singkatan}**!`);
    }
};
