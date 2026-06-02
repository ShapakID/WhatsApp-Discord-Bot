const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'purge',
    aliases: ['clear'],
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('❌ Kamu nggak punya izin untuk nge-clear pesan!');
        }

        const amountRaw = args[0];
        if (!amountRaw || isNaN(amountRaw)) {
            return message.reply('Harap tentukan jumlah pesan yang mau dihapus (1-100). Contoh: `.clear 10`');
        }

        const amount = parseInt(amountRaw);
        if (amount < 1 || amount > 100) {
            return message.reply('Kamu hanya bisa menghapus 1 hingga 100 pesan sekaligus!');
        }

        try {
            // Karena command delete akan ikut terhapus kalau ada di 100 terakhir, kita hapus (amount + 1) kalo bisa,
            // atau fetch aja sejumlah amount
            await message.delete().catch(() => { }); // hapus pesan commandnya dulu

            const deletedMessages = await message.channel.bulkDelete(amount, true);

            const replyMsg = await message.channel.send(`🧹 Berhasil menghapus **${deletedMessages.size}** pesan!`);

            // Hapus pesan konfirmasi setelah 3 detik
            setTimeout(() => {
                replyMsg.delete().catch(() => { });
            }, 3000);

        } catch (error) {
            console.error(error);
            message.channel.send('Terjadi kesalahan saat menghapus pesan. (Pesan yang lebih dari 14 hari tidak bisa dihapus massal)');
        }
    }
};
