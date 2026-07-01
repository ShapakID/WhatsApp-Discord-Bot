module.exports = {
    name: 'listuser',
    async execute(message, args) {
        const isOwner = message.author.id === '1202397666835701830';
        if (!isOwner) return message.reply("Khusus Owner bot ya!");

        let users = Object.values(global.db.users || {});
        if (users.length === 0) return message.reply("Belum ada user yang register.");

        let teks = `**DAFTAR MAHASISWA TERDAFTAR**\nTotal: **${users.length}** Mahasiswa\n\n`;
        users.forEach((u, i) => {
            teks += `${i + 1}. **${u.namaLengkap || u.nama}**\n     NIM: ${u.nim || 'N/A'}\n     WA: ${u.nomor || 'N/A'}\n\n`;
        });

        // Memecah teks jika terlalu panjang karena limit Discord itu 2000 karakter
        if (teks.length > 2000) {
            let chunks = teks.match(/[\s\S]{1,1900}/g);
            for (let chunk of chunks) {
                await message.reply(chunk);
            }
        } else {
            message.reply(teks.trim());
        }
    }
};
