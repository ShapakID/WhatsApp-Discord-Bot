const fs = require('fs');

module.exports = {
    name: 'editmk',
    async execute(message, args) {
        const isOwner = message.author.id === '1202397666835701830';
        if (!isOwner) return;

        if (global.db.mk_si_2025.length === 0) {
            return message.reply("Belum ada daftar Mata Kuliah.");
        }

        let index = parseInt(args[0]);
        let field = args[1];
        let newValue = args.slice(2).join(' ');

        if (isNaN(index) || index < 1 || index > global.db.mk_si_2025.length || !field || !newValue) {
            let list = global.db.mk_si_2025.map((mk, i) => `**${i + 1}.** ${mk.singkatan} (${mk.hari} | ${mk.jam})`).join('\n');
            return message.reply(`⚠️ **EDIT MK**\nGunakan format \`.editmk [ID] [hari/jam/singkatan/nama/ruangan/dosen] [nilai_baru]\`\nContoh: \`.editmk 1 hari Selasa\`\n\n**Daftar MK:**\n${list}`);
        }

        let mk = global.db.mk_si_2025[index - 1];
        let validFields = ['hari', 'jam', 'singkatan', 'nama', 'ruangan', 'dosen'];

        if (!validFields.includes(field)) {
            return message.reply(`Field tidak valid! Pilih salah satu: ${validFields.join(', ')}`);
        }

        let oldValue = mk[field];
        mk[field] = newValue;
        fs.writeFileSync('./Data/database.json', JSON.stringify(global.db, null, 2));

        message.reply(`✅ Berhasil mengedit MK **${mk.singkatan}**\n**${field}**: \`${oldValue}\` -> \`${newValue}\``);
    }
};
