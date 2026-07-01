const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'nuke',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('❌ Kamu nggak punya izin untuk ngatur (nuke) channel!');
        }

        const channel = message.channel;

        try {
            const position = channel.position;
            const newChannel = await channel.clone();

            await channel.delete('Nuked by ' + message.author.tag);

            await newChannel.setPosition(position);
            const nukeMsg = await newChannel.send(`🧨 **CHANNEL INI TELAH DI-NUKE OLEH ${message.author.toString()}!** 🧨\nhttps://media.giphy.com/media/HhTXt43pk1I1W/giphy.gif`);

            // Hapus pesan konfirmasi setelah 5 detik
            setTimeout(() => {
                nukeMsg.delete().catch(() => { });
            }, 5000);
        } catch (error) {
            console.error(error);
            message.reply('Terjadi kesalahan saat mencoba men-nuke channel ini. Pastikan bot punya izin `Manage Channels`.');
        }
    }
};
