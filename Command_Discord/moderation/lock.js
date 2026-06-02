const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'lock',
    category: 'moderation',
    async execute(message, args) {
        // Hapus pesan command-nya (biar chat bersih)
        message.delete().catch(() => { });

        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ Kamu nggak punya izin untuk nge-lock channel! (Butuh *Manage Channels*)');
            return message.channel.send({ embeds: [embed] }).then(msg => {
                setTimeout(() => msg.delete().catch(() => { }), 5000); // Pesan error ilang sendiri dalam 5 detik
            });
        }

        const reason = args.length > 0 ? args.join(' ') : 'Tidak ada alasan yang diberikan.';

        try {
            await message.channel.permissionOverwrites.edit(message.guild.id, {
                SendMessages: false
            });

            const embed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('🔒 Channel Locked')
                .setDescription(`**This channel was locked by:** <@${message.author.id}>\n**Reason:** ${reason}`)
                .setTimestamp()
                .setFooter({ text: `Locked by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            message.channel.send({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ Gagal nge-lock channel. Pastikan bot punya role yang lebih tinggi dari member biasa dan punya permission Manage Channels/Roles.');
            message.channel.send({ embeds: [embed] });
        }
    }
};
