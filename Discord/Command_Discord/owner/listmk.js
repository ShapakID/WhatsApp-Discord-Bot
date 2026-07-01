const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'listmk',
    category: 'owner',
    execute: async (message, args) => {
        const isOwner = message.author.id === '1202397666835701830';
        if (!isOwner) return message.reply('❌ Khusus Owner bot ya!');

        if (!global.db || !global.db.mk_si_2025 || global.db.mk_si_2025.length === 0) {
            return message.reply('Belum ada daftar Mata Kuliah yang ditambahkan.');
        }

        const daysOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
        let listTeori = '';
        let listPrak = '';

        let groupedMk = {};
        let groupedPrak = {};

        // Pisahkan data MK dan Praktikum berdasarkan hari
        global.db.mk_si_2025.forEach((mk, i) => {
            let day = mk.hari.charAt(0).toUpperCase() + mk.hari.slice(1).toLowerCase();
            if (!groupedMk[day]) groupedMk[day] = [];
            groupedMk[day].push({ ...mk, id: i });

            if (mk.praktikum && mk.praktikum.hari !== '-') {
                let prakDay = mk.praktikum.hari.charAt(0).toUpperCase() + mk.praktikum.hari.slice(1).toLowerCase();
                if (!groupedPrak[prakDay]) groupedPrak[prakDay] = [];
                groupedPrak[prakDay].push({ ...mk, id: i });
            }
        });

        // 1. Render Jadwal Teori
        daysOrder.forEach(day => {
            if (groupedMk[day] && groupedMk[day].length > 0) {
                listTeori += `**📅 HARI ${day.toUpperCase()}**\n`;
                groupedMk[day].forEach(mk => {
                    listTeori += `◦ [${mk.jam}] **ID: ${mk.id + 1}** - **${mk.singkatan}**\n  ${mk.nama}\n  📍 ${mk.ruangan} | 👨‍🏫 ${mk.dosen}\n\n`;
                });
            }
        });

        // 2. Render Jadwal Praktikum
        if (Object.keys(groupedPrak).length > 0) {
            daysOrder.forEach(day => {
                if (groupedPrak[day] && groupedPrak[day].length > 0) {
                    listPrak += `**📅 HARI ${day.toUpperCase()}**\n`;
                    groupedPrak[day].forEach(mk => {
                        listPrak += `◦ [${mk.praktikum.jam}] **ID: ${mk.id + 1}** - **${mk.singkatan}**\n  Praktikum ${mk.nama}\n  📍 ${mk.praktikum.ruangan}\n\n`;
                    });
                }
            });
        }

        const embeds = [];

        if (listTeori) {
            embeds.push(new EmbedBuilder()
                .setTitle('📚 MATA KULIAH (TEORI)')
                .setColor('#0099ff')
                .setDescription(listTeori)
            );
        }

        if (listPrak) {
            embeds.push(new EmbedBuilder()
                .setTitle('🧪 JADWAL PRAKTIKUM')
                .setColor('#ff9900')
                .setDescription(listPrak)
            );
        }

        message.reply({ embeds });
    }
};
