const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'addlibur',
    category: 'owner',
    description: 'Menambahkan tanggal libur kampus kustom (format: YYYY-MM-DD)',
    async execute(message, args) {
        if (message.author.id !== '1202397666835701830') return message.reply('Khusus owner bot!');

        const dateStr = args[0];
        if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return message.reply('❌ Format salah! Gunakan: `.addlibur YYYY-MM-DD` (Contoh: `.addlibur 2026-06-05`)');
        }

        if (!global.db) global.db = {};
        if (!global.db.libur_kampus) global.db.libur_kampus = [];

        if (global.db.libur_kampus.includes(dateStr)) {
            return message.reply(`ℹ️ Tanggal ${dateStr} sudah ada di daftar libur kampus.`);
        }

        global.db.libur_kampus.push(dateStr);

        try {
            fs.writeFileSync(path.join(__dirname, '../../../Data/database.json'), JSON.stringify(global.db, null, 2));
        } catch (e) {
            console.error('Gagal save db:', e);
        }

        return message.reply(`✅ Tanggal ${dateStr} berhasil ditambahkan sebagai hari libur kampus.\nBot tidak akan mengirimkan pengingat jadwal MK untuk tanggal tersebut.`);
    }
};
