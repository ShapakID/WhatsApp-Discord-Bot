const fs = require('fs');
const path = require('path');
const { uploadToDrive } = require('../../lib/drive');

module.exports = {
    name: 'backupdb',
    execute: async (hydro, m, args, text, { isAdminBot, prefix }) => {
        // Cek izin (Hanya Admin Bot)
        if (!isAdminBot) {
            return hydro.sendMessage(m.chat, { text: "❌ Maaf, command ini khusus Admin Bot!" }, { quoted: m });
        }

        // Pesan status awal
        hydro.sendMessage(m.chat, { text: "Sedang memproses..." }, { quoted: m });

        try {
            // Path ke database
            const dbPath = path.resolve('./database/database.json');

            if (!fs.existsSync(dbPath)) {
                return hydro.sendMessage(m.chat, { text: "❌ File database.json tidak ditemukan di sistem!" }, { quoted: m });
            }

            // Baca file database sebagai Buffer
            const buffer = fs.readFileSync(dbPath);

            // Format tanggal untuk nama file
            const date = new Date();
            const dateStr = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
            const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // Format: HH-MM-SS

            const fileName = `Backup_DB_${dateStr}_${timeStr}.json`;
            const mimeType = 'application/json';

            // Upload ke Google Drive
            const publicLink = await uploadToDrive(buffer, fileName, mimeType);

            // Kirim link hasil ke WA
            hydro.sendMessage(m.chat, {
                text: `✅ *BACKUP DATABASE BERHASIL!*\n\n📁 *Nama File:* ${fileName}\n🔗 *Link Google Drive:*\n${publicLink}`
            }, { quoted: m });

        } catch (error) {
            console.error("Backup DB Error:", error);
            hydro.sendMessage(m.chat, { text: `❌ Gagal mem-backup database:\n${error.message}` }, { quoted: m });
        }
    }
};
