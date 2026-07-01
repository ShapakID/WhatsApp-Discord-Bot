const fs = require('fs');
const path = require('path');
const { uploadToDrive } = require('../../../lib/drive');

module.exports = {
    name: 'backupdb',
    async execute(message, args) {
        const isOwner = message.author.id === '1202397666835701830';
        if (!isOwner) return;

        const sent = await message.reply("Sedang memproses backup database...");

        try {
            const dbPath = path.resolve('./Data/database.json');
            if (!fs.existsSync(dbPath)) {
                return sent.edit("❌ File database.json tidak ditemukan di sistem!");
            }

            const buffer = fs.readFileSync(dbPath);
            const date = new Date();
            const dateStr = date.toISOString().split('T')[0];
            const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
            const fileName = `Backup_DB_${dateStr}_${timeStr}.json`;
            const mimeType = 'application/json';

            const publicLink = await uploadToDrive(buffer, fileName, mimeType);

            await sent.edit(`✅ **BACKUP DATABASE BERHASIL!**\n\n📁 **Nama File:** ${fileName}\n🔗 **Link Google Drive:**\n${publicLink}`);
        } catch (error) {
            console.error("Backup DB Error:", error);
            await sent.edit(`❌ Gagal mem-backup database:\n${error.message}`);
        }
    }
};
