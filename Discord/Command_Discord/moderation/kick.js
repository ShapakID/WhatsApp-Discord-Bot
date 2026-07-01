const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'kick',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.reply('❌ Kamu nggak punya izin untuk nge-kick member!');
        }

        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('Harap tag user yang mau di-kick. Contoh: `.kick @user alasan`');
        }

        const targetMember = message.guild.members.cache.get(targetUser.id);
        if (!targetMember) {
            return message.reply('User tersebut tidak ada di server ini.');
        }

        if (!targetMember.kickable) {
            return message.reply('❌ Nggak bisa nge-kick user ini. Mungkin role-nya lebih tinggi dari bot atau bot kekurangan izin.');
        }

        let reason = args.slice(1).join(' ');
        if (!reason) reason = 'Tidak ada alasan.';

        try {
            await targetMember.kick(reason);
            message.channel.send(`✅ Berhasil nge-kick **${targetUser.tag}**.\nAlasan: ${reason}`);
        } catch (error) {
            console.error(error);
            message.reply('Terjadi kesalahan saat mencoba nge-kick user ini.');
        }
    }
};
