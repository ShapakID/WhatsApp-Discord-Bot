const fs = require('fs');

module.exports = {
    name: 'resetmk',
    async execute(message, args) {
        const isOwner = message.author.id === '1202397666835701830';
        if (!isOwner) return;

        if (args[0] !== 'confirm') {
            return message.reply("⚠️ **KONFIRMASI RESET MK**\nYakin ingin mereset/menghapus semua jadwal MK?\nBalas dengan `.resetmk confirm` jika yakin.");
        }

        if (global.db.mk_si_2025.length === 0) {
            return message.reply("Daftar MK memang kosong.");
        }

        global.db.mk_si_2025 = [];
        fs.writeFileSync('./Data/database.json', JSON.stringify(global.db, null, 2));

        message.reply("✅ **Semua daftar Mata Kuliah berhasil direset!**");
    }
};
