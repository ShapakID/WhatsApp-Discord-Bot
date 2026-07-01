module.exports = {
    name: 'setpp',
    async execute(message, args) {
        const isOwner = message.author.id === '1202397666835701830';
        if (!isOwner) return message.reply("Khusus Owner bot ya!");

        let attachment = message.attachments.first();

        // Coba cari dari pesan yang di-reply jika tidak ada attachment di pesan ini
        if (!attachment && message.reference) {
            try {
                const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
                attachment = repliedMessage.attachments.first();
            } catch (e) {
                // Abaikan
            }
        }

        if (!attachment || !attachment.contentType.startsWith('image/')) {
            return message.reply("Kirim gambar atau reply gambar dengan caption `!setpp`");
        }

        const m = await message.reply("Sedang memproses dan mengganti Profile Picture Discord...");

        try {
            await message.client.user.setAvatar(attachment.url);
            await m.edit("Profile Picture bot Discord berhasil diganti!");
        } catch (err) {
            await m.edit(`Gagal ganti PP Discord: ${err.message}`);
        }
    }
};
