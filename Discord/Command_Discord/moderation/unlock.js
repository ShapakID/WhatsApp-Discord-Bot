const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'unlock',
    category: 'moderation',
    async execute(message, args) {
        // Hapus pesan command-nya biar rapi
        message.delete().catch(() => { });

        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ Kamu nggak punya izin untuk nge-unlock channel! (Butuh *Manage Channels*)');
            return message.channel.send({ embeds: [embed] }).then(msg => {
                setTimeout(() => msg.delete().catch(() => { }), 5000);
            });
        }

        const reason = args.length > 0 ? args.join(' ') : 'Tidak ada alasan yang diberikan.';

        try {
            await message.channel.permissionOverwrites.edit(message.guild.id, {
                SendMessages: null
            });

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🔓 Channel Unlocked')
                .setDescription(`**This channel was unlocked by:** <@${message.author.id}>\n**Reason:** ${reason}`)
                .setTimestamp()
                .setFooter({ text: `Unlocked by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            message.channel.send({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ Gagal nge-unlock channel. Pastikan bot punya role yang lebih tinggi dari member biasa dan punya permission Manage Channels/Roles.');
            message.channel.send({ embeds: [embed] });
        }
    }
};
